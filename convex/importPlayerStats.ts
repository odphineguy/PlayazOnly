import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Import player season stats into rosterEntries table
export const importPlayerSeasonStats = mutation({
  args: {
    year: v.number(),
    playerStats: v.array(v.object({
      player_id: v.number(),
      player_name: v.string(),
      team_id: v.number(),
      team_name: v.string(),
      total_points: v.number(),
      year: v.number(),
    }))
  },
  handler: async (ctx, args) => {
    const { year, playerStats } = args;

    // Find the season for this year
    const season = await ctx.db
      .query("seasons")
      .withIndex("byYear", (q) => q.eq("year", year))
      .first();

    if (!season) {
      throw new Error(`Season ${year} not found. Please import league data first.`);
    }

    // Get all teams for this season
    const teams = await ctx.db
      .query("teams")
      .withIndex("bySeason", (q) => q.eq("seasonId", season._id))
      .collect();

    // Create a map of ESPN team IDs to Convex team IDs
    const teamIdMap = new Map();
    teams.forEach(team => {
      if (team.espnTeamId) {
        teamIdMap.set(team.espnTeamId, team._id);
      }
    });

    let importedCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;

    for (const playerStat of playerStats) {
      // Find the player by ESPN player ID
      const player = await ctx.db
        .query("players")
        .withIndex("byEspnPlayerId", (q) => q.eq("espnPlayerId", playerStat.player_id))
        .first();

      if (!player) {
        console.warn(`Player not found: ${playerStat.player_name} (${playerStat.player_id})`);
        skippedCount++;
        continue;
      }

      // Find the team ID
      const teamId = teamIdMap.get(playerStat.team_id);
      if (!teamId) {
        console.warn(`Team not found for ${playerStat.team_name} (ID: ${playerStat.team_id})`);
        skippedCount++;
        continue;
      }

      // Check if this roster entry already exists
      const existingEntry = await ctx.db
        .query("rosterEntries")
        .withIndex("byTeamAndSeason", (q) =>
          q.eq("teamId", teamId).eq("seasonId", season._id)
        )
        .filter((q) => q.eq(q.field("playerId"), player._id))
        .first();

      if (existingEntry) {
        // Update existing entry
        await ctx.db.patch(existingEntry._id, {
          points: playerStat.total_points,
          updatedAt: Date.now()
        });
        updatedCount++;
      } else {
        // Create new roster entry
        await ctx.db.insert("rosterEntries", {
          teamId: teamId,
          playerId: player._id,
          seasonId: season._id,
          points: playerStat.total_points,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        importedCount++;
      }
    }

    return {
      message: `Imported player stats for ${year}`,
      year,
      importedCount,
      updatedCount,
      skippedCount,
      totalProcessed: playerStats.length
    };
  },
});

