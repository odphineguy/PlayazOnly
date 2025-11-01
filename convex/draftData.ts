import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
// VOR (Value Over Replacement) helpers
type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DST';
type ReplacementMap = Record<Position, number>;
type ExpectedVorMap = Record<Position, Record<number, number>>; // position -> pick -> expected VOR

const REPLACEMENT_THRESHOLDS: Record<Position, number> = {
  QB: 12,
  RB: 36,
  WR: 36,
  TE: 12,
  K: 12,
  DST: 12,
};

function normalizePosition(p: string): Position {
  const up = (p || 'RB').toUpperCase();
  if (up === 'D/ST' || up === 'DEF') return 'DST';
  if (['QB','RB','WR','TE','K','DST'].includes(up)) return up as Position;
  return 'RB';
}

function computeReplacementLevels(
  playerSeasonPoints: Map<string, number>,
  allDraftPicks: Array<any>,
  playerMap: Map<string, any>
): ReplacementMap {
  // Aggregate per-season, per-position totals to find replacement rank value, then average across seasons
  const seasonPositionToPoints: Record<string, Record<Position, Array<number>>> = {};
  for (const pick of allDraftPicks) {
    const player = playerMap.get(pick.playerId);
    if (!player) continue;
    const pos = normalizePosition(player.position);
    const key = `${pick.seasonId}`;
    const points = playerSeasonPoints.get(`${pick.playerId}_${pick.seasonId}`) || 0;
    if (!seasonPositionToPoints[key]) seasonPositionToPoints[key] = { QB: [], RB: [], WR: [], TE: [], K: [], DST: [] };
    seasonPositionToPoints[key][pos].push(points);
  }

  const replacementSamples: Record<Position, Array<number>> = { QB: [], RB: [], WR: [], TE: [], K: [], DST: [] };
  for (const seasonId in seasonPositionToPoints) {
    const byPos = seasonPositionToPoints[seasonId];
    (Object.keys(byPos) as Array<Position>).forEach((pos) => {
      const arr = byPos[pos].sort((a, b) => b - a);
      if (arr.length === 0) return;
      const threshold = REPLACEMENT_THRESHOLDS[pos];
      // pick value at rank (1-indexed). If not enough players, take last
      const idx = Math.min(threshold, arr.length) - 1;
      const atRank = arr[idx];
      // average with neighbor if available for a smoother estimate
      const neighbor = arr[Math.min(idx + 1, arr.length - 1)];
      replacementSamples[pos].push((atRank + neighbor) / 2);
    });
  }

  const replacement: ReplacementMap = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DST: 0 };
  (Object.keys(replacement) as Array<Position>).forEach((pos) => {
    const samples = replacementSamples[pos];
    replacement[pos] = samples.length > 0
      ? parseFloat((samples.reduce((s, x) => s + x, 0) / samples.length).toFixed(2))
      : 0;
  });
  return replacement;
}

function buildExpectedVorMap(
  allDraftPicks: Array<any>,
  playerSeasonPoints: Map<string, number>,
  playerMap: Map<string, any>,
  replacement: ReplacementMap
): ExpectedVorMap {
  const byPosByPick: Record<Position, Record<number, Array<number>>> = {
    QB: {}, RB: {}, WR: {}, TE: {}, K: {}, DST: {}
  };
  for (const pick of allDraftPicks) {
    const player = playerMap.get(pick.playerId);
    if (!player) continue;
    const pos = normalizePosition(player.position);
    const points = playerSeasonPoints.get(`${pick.playerId}_${pick.seasonId}`) || 0;
    const vor = points - replacement[pos];
    if (!byPosByPick[pos][pick.overallPick]) byPosByPick[pos][pick.overallPick] = [];
    byPosByPick[pos][pick.overallPick].push(vor);
  }

  const expected: ExpectedVorMap = { QB: {}, RB: {}, WR: {}, TE: {}, K: {}, DST: {} };
  (Object.keys(byPosByPick) as Array<Position>).forEach((pos) => {
    const picks = byPosByPick[pos];
    for (const pickStr in picks) {
      const pickNum = Number(pickStr);
      const arr = picks[pickNum];
      const avg = arr.reduce((s, x) => s + x, 0) / arr.length;
      expected[pos][pickNum] = parseFloat(avg.toFixed(2));
    }
  });
  return expected;
}

