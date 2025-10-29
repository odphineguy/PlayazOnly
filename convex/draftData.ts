import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
    const league = await ctx.db.get(existingSeason.leagueId);
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
        // Determine position from player name and context
        let position = pick.position;
        if (position === "Unknown") {
          // Try to infer position from common patterns
          const name = pick.player_name.toLowerCase();
          if (name.includes("qb") || name.includes("quarterback")) {
            position = "QB";
          } else if (name.includes("rb") || name.includes("running back")) {
            position = "RB";
          } else if (name.includes("wr") || name.includes("wide receiver")) {
            position = "WR";
          } else if (name.includes("te") || name.includes("tight end")) {
            position = "TE";
          } else if (name.includes("k") || name.includes("kicker")) {
            position = "K";
          } else if (name.includes("dst") || name.includes("defense")) {
            position = "DST";
          } else {
            position = "RB"; // Default to RB for most fantasy players
          }
        }
        
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
        leagueId: existingSeason.leagueId,
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
      leagueId: existingSeason.leagueId
    };
  },
});

// Get all-time draft statistics
export const getAllTimeDraftStats = query({
  args: {},
  handler: async (ctx) => {
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
    
    // Get all seasons and teams
    const seasons = await ctx.db.query("seasons").collect();
    const teams = await ctx.db.query("teams").collect();
    
    // Calculate basic stats
    const totalPicks = allDraftPicks.length;
    const totalSeasons = seasons.length;
    const totalTeams = teams.length;
    
    // Calculate average pick value (simplified - using overall pick as value)
    const avgPickValue = allDraftPicks.reduce((sum, pick) => sum + pick.overallPick, 0) / totalPicks;
    
    // Calculate average team value (average of all team draft values)
    const teamValues = new Map();
    allDraftPicks.forEach(pick => {
      if (!teamValues.has(pick.teamId)) {
        teamValues.set(pick.teamId, []);
      }
      teamValues.get(pick.teamId).push(pick.overallPick);
    });
    
    const avgTeamValue = Array.from(teamValues.values())
      .map(teamPicks => teamPicks.reduce((sum: number, pick: number) => sum + pick, 0) / teamPicks.length)
      .reduce((sum, val) => sum + val, 0) / teamValues.size;
    
    // Calculate average season value
    const seasonValues = new Map();
    allDraftPicks.forEach(pick => {
      if (!seasonValues.has(pick.seasonId)) {
        seasonValues.set(pick.seasonId, []);
      }
      seasonValues.get(pick.seasonId).push(pick.overallPick);
    });
    
    const avgSeasonValue = Array.from(seasonValues.values())
      .map(seasonPicks => seasonPicks.reduce((sum: number, pick: number) => sum + pick, 0) / seasonPicks.length)
      .reduce((sum, val) => sum + val, 0) / seasonValues.size;
    
    return {
      totalPicks,
      avgPickValue: parseFloat(avgPickValue.toFixed(2)),
      avgTeamValue: parseFloat(avgTeamValue.toFixed(2)),
      avgSeasonValue: parseFloat(avgSeasonValue.toFixed(2)),
      totalSeasons,
      totalTeams
    };
  },
});

// Get draft value by position and year
export const getDraftValueByPosition = query({
  args: {},
  handler: async (ctx) => {
    const allDraftPicks = await ctx.db.query("draftPicks").collect();
    const players = await ctx.db.query("players").collect();
    const seasons = await ctx.db.query("seasons").collect();
    
    // Create maps for quick lookup
    const playerMap = new Map(players.map(p => [p._id, p]));
    const seasonMap = new Map(seasons.map(s => [s._id, s]));
    
    // Group by year and position
    const dataByYear = new Map();
    
    allDraftPicks.forEach(pick => {
      const player = playerMap.get(pick.playerId);
      const season = seasonMap.get(pick.seasonId);
      
      if (!player || !season) return;
      
      const year = season.year;
      if (!dataByYear.has(year)) {
        dataByYear.set(year, new Map());
      }
      
      const yearData = dataByYear.get(year);
      if (!yearData.has(player.position)) {
        yearData.set(player.position, []);
      }
      
      yearData.get(player.position).push(pick.overallPick);
    });
    
    // Convert to chart data
    const chartData: any[] = [];
    const years = Array.from(dataByYear.keys()).sort();
    const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DST'];
    
    years.forEach(year => {
      const yearData = dataByYear.get(year);
      const yearEntry: any = { year: year.toString() };
      
      positions.forEach(position => {
        const picks = yearData.get(position) || [];
        const totalValue = picks.reduce((sum: number, pick: number) => sum + pick, 0);
        const avgValue = picks.length > 0 ? totalValue / picks.length : 0;
        
        yearEntry[`${position}_total`] = totalValue;
        yearEntry[`${position}_avg`] = parseFloat(avgValue.toFixed(2));
      });
      
      chartData.push(yearEntry);
    });
    
    return chartData;
  },
});

