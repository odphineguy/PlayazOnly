import { query } from "./_generated/server";

/**
 * Cached VOR (Value Over Replacement) calculations
 * These expensive calculations can be reused across multiple draft queries
 * instead of recalculating for each query
 */

type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DST';
type ReplacementMap = Record<Position, number>;
type ExpectedVorMap = Record<Position, Record<number, number>>;

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

/**
 * Get replacement level values for all positions
 * This is the baseline value that defines "replacement level" for VOR calculations
 */
export const getReplacementLevels = query({
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

    // Compute replacement levels per season, then average
    const seasonPositionToPoints: Record<string, Record<Position, Array<number>>> = {};

    for (const pick of allDraftPicks) {
      const player = playerMap.get(pick.playerId);
      if (!player) continue;

      const pos = normalizePosition(player.position);
      const key = `${pick.seasonId}`;
      const points = playerSeasonPoints.get(`${pick.playerId}_${pick.seasonId}`) || 0;

      if (!seasonPositionToPoints[key]) {
        seasonPositionToPoints[key] = { QB: [], RB: [], WR: [], TE: [], K: [], DST: [] };
      }
      seasonPositionToPoints[key][pos].push(points);
    }

    const replacementSamples: Record<Position, Array<number>> = {
      QB: [], RB: [], WR: [], TE: [], K: [], DST: []
    };

    for (const seasonId in seasonPositionToPoints) {
      const byPos = seasonPositionToPoints[seasonId];

      (Object.keys(byPos) as Array<Position>).forEach((pos) => {
        const arr = byPos[pos].sort((a, b) => b - a);
        if (arr.length === 0) return;

        const threshold = REPLACEMENT_THRESHOLDS[pos];
        const idx = Math.min(threshold, arr.length) - 1;
        const atRank = arr[idx];
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
  },
});

/**
 * Get expected VOR values at each draft pick position
 * This creates a lookup table of expected value for each position at each pick number
 */
export const getExpectedVorMap = query({
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

    // Get replacement levels first (could call the other query, but inline for efficiency)
    const seasonPositionToPoints: Record<string, Record<Position, Array<number>>> = {};

    for (const pick of allDraftPicks) {
      const player = playerMap.get(pick.playerId);
      if (!player) continue;

      const pos = normalizePosition(player.position);
      const key = `${pick.seasonId}`;
      const points = playerSeasonPoints.get(`${pick.playerId}_${pick.seasonId}`) || 0;

      if (!seasonPositionToPoints[key]) {
        seasonPositionToPoints[key] = { QB: [], RB: [], WR: [], TE: [], K: [], DST: [] };
      }
      seasonPositionToPoints[key][pos].push(points);
    }

    const replacementSamples: Record<Position, Array<number>> = {
      QB: [], RB: [], WR: [], TE: [], K: [], DST: []
    };

    for (const seasonId in seasonPositionToPoints) {
      const byPos = seasonPositionToPoints[seasonId];

      (Object.keys(byPos) as Array<Position>).forEach((pos) => {
        const arr = byPos[pos].sort((a, b) => b - a);
        if (arr.length === 0) return;

        const threshold = REPLACEMENT_THRESHOLDS[pos];
        const idx = Math.min(threshold, arr.length) - 1;
        const atRank = arr[idx];
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

    // Build expected VOR map
    const byPosByPick: Record<Position, Record<number, Array<number>>> = {
      QB: {}, RB: {}, WR: {}, TE: {}, K: {}, DST: {}
    };

    for (const pick of allDraftPicks) {
      const player = playerMap.get(pick.playerId);
      if (!player) continue;

      const pos = normalizePosition(player.position);
      const points = playerSeasonPoints.get(`${pick.playerId}_${pick.seasonId}`) || 0;
      const vor = points - replacement[pos];

      if (!byPosByPick[pos][pick.overallPick]) {
        byPosByPick[pos][pick.overallPick] = [];
      }
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
  },
});

/**
 * Get both replacement levels and expected VOR map in a single query
 * Most efficient when both are needed
 */
export const getVorContext = query({
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

    // Calculate replacement levels
    const seasonPositionToPoints: Record<string, Record<Position, Array<number>>> = {};

    for (const pick of allDraftPicks) {
      const player = playerMap.get(pick.playerId);
      if (!player) continue;

      const pos = normalizePosition(player.position);
      const key = `${pick.seasonId}`;
      const points = playerSeasonPoints.get(`${pick.playerId}_${pick.seasonId}`) || 0;

      if (!seasonPositionToPoints[key]) {
        seasonPositionToPoints[key] = { QB: [], RB: [], WR: [], TE: [], K: [], DST: [] };
      }
      seasonPositionToPoints[key][pos].push(points);
    }

    const replacementSamples: Record<Position, Array<number>> = {
      QB: [], RB: [], WR: [], TE: [], K: [], DST: []
    };

    for (const seasonId in seasonPositionToPoints) {
      const byPos = seasonPositionToPoints[seasonId];

      (Object.keys(byPos) as Array<Position>).forEach((pos) => {
        const arr = byPos[pos].sort((a, b) => b - a);
        if (arr.length === 0) return;

        const threshold = REPLACEMENT_THRESHOLDS[pos];
        const idx = Math.min(threshold, arr.length) - 1;
        const atRank = arr[idx];
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

    // Build expected VOR map
    const byPosByPick: Record<Position, Record<number, Array<number>>> = {
      QB: {}, RB: {}, WR: {}, TE: {}, K: {}, DST: {}
    };

    for (const pick of allDraftPicks) {
      const player = playerMap.get(pick.playerId);
      if (!player) continue;

      const pos = normalizePosition(player.position);
      const points = playerSeasonPoints.get(`${pick.playerId}_${pick.seasonId}`) || 0;
      const vor = points - replacement[pos];

      if (!byPosByPick[pos][pick.overallPick]) {
        byPosByPick[pos][pick.overallPick] = [];
      }
      byPosByPick[pos][pick.overallPick].push(vor);
    }

    const expectedVor: ExpectedVorMap = { QB: {}, RB: {}, WR: {}, TE: {}, K: {}, DST: {} };

    (Object.keys(byPosByPick) as Array<Position>).forEach((pos) => {
      const picks = byPosByPick[pos];

      for (const pickStr in picks) {
        const pickNum = Number(pickStr);
        const arr = picks[pickNum];
        const avg = arr.reduce((s, x) => s + x, 0) / arr.length;
        expectedVor[pos][pickNum] = parseFloat(avg.toFixed(2));
      }
    });

    return {
      replacement,
      expectedVor,
      metadata: {
        totalPicks: allDraftPicks.length,
        totalPlayers: players.length,
        totalRosterEntries: rosterEntries.length,
      }
    };
  },
});
