import { mutation } from "./_generated/server";
import { v } from "convex/values";

// ESPN Data Import Functions
export const importEspnLeagueData = mutation({
  args: {
    leagueId: v.id("leagues"),
    espnData: v.any(), // The JSON data from ESPN
  },
  handler: async (ctx, args) => {
    const { leagueId, espnData } = args;
    const now = Date.now();

    // Create season
    const seasonId = await ctx.db.insert("seasons", {
      leagueId,
      year: espnData.year,
      isActive: espnData.year === new Date().getFullYear(),
      totalTeams: espnData.teams.length,
      playoffTeams: Math.ceil(espnData.teams.length / 2),
      regularSeasonWeeks: 14,
      playoffWeeks: 3,
      dataSource: "ESPN",
      hasCompleteData: true,
      createdAt: now,
      updatedAt: now,
    });

    // Create teams
    const teamPromises = espnData.teams.map(async (team: any) => {
      const teamId = await ctx.db.insert("teams", {
        leagueId,
        seasonId,
        espnTeamId: team.team_id,
        name: team.team_name,
        ownerId: "temp_owner_id" as any, // This would need to be mapped to actual user IDs
        wins: team.wins,
        losses: team.losses,
        ties: team.ties || 0,
        pointsFor: team.points_for,
        pointsAgainst: team.points_against,
        standing: team.standing,
        finalStanding: team.final_standing,
        streakLength: team.streak_length,
        streakType: team.streak_type,
        createdAt: now,
        updatedAt: now,
      });

      // Create players and roster entries
      if (team.roster) {
        for (const player of team.roster) {
          // Check if player already exists
          let existingPlayer = await ctx.db
            .query("players")
            .withIndex("byEspnPlayerId", (q) => q.eq("espnPlayerId", player.player_id))
            .first();

          let playerId: any;
          if (!existingPlayer) {
            playerId = await ctx.db.insert("players", {
              name: player.name,
              position: player.position,
              team: player.team,
              espnPlayerId: player.player_id,
              createdAt: now,
              updatedAt: now,
            });
          } else {
            playerId = existingPlayer._id;
          }

          // Create roster entry
          await ctx.db.insert("rosterEntries", {
            teamId,
            playerId,
            seasonId,
            points: player.points || 0,
            isStarter: player.isStarter || false,
            createdAt: now,
            updatedAt: now,
          });
        }
      }

      return teamId;
    });

    await Promise.all(teamPromises);

    // Create matchups if they exist in the data
    let matchupsImported = 0;
    if (espnData.matchups && espnData.matchups.length > 0) {
      const matchupPromises = espnData.matchups.map(async (matchup: any) => {
        // Find team IDs by name
        const homeTeam = espnData.teams.find((t: any) => t.team_name === matchup.home_team);
        const awayTeam = espnData.teams.find((t: any) => t.team_name === matchup.away_team);
        
        if (homeTeam && awayTeam) {
          // Find the team records in the database
          const homeTeamRecord = await ctx.db
            .query("teams")
            .withIndex("byEspnTeamId", (q) => q.eq("espnTeamId", homeTeam.team_id))
            .filter((q) => q.eq(q.field("seasonId"), seasonId))
            .first();
          
          const awayTeamRecord = await ctx.db
            .query("teams")
            .withIndex("byEspnTeamId", (q) => q.eq("espnTeamId", awayTeam.team_id))
            .filter((q) => q.eq(q.field("seasonId"), seasonId))
            .first();

          if (homeTeamRecord && awayTeamRecord) {
            // Determine game type based on week
            let gameType = "REGULAR";
            if (matchup.week >= 15) {
              gameType = "PLAYOFF";
            }
            if (matchup.week === 16) {
              gameType = "CHAMPIONSHIP";
            }

            await ctx.db.insert("matchups", {
              leagueId,
              seasonId,
              week: matchup.week,
              homeTeamId: homeTeamRecord._id,
              awayTeamId: awayTeamRecord._id,
              homeScore: matchup.home_score,
              awayScore: matchup.away_score,
              gameType,
              createdAt: now,
              updatedAt: now,
            });
            matchupsImported++;
          }
        }
      });

      await Promise.all(matchupPromises);
    }

    return {
      seasonId,
      teamsImported: espnData.teams.length,
      matchupsImported,
      message: `Successfully imported ${espnData.year} season data with ${matchupsImported} matchups`,
    };
  },
});

export const importEspnDraftData = mutation({
  args: {
    leagueId: v.id("leagues"),
    seasonId: v.id("seasons"),
    draftData: v.any(),
  },
  handler: async (ctx, args) => {
    const { leagueId, seasonId, draftData } = args;

    // Get teams for this season
    const teams = await ctx.db
      .query("teams")
      .withIndex("bySeason", (q) => q.eq("seasonId", seasonId))
      .collect();

    const teamMap = new Map(teams.map(team => [team.espnTeamId, team._id]));

    // Import draft picks
    const draftPromises = draftData.map(async (pick: any) => {
      const teamId = teamMap.get(pick.team_id);
      if (!teamId) return;

      // Find or create player
      let existingPlayer = await ctx.db
        .query("players")
        .withIndex("byEspnPlayerId", (q) => q.eq("espnPlayerId", pick.player_id))
        .first();

      let playerId: any;
      if (!existingPlayer) {
        playerId = await ctx.db.insert("players", {
          name: pick.name,
          position: pick.position,
          team: pick.team,
          espnPlayerId: pick.player_id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      } else {
        playerId = existingPlayer._id;
      }

      return await ctx.db.insert("draftPicks", {
        leagueId,
        seasonId,
        teamId,
        playerId,
        round: pick.round,
        pick: pick.pick,
        overallPick: pick.overall_pick,
        createdAt: Date.now(),
      });
    });

    await Promise.all(draftPromises);

    return {
      picksImported: draftData.length,
      message: "Successfully imported draft data",
    };
  },
});

export const importEspnTransactionData = mutation({
  args: {
    leagueId: v.id("leagues"),
    seasonId: v.id("seasons"),
    transactionData: v.any(),
  },
  handler: async (ctx, args) => {
    const { leagueId, seasonId, transactionData } = args;

    // Get teams for this season
    const teams = await ctx.db
      .query("teams")
      .withIndex("bySeason", (q) => q.eq("seasonId", seasonId))
      .collect();

    const teamMap = new Map(teams.map(team => [team.espnTeamId, team._id]));

    // Import transactions
    const transactionPromises = transactionData.map(async (transaction: any) => {
      const involvedTeams = transaction.involved_teams
        ?.map((teamId: number) => teamMap.get(teamId))
        .filter(Boolean) || [];

      const involvedPlayers = transaction.involved_players
        ?.map(async (playerId: number) => {
          const player = await ctx.db
            .query("players")
            .withIndex("byEspnPlayerId", (q) => q.eq("espnPlayerId", playerId))
            .first();
          return player?._id;
        })
        .filter(Boolean) || [];

      return await ctx.db.insert("transactions", {
        leagueId,
        seasonId,
        type: transaction.type,
        description: transaction.description,
        involvedTeams,
        involvedPlayers: await Promise.all(involvedPlayers),
        week: transaction.week,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    });

    await Promise.all(transactionPromises);

    return {
      transactionsImported: transactionData.length,
      message: "Successfully imported transaction data",
    };
  },
});