// Get top picks all-time
export const getTopPicksAllTime = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const allDraftPicks = await ctx.db.query("draftPicks").collect();
    const players = await ctx.db.query("players").collect();
    const teams = await ctx.db.query("teams").collect();
    const seasons = await ctx.db.query("seasons").collect();
    
    // Create maps for quick lookup
    const playerMap = new Map(players.map(p => [p._id, p]));
    const teamMap = new Map(teams.map(t => [t._id, t]));
    const seasonMap = new Map(seasons.map(s => [s._id, s]));
    
    // Calculate value for each pick (lower overall pick = higher value)
    const picksWithValue = allDraftPicks.map(pick => {
      const player = playerMap.get(pick.playerId);
      const team = teamMap.get(pick.teamId);
      const season = seasonMap.get(pick.seasonId);
      
      if (!player || !team || !season) return null;
      
      // Simple value calculation: 200 - overallPick (higher is better)
      const value = 200 - pick.overallPick;
      
      return {
        ...pick,
        player,
        team,
        season,
        value: parseFloat(value.toFixed(2))
      };
    }).filter(Boolean);
    
    // Sort by value (highest first) and take top picks
    return picksWithValue
      .filter((pick): pick is NonNullable<typeof pick> => pick !== null)
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  },
});

// Get worst picks all-time
export const getWorstPicksAllTime = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const allDraftPicks = await ctx.db.query("draftPicks").collect();
    const players = await ctx.db.query("players").collect();
    const teams = await ctx.db.query("teams").collect();
    const seasons = await ctx.db.query("seasons").collect();
    
    // Create maps for quick lookup
    const playerMap = new Map(players.map(p => [p._id, p]));
    const teamMap = new Map(teams.map(t => [t._id, t]));
    const seasonMap = new Map(seasons.map(s => [s._id, s]));
    
    // Calculate value for each pick (lower overall pick = higher value)
    const picksWithValue = allDraftPicks.map(pick => {
      const player = playerMap.get(pick.playerId);
      const team = teamMap.get(pick.teamId);
      const season = seasonMap.get(pick.seasonId);
      
      if (!player || !team || !season) return null;
      
      // Simple value calculation: 200 - overallPick (higher is better)
      const value = 200 - pick.overallPick;
      
      return {
        ...pick,
        player,
        team,
        season,
        value: parseFloat(value.toFixed(2))
      };
    }).filter(Boolean);
    
    // Sort by value (lowest first) and take worst picks
    return picksWithValue
      .filter((pick): pick is NonNullable<typeof pick> => pick !== null)
      .sort((a, b) => a.value - b.value)
      .slice(0, limit);
  },
});

// Get all-time draft rankings by team
export const getAllTimeDraftRankings = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const allDraftPicks = await ctx.db.query("draftPicks").collect();
    const teams = await ctx.db.query("teams").collect();
    
    // Group picks by team
    const teamPicks = new Map();
    allDraftPicks.forEach(pick => {
      if (!teamPicks.has(pick.teamId)) {
        teamPicks.set(pick.teamId, []);
      }
      teamPicks.get(pick.teamId).push(pick);
    });
    
    // Calculate average value for each team
    const teamRankings: Array<{
      team: any;
      avgValue: number;
      totalPicks: number;
    }> = [];
    teamPicks.forEach((picks, teamId) => {
      const team = teams.find(t => t._id === teamId);
      if (!team) return;
      
      const totalValue = picks.reduce((sum: number, pick: any) => sum + (200 - pick.overallPick), 0);
      const avgValue = totalValue / picks.length;
      
      teamRankings.push({
        team,
        avgValue: parseFloat(avgValue.toFixed(2)),
        totalPicks: picks.length
      });
    });
    
    // Sort by average value (highest first)
    return teamRankings
      .sort((a, b) => b.avgValue - a.avgValue)
      .slice(0, limit);
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