function getExpectedVorAtPick(
  expectedVor: ExpectedVorMap,
  position: string,
  pickNumber: number
): number {
  const pos = normalizePosition(position);
  const table = expectedVor[pos];
  if (table[pickNumber] !== undefined) return table[pickNumber];
  // fallback: window average within +/- 5 picks
  const window = 5;
  let sum = 0, count = 0;
  for (let d = 1; d <= window; d++) {
    if (table[pickNumber - d] !== undefined) { sum += table[pickNumber - d]; count++; }
    if (table[pickNumber + d] !== undefined) { sum += table[pickNumber + d]; count++; }
  }
  if (count > 0) return parseFloat((sum / count).toFixed(2));
  // last resort
  return 0;
}

// Calibration: scale pick values so AVG. PICK VALUE lands in a friendly range
const TARGET_AVG_PICK_ABS = 25; // aim for ~25 points per pick on average for better spread
function computeCalibrationScale(pickValues: Array<number>): number {
  const avgAbs = pickValues.length > 0
    ? pickValues.reduce((s, v) => s + Math.abs(v), 0) / pickValues.length
    : 0;
  if (avgAbs <= 0.0001) return 1;
  return TARGET_AVG_PICK_ABS / avgAbs;
}

// Import draft data from ESPN JSON files
export const importDraftData = mutation({
  args: {
    year: v.number(),
    draftPicks: v.array(v.object({
      round_num: v.number(),
      round_pick: v.number(),
      overall_pick: v.number(),
      team_id: v.number(),
      team_name: v.string(),
      player_name: v.string(),
      player_id: v.number(),
      position: v.string(),
      nfl_team: v.optional(v.union(v.string(), v.null())),
    }))
  },
  handler: async (ctx, args) => {
    const { year, draftPicks } = args;
    
    // Find or create the season for this year
    const existingSeason = await ctx.db
      .query("seasons")
      .withIndex("byYear", (q) => q.eq("year", year))
      .first();
    
    if (!existingSeason) {
      throw new Error(`Season ${year} not found. Please import league data first.`);
    }
    
    // Find the league (use the existing league from the season)
    let league = existingSeason.leagueId ? await ctx.db.get(existingSeason.leagueId) : null;
    if (!league) {
      // If league not found by season's leagueId, try to find any "Playaz Only" league
      const fallbackLeague = await ctx.db.query("leagues")
        .filter((q) => q.eq(q.field("name"), "Playaz Only"))
        .first();
      if (!fallbackLeague) {
        throw new Error("League not found");
      }
      // Update the season to use the correct league
      await ctx.db.patch(existingSeason._id, { leagueId: fallbackLeague._id });
      league = fallbackLeague;
    }
    
    // Get all teams for this season
    const teams = await ctx.db
      .query("teams")
      .withIndex("bySeason", (q) => q.eq("seasonId", existingSeason._id))
      .collect();
    
    // Create a map of team names to team IDs
    const teamNameToId = new Map();
    teams.forEach(team => {
      teamNameToId.set(team.name, team._id);
    });
    
    // Import each draft pick
    const importedPicks = [];
    for (const pick of draftPicks) {
      // Find the team by name
      const teamId = teamNameToId.get(pick.team_name);
      if (!teamId) {
        console.warn(`Team "${pick.team_name}" not found for pick ${pick.overall_pick}`);
        continue;
      }
      
      // Create or find the player
      let playerId;
      const existingPlayer = await ctx.db
        .query("players")
        .withIndex("byEspnPlayerId", (q) => q.eq("espnPlayerId", pick.player_id))
        .first();
      
      if (existingPlayer) {
        playerId = existingPlayer._id;
      } else {
        // Trust the source position and normalize a few variants
        const normalizePosition = (p: string | undefined): string => {
          if (!p) return "RB"; // fallback
          const up = p.toUpperCase();
          if (up === "DEF" || up === "D/ST" || up === "DST") return "DST";
          if (up === "PK") return "K";
          if (["QB","RB","WR","TE","K","DST"].includes(up)) return up;
          return "RB";
        };
        const position = normalizePosition(pick.position);

        playerId = await ctx.db.insert("players", {
          name: pick.player_name,
          position: position,
          team: pick.nfl_team || undefined,
          espnPlayerId: pick.player_id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
      
      // Create the draft pick
      const draftPickId = await ctx.db.insert("draftPicks", {
        leagueId: existingSeason.leagueId ?? undefined,
        seasonId: existingSeason._id,
        teamId: teamId,
        playerId: playerId,
        round: pick.round_num,
        pick: pick.round_pick,
        overallPick: pick.overall_pick,
        createdAt: Date.now(),
      });
      
      importedPicks.push(draftPickId);
    }
    
    return {
      message: `Imported ${importedPicks.length} draft picks for ${year}`,
      picksImported: importedPicks.length,
      seasonId: existingSeason._id,
      leagueId: existingSeason.leagueId ?? undefined
    };
  },
});

// Get all-time draft statistics
export const getAllTimeDraftStats = query({
  args: { year: v.optional(v.number()), memberName: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Get all draft picks across all seasons
    const allDraftPicks = await ctx.db.query("draftPicks").collect();

    if (allDraftPicks.length === 0) {
      return {
        totalPicks: 0,
        avgPickValue: 0,
        avgTeamValue: 0,
        avgSeasonValue: 0,
        totalSeasons: 0,
        totalTeams: 0
      };
    }

    // Get all seasons, teams, players, owners
    const [seasons, teams, players, owners] = await Promise.all([
      ctx.db.query("seasons").collect(),
      ctx.db.query("teams").collect(),
      ctx.db.query("players").collect(),
      ctx.db.query("owners").collect(),
    ]);

    const playerMap = new Map(players.map(p => [p._id, p]));
    const ownerMap = new Map(owners.map(o => [o._id, o]));

    // Get all roster entries to calculate actual fantasy points
    const rosterEntries = await ctx.db.query("rosterEntries").collect();

    // Create a map: playerId+seasonId -> total points
    const playerSeasonPoints = new Map<string, number>();
    rosterEntries.forEach(entry => {
      const key = `${entry.playerId}_${entry.seasonId}`;
      const currentPoints = playerSeasonPoints.get(key) || 0;
      playerSeasonPoints.set(key, currentPoints + entry.points);
    });

    // Helper: expected points curve by overall pick
    const expectedPointsAtPick = (overallPick: number) => 180 * Math.exp(-0.012 * (overallPick - 1));

    // Optional filters
    const seasonMap = new Map(seasons.map(s => [s._id, s]));
    const memberName = args?.memberName;
    const year = args?.year;

    // Calculate ratio-based pick values
    const pickValues: number[] = [];
    const teamSums = new Map<string, number>();
    const seasonSums = new Map<string, number>();

    allDraftPicks.forEach(pick => {
      const player = playerMap.get(pick.playerId);
      if (!player) return;

      // Filter by year if provided
      if (year) {
        const season = seasonMap.get(pick.seasonId);
        if (!season || season.year !== year) return;
      }

      // Filter by memberName if provided
      if (memberName) {
        const team = teams.find(t => t._id === pick.teamId);
        const owner = team ? ownerMap.get(team.ownerId) : null;
        const ownerDisplay = owner?.displayName || team?.name;
        if (!ownerDisplay || ownerDisplay !== memberName) return;
      }

      const key = `${pick.playerId}_${pick.seasonId}`;
      const actualPoints = playerSeasonPoints.get(key) || 0;
      const expectedPoints = expectedPointsAtPick(pick.overallPick);
      const ratio = expectedPoints > 0 ? actualPoints / expectedPoints : 0;

      pickValues.push(ratio);

      // Track sums by team
      teamSums.set(pick.teamId, (teamSums.get(pick.teamId) || 0) + ratio);
      // Track sums by season
      seasonSums.set(pick.seasonId, (seasonSums.get(pick.seasonId) || 0) + ratio);
    });

    const avgPickValue = pickValues.length > 0
      ? pickValues.reduce((sum, val) => sum + val, 0) / pickValues.length
      : 0;

    // Avg team value: average of team sums (not absolute), as requested
    const avgTeamValue = teamSums.size > 0
      ? Array.from(teamSums.values()).reduce((s, v) => s + v, 0) / teamSums.size
      : 0;

    // Avg season value (sum of all values) across filters; if filtering by year, this will be that season's total
    const avgSeasonValue = Array.from(seasonSums.values()).reduce((s, v) => s + v, 0);

    return {
      totalPicks: allDraftPicks.length,
      avgPickValue: parseFloat(avgPickValue.toFixed(2)),
      avgTeamValue: parseFloat(avgTeamValue.toFixed(2)),
      avgSeasonValue: parseFloat(avgSeasonValue.toFixed(2)),
      totalSeasons: seasons.length,
      totalTeams: teams.length
    };
  },
});

// Get draft value by position and year
export const getDraftValueByPosition = query({
  args: { year: v.optional(v.number()), memberName: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const [allDraftPicks, players, seasons, rosterEntries, teams, owners] = await Promise.all([
      ctx.db.query("draftPicks").collect(),
      ctx.db.query("players").collect(),
      ctx.db.query("seasons").collect(),
      ctx.db.query("rosterEntries").collect(),
      ctx.db.query("teams").collect(),
      ctx.db.query("owners").collect(),
    ]);

    // Create maps for quick lookup
    const playerMap = new Map(players.map(p => [p._id, p]));
    const seasonMap = new Map(seasons.map(s => [s._id, s]));
    const ownerMap = new Map(owners.map(o => [o._id, o]));

    // Create a map: playerId+seasonId -> total points
    const playerSeasonPoints = new Map<string, number>();
    rosterEntries.forEach(entry => {
      const key = `${entry.playerId}_${entry.seasonId}`;
      const currentPoints = playerSeasonPoints.get(key) || 0;
      playerSeasonPoints.set(key, currentPoints + entry.points);
    });

    // Group by year and position using ratio-based value
    const dataByYear = new Map();
    const expectedPointsAtPick = (overallPick: number) => 180 * Math.exp(-0.012 * (overallPick - 1));

    // Build team owner name map for member filtering
    const teamMap = new Map(teams.map(t => [t._id, t]));

    allDraftPicks.forEach(pick => {
      const player = playerMap.get(pick.playerId);
      const season = seasonMap.get(pick.seasonId);

      if (!player || !season) return;

      // Filters
      if (args?.year && season.year !== args.year) return;
      if (args?.memberName) {
        const team = teamMap.get(pick.teamId);
        const owner = team ? ownerMap.get(team.ownerId) : null;
        const ownerDisplay = owner?.displayName || team?.name;
        if (!ownerDisplay || ownerDisplay !== args.memberName) return;
      }

      // Get actual points and calculate ratio-based pick value
      const key = `${pick.playerId}_${pick.seasonId}`;
      const actualPoints = playerSeasonPoints.get(key) || 0;
      const expected = expectedPointsAtPick(pick.overallPick);
      const pickValue = expected > 0 ? actualPoints / expected : 0;

      const year = season.year;
      if (!dataByYear.has(year)) {
        dataByYear.set(year, new Map());
      }

      const yearData = dataByYear.get(year);
      if (!yearData.has(player.position)) {
        yearData.set(player.position, []);
      }

      yearData.get(player.position).push(pickValue);
    });

    // Convert to chart data
    const chartData: any[] = [];
    const years = Array.from(dataByYear.keys()).sort();
    const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DST'];

    years.forEach(year => {
      const yearData = dataByYear.get(year);
      const yearEntry: any = { year: year.toString() };

      positions.forEach(position => {
        const pickValues = yearData.get(position) || [];
        const totalValue = pickValues.reduce((sum: number, val: number) => sum + val, 0);
        const avgValue = pickValues.length > 0 ? totalValue / pickValues.length : 0;

        yearEntry[`${position}_total`] = parseFloat(totalValue.toFixed(2));
        yearEntry[`${position}_avg`] = parseFloat(avgValue.toFixed(2));
      });

      chartData.push(yearEntry);
    });

    return chartData;
  },
});

// Get top picks all-time
export const getTopPicksAllTime = query({
  args: { limit: v.optional(v.number()), position: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const [allDraftPicks, players, teams, seasons, rosterEntries] = await Promise.all([
      ctx.db.query("draftPicks").collect(),
      ctx.db.query("players").collect(),
      ctx.db.query("teams").collect(),
      ctx.db.query("seasons").collect(),
      ctx.db.query("rosterEntries").collect(),
    ]);

    // Create maps for quick lookup
    const playerMap = new Map(players.map(p => [p._id, p]));
    const teamMap = new Map(teams.map(t => [t._id, t]));
    const seasonMap = new Map(seasons.map(s => [s._id, s]));

    // Create a map: playerId+seasonId -> total points
    const playerSeasonPoints = new Map<string, number>();
    rosterEntries.forEach(entry => {
      const key = `${entry.playerId}_${entry.seasonId}`;
      const currentPoints = playerSeasonPoints.get(key) || 0;
      playerSeasonPoints.set(key, currentPoints + entry.points);
    });

    // Build VOR context
    const replacement = computeReplacementLevels(playerSeasonPoints, allDraftPicks, playerMap);
    const expectedVor = buildExpectedVorMap(allDraftPicks, playerSeasonPoints, playerMap, replacement);

    // Calculate VOR-based value for each pick
    const picksWithValue = allDraftPicks.map(pick => {
      const player = playerMap.get(pick.playerId);
      const team = teamMap.get(pick.teamId);
      const season = seasonMap.get(pick.seasonId);

      if (!player || !team || !season) return null;
      if (args.position && normalizePosition(player.position) !== normalizePosition(args.position)) return null;

      // Get actual points and calculate pick value
      const key = `${pick.playerId}_${pick.seasonId}`;
      const actualPoints = playerSeasonPoints.get(key) || 0;
      const pos = normalizePosition(player.position);
      const vor = actualPoints - replacement[pos];
      const expected = getExpectedVorAtPick(expectedVor, pos, pick.overallPick);
      const value = vor - expected;

      return {
        ...pick,
        player,
        team,
        season,
        value // scale later
      };
    }).filter(Boolean);

    // Deduplicate by composite key to avoid duplicates in UI (season, player, team, overallPick)
    const seen = new Set<string>();
    const uniquePicks = (picksWithValue
      .filter((pick): pick is NonNullable<typeof pick> => pick !== null) as Array<any>)
      .filter((p) => {
        const key = `${p.season._id}_${p.player._id}_${p.team._id}_${p.overallPick}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    // Scale values to target magnitude (consistent across dataset)
    const rawValues = uniquePicks.map(p => (p as any).value as number);
    const scale = computeCalibrationScale(rawValues);
    const scaled = uniquePicks
      .map(p => ({ ...p, value: parseFloat(((p as any).value * scale).toFixed(2)) }));

    // Sort by value (highest first) and take top picks
    return scaled
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  },
});

// Get worst picks all-time
export const getWorstPicksAllTime = query({
  args: { limit: v.optional(v.number()), position: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const [allDraftPicks, players, teams, seasons, rosterEntries] = await Promise.all([
      ctx.db.query("draftPicks").collect(),
      ctx.db.query("players").collect(),
      ctx.db.query("teams").collect(),
      ctx.db.query("seasons").collect(),
      ctx.db.query("rosterEntries").collect(),
    ]);

    // Create maps for quick lookup
    const playerMap = new Map(players.map(p => [p._id, p]));
    const teamMap = new Map(teams.map(t => [t._id, t]));
    const seasonMap = new Map(seasons.map(s => [s._id, s]));

    // Create a map: playerId+seasonId -> total points
    const playerSeasonPoints = new Map<string, number>();
    rosterEntries.forEach(entry => {
      const key = `${entry.playerId}_${entry.seasonId}`;
      const currentPoints = playerSeasonPoints.get(key) || 0;
      playerSeasonPoints.set(key, currentPoints + entry.points);
    });

    // Build VOR context
    const replacement = computeReplacementLevels(playerSeasonPoints, allDraftPicks, playerMap);
    const expectedVor = buildExpectedVorMap(allDraftPicks, playerSeasonPoints, playerMap, replacement);

    // Calculate VOR-based value for each pick
    const picksWithValue = allDraftPicks.map(pick => {
      const player = playerMap.get(pick.playerId);
      const team = teamMap.get(pick.teamId);
      const season = seasonMap.get(pick.seasonId);

      if (!player || !team || !season) return null;
      if (args.position && normalizePosition(player.position) !== normalizePosition(args.position)) return null;

      // Get actual points and calculate pick value
      const key = `${pick.playerId}_${pick.seasonId}`;
      const actualPoints = playerSeasonPoints.get(key) || 0;
      const pos = normalizePosition(player.position);
      const vor = actualPoints - replacement[pos];
      const expected = getExpectedVorAtPick(expectedVor, pos, pick.overallPick);
      const value = vor - expected;

      return {
        ...pick,
        player,
        team,
        season,
        value // scale later
      };
    }).filter(Boolean);

    // Deduplicate by composite key to avoid duplicates in UI (season, player, team, overallPick)
    const seen = new Set<string>();
    const uniquePicks = (picksWithValue
      .filter((pick): pick is NonNullable<typeof pick> => pick !== null) as Array<any>)
      .filter((p) => {
        const key = `${p.season._id}_${p.player._id}_${p.team._id}_${p.overallPick}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    // Scale values
    const rawValues = uniquePicks.map(p => (p as any).value as number);
    const scale = computeCalibrationScale(rawValues);
    const scaled = uniquePicks
      .map(p => ({ ...p, value: parseFloat(((p as any).value * scale).toFixed(2)) }));

    // Sort by value (lowest first) and take worst picks
    return scaled
      .sort((a, b) => a.value - b.value)
      .slice(0, limit);
  },
});

// Get all-time draft rankings by team
export const getAllTimeDraftRankings = query({
  args: { limit: v.optional(v.number()), position: v.optional(v.string()), minPicks: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const minPicks = args.minPicks ?? 128;
    const [allDraftPicks, players, teams, rosterEntries, owners] = await Promise.all([
      ctx.db.query("draftPicks").collect(),
      ctx.db.query("players").collect(),
      ctx.db.query("teams").collect(),
      ctx.db.query("rosterEntries").collect(),
      ctx.db.query("owners").collect(),
    ]);

    const playerMap = new Map(players.map(p => [p._id, p]));
    const ownerMap = new Map(owners.map(o => [o._id, o]));

    // Create a map: playerId+seasonId -> total points
    const playerSeasonPoints = new Map<string, number>();
    rosterEntries.forEach(entry => {
      const key = `${entry.playerId}_${entry.seasonId}`;
      const currentPoints = playerSeasonPoints.get(key) || 0;
      playerSeasonPoints.set(key, currentPoints + entry.points);
    });

    // Build VOR context
    const replacement = computeReplacementLevels(playerSeasonPoints, allDraftPicks, playerMap);
    const expectedVor = buildExpectedVorMap(allDraftPicks, playerSeasonPoints, playerMap, replacement);

    // Group picks by owner name across all seasons
    type OwnerAgg = { name: string; values: Array<number>; seasons: Set<string> };
    const ownerPicks = new Map<string, OwnerAgg>();
    const allValues: number[] = [];
    allDraftPicks.forEach(pick => {
      const player = playerMap.get(pick.playerId);
      if (!player) return;
      if (args.position && normalizePosition(player.position) !== normalizePosition(args.position)) return;

      // Get actual points and calculate pick value
      const key = `${pick.playerId}_${pick.seasonId}`;
      const actualPoints = playerSeasonPoints.get(key) || 0;
      const pos = normalizePosition(player.position);
      const vor = actualPoints - replacement[pos];
      const expected = getExpectedVorAtPick(expectedVor, pos, pick.overallPick);
      const pickValue = vor - expected;
      allValues.push(pickValue);

      const team = teams.find(t => t._id === pick.teamId);
      const owner = team ? ownerMap.get(team.ownerId) : null;
      const ownerName = owner?.displayName || team?.name || "Unknown";
      const ownerKey = ownerName.toString();
      if (!ownerPicks.has(ownerKey)) ownerPicks.set(ownerKey, { name: ownerName, values: [], seasons: new Set<string>() });
      const agg = ownerPicks.get(ownerKey)!;
      agg.values.push(pickValue);
      agg.seasons.add(String(pick.seasonId));
    });

    const scale = computeCalibrationScale(allValues);

    // Calculate average value for each owner
    const teamRankings: Array<{
      team: any;
      avgValue: number;
      totalPicks: number;
      totalSeasons: number;
    }> = [];
    ownerPicks.forEach((agg, ownerKey) => {
      if (agg.values.length < minPicks) return; // enforce minimum picks rule
      const totalValue = agg.values.reduce((sum: number, val: number) => sum + val * scale, 0);
      const avgValue = totalValue / agg.values.length;
      const team = { _id: ownerKey, name: agg.name, ownerDisplayName: agg.name };
      teamRankings.push({
        team,
        avgValue: parseFloat(avgValue.toFixed(2)),
        totalPicks: agg.values.length,
        totalSeasons: agg.seasons.size,
      });
    });

    // Sort by average value (highest first)
    return teamRankings
      .sort((a, b) => b.avgValue - a.avgValue)
      .slice(0, limit);
  },
});

// Get position averages across all time
export const getPositionAverages = query({
  args: { position: v.string() },
  handler: async (ctx, args) => {
    const [allDraftPicks, players, rosterEntries] = await Promise.all([
      ctx.db.query("draftPicks").collect(),
      ctx.db.query("players").collect(),
      ctx.db.query("rosterEntries").collect(),
    ]);

    const playerMap = new Map(players.map(p => [p._id, p]));

    // Create a map: playerId+seasonId -> total points
    const playerSeasonPoints = new Map<string, number>();
    rosterEntries.forEach(entry => {
      const key = `${entry.playerId}_${entry.seasonId}`;
      const currentPoints = playerSeasonPoints.get(key) || 0;
      playerSeasonPoints.set(key, currentPoints + entry.points);
    });

    // Filter picks for this position
    const picks = allDraftPicks.filter(p => {
      const player = playerMap.get(p.playerId);
      return player && player.position === args.position;
    });

    if (picks.length === 0) {
      return { avgDraftValue: 0, avgDraftRound: 0, totalPicks: 0 };
    }

    // Calculate position-specific draft statistics
    const expectedPointsAtPick = (overallPick: number) => 180 * Math.exp(-0.012 * (overallPick - 1));

    let totalRatio = 0;
    let totalRounds = 0;
    let validPicks = 0;

    picks.forEach(pick => {
      const key = `${pick.playerId}_${pick.seasonId}`;
      const actualPoints = playerSeasonPoints.get(key) || 0;
      const expected = expectedPointsAtPick(pick.overallPick);

      // Calculate ratio of actual to expected points
      if (expected > 0) {
        const ratio = actualPoints / expected;
        totalRatio += ratio;
        validPicks++;
      }

      totalRounds += pick.round;
    });

    // Scale the average ratio to be in the 3.5-4.5 range
    // Average ratio is typically around 0.8-1.2, so multiply by ~4 to get to 3.5-4.5 range
    const avgRatio = validPicks > 0 ? totalRatio / validPicks : 1;
    const scaledValue = avgRatio * 4;

    return {
      avgDraftValue: parseFloat(scaledValue.toFixed(2)),
      avgDraftRound: parseFloat((totalRounds / picks.length).toFixed(2)),
      totalPicks: picks.length,
    };
  },
});

// Update player positions from position mapping
export const updatePlayerPositions = mutation({
  args: {
    positionMapping: v.array(v.object({
      playerName: v.string(),
      position: v.string(),
    }))
  },
  handler: async (ctx, args) => {
    const { positionMapping } = args;
    let updatedCount = 0;
    let notFoundCount = 0;
    const notFound: string[] = [];

    // Create a map for quick lookup (case-insensitive)
    const positionMap = new Map();
    positionMapping.forEach(({ playerName, position }) => {
      positionMap.set(playerName.toLowerCase().trim(), position);
    });

    // Get all players
    const allPlayers = await ctx.db.query("players").collect();

    // Update each player's position if found in mapping
    for (const player of allPlayers) {
      const normalizedName = player.name.toLowerCase().trim();
      const correctPosition = positionMap.get(normalizedName);

      if (correctPosition && correctPosition !== player.position) {
        await ctx.db.patch(player._id, {
          position: correctPosition,
          updatedAt: Date.now()
        });
        updatedCount++;
      } else if (!correctPosition) {
        notFoundCount++;
        notFound.push(player.name);
      }
    }

    return {
      message: `Updated ${updatedCount} players. ${notFoundCount} players not found in mapping.`,
      updatedCount,
      notFoundCount,
      totalPlayers: allPlayers.length,
      notFoundPlayers: notFound.slice(0, 20) // Return first 20 not found
    };
  },
});

// Clear all draft data
export const clearAllDraftData = mutation({
  args: {},
  handler: async (ctx) => {
    const draftPicks = await ctx.db.query("draftPicks").collect();
    const players = await ctx.db.query("players").collect();

    // Delete all draft picks
    for (const pick of draftPicks) {
      await ctx.db.delete(pick._id);
    }

    // Delete all players
    for (const player of players) {
      await ctx.db.delete(player._id);
    }

    return {
      message: "All draft data cleared successfully!",
      draftPicksDeleted: draftPicks.length,
      playersDeleted: players.length
    };
  },
});

// Get most drafted player (player with most draft appearances)
export const getMostDraftedPlayer = query({
  args: {},
  handler: async (ctx) => {
    const [allDraftPicks, players] = await Promise.all([
      ctx.db.query("draftPicks").collect(),
      ctx.db.query("players").collect(),
    ]);

    const playerMap = new Map(players.map(p => [p._id, p]));
    const playerCounts = new Map<string, number>();

    // Count drafts per player
    allDraftPicks.forEach(pick => {
      const player = playerMap.get(pick.playerId);
      if (player) {
        const current = playerCounts.get(pick.playerId) || 0;
        playerCounts.set(pick.playerId, current + 1);
      }
    });

    // Find player with most drafts
    let maxCount = 0;
    let mostDraftedPlayerId: any = null;
    playerCounts.forEach((count, playerId) => {
      if (count > maxCount) {
        maxCount = count;
        mostDraftedPlayerId = playerId as any;
      }
    });

    if (!mostDraftedPlayerId) {
      return { player: null, count: 0 };
    }

    return {
      player: playerMap.get(mostDraftedPlayerId),
      count: maxCount
    };
  },
});

// Get player with most total value across all drafts
export const getMostValuablePlayer = query({
  args: {},
  handler: async (ctx) => {
    const [allDraftPicks, players, rosterEntries] = await Promise.all([
      ctx.db.query("draftPicks").collect(),
      ctx.db.query("players").collect(),
      ctx.db.query("rosterEntries").collect(),
    ]);

    const playerMap = new Map(players.map(p => [p._id, p]));
    
    // Create a map: playerId+seasonId -> total points
    const playerSeasonPoints = new Map<string, number>();
    rosterEntries.forEach(entry => {
      const key = `${entry.playerId}_${entry.seasonId}`;
      const currentPoints = playerSeasonPoints.get(key) || 0;
      playerSeasonPoints.set(key, currentPoints + entry.points);
    });

    // Build VOR context
    const replacement = computeReplacementLevels(playerSeasonPoints, allDraftPicks, playerMap);
    const expectedVor = buildExpectedVorMap(allDraftPicks, playerSeasonPoints, playerMap, replacement);

    // Calculate total value per player
    const playerValues = new Map<string, number>();
    const allValues: number[] = [];

    allDraftPicks.forEach(pick => {
      const player = playerMap.get(pick.playerId);
      if (!player) return;

      const key = `${pick.playerId}_${pick.seasonId}`;
      const actualPoints = playerSeasonPoints.get(key) || 0;
      const pos = normalizePosition(player.position);
      const vor = actualPoints - replacement[pos];
      const expected = getExpectedVorAtPick(expectedVor, pos, pick.overallPick);
      const pickValue = vor - expected;
      allValues.push(pickValue);

      const current = playerValues.get(pick.playerId) || 0;
      playerValues.set(pick.playerId, current + pickValue);
    });

    const scale = computeCalibrationScale(allValues);

    // Find player with highest total value
    let maxValue = -Infinity;
    let mostValuablePlayerId: any = null;
    playerValues.forEach((value, playerId) => {
      const scaledValue = value * scale;
      if (scaledValue > maxValue) {
        maxValue = scaledValue;
        mostValuablePlayerId = playerId as any;
      }
    });

    if (!mostValuablePlayerId) {
      return { player: null, totalValue: 0 };
    }

    return {
      player: playerMap.get(mostValuablePlayerId),
      totalValue: parseFloat(maxValue.toFixed(2))
    };
  },
});

// Get most drafted NFL team (by player's NFL team field)
export const getMostDraftedTeam = query({
  args: {},
  handler: async (ctx) => {
    const [allDraftPicks, players] = await Promise.all([
      ctx.db.query("draftPicks").collect(),
      ctx.db.query("players").collect(),
    ]);

    const playerMap = new Map(players.map(p => [p._id, p]));
    const teamCounts = new Map<string, number>();

    // Count drafts per NFL team
    allDraftPicks.forEach(pick => {
      const player = playerMap.get(pick.playerId);
      if (player && player.team) {
        const current = teamCounts.get(player.team) || 0;
        teamCounts.set(player.team, current + 1);
      }
    });

    // Find team with most drafts
    let maxCount = 0;
    let mostDraftedTeam = "";
    teamCounts.forEach((count, team) => {
      if (count > maxCount) {
        maxCount = count;
        mostDraftedTeam = team;
      }
    });

    return {
      team: mostDraftedTeam || "",
      count: maxCount
    };
  },
});

// Get NFL team with most total value from drafted players
export const getMostValuableTeam = query({
  args: {},
  handler: async (ctx) => {
    const [allDraftPicks, players, rosterEntries] = await Promise.all([
      ctx.db.query("draftPicks").collect(),
      ctx.db.query("players").collect(),
      ctx.db.query("rosterEntries").collect(),
    ]);

    const playerMap = new Map(players.map(p => [p._id, p]));
    
    // Create a map: playerId+seasonId -> total points
    const playerSeasonPoints = new Map<string, number>();
    rosterEntries.forEach(entry => {
      const key = `${entry.playerId}_${entry.seasonId}`;
      const currentPoints = playerSeasonPoints.get(key) || 0;
      playerSeasonPoints.set(key, currentPoints + entry.points);
    });

    // Build VOR context
    const replacement = computeReplacementLevels(playerSeasonPoints, allDraftPicks, playerMap);
    const expectedVor = buildExpectedVorMap(allDraftPicks, playerSeasonPoints, playerMap, replacement);

    // Calculate total value per NFL team
    const teamValues = new Map<string, number>();
    const allValues: number[] = [];

    allDraftPicks.forEach(pick => {
      const player = playerMap.get(pick.playerId);
      if (!player || !player.team) return;

      const key = `${pick.playerId}_${pick.seasonId}`;
      const actualPoints = playerSeasonPoints.get(key) || 0;
      const pos = normalizePosition(player.position);
      const vor = actualPoints - replacement[pos];
      const expected = getExpectedVorAtPick(expectedVor, pos, pick.overallPick);
      const pickValue = vor - expected;
      allValues.push(pickValue);

      const current = teamValues.get(player.team) || 0;
      teamValues.set(player.team, current + pickValue);
    });

    const scale = computeCalibrationScale(allValues);

    // Find team with highest total value
    let maxValue = -Infinity;
    let mostValuableTeam = "";
    teamValues.forEach((value, team) => {
      const scaledValue = value * scale;
      if (scaledValue > maxValue) {
        maxValue = scaledValue;
        mostValuableTeam = team;
      }
    });

    return {
      team: mostValuableTeam || "",
      totalValue: parseFloat((maxValue || 0).toFixed(2))
    };
  },
});
