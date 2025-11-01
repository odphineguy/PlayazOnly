import { mutation } from "./_generated/server";
import { v } from "convex/values";
import espnData2018 from "../EspnData/espn_league_2018.json";
import espnData2019 from "../EspnData/espn_league_2019.json";
import espnData2020 from "../EspnData/espn_league_2020.json";
import espnData2021 from "../EspnData/espn_league_2021.json";
import espnData2022 from "../EspnData/espn_league_2022.json";
import espnData2023 from "../EspnData/espn_league_2023.json";
import espnData2024 from "../EspnData/espn_league_2024.json";
import espnData2025 from "../EspnData/espn_league_2025.json";

// Import all ESPN data for all seasons
export const importAllEspnData = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Check if league already exists
    const existingLeague = await ctx.db.query("leagues")
      .filter((q) => q.eq(q.field("name"), "Playaz Only"))
      .first();

    // Check if data is complete (has teams with ownerDisplayName and matchups)
    if (existingLeague) {
      const existingSeasons = await ctx.db.query("seasons")
        .withIndex("byLeague", (q) => q.eq("leagueId", existingLeague._id))
        .collect();

      const existingTeams = await ctx.db.query("teams")
        .withIndex("byLeague", (q) => q.eq("leagueId", existingLeague._id))
        .collect();

      const existingMatchups = await ctx.db.query("matchups")
        .withIndex("byLeague", (q) => q.eq("leagueId", existingLeague._id))
        .collect();

      // Check if data is complete (8 seasons, 80+ teams, 500+ matchups, and has owner data)
      const hasCompleteData =
        existingSeasons.length >= 8 &&
        existingTeams.length >= 80 &&
        existingMatchups.length >= 500 &&
        existingTeams[0]?.ownerId;

      if (hasCompleteData) {
        return {
          message: "Data already imported and complete, skipping...",
          leagueId: existingLeague._id,
          seasonsCreated: existingSeasons.length,
          teamsCreated: existingTeams.length,
          matchupsCreated: existingMatchups.length
        };
      }

      // Data exists but is incomplete - clear it
      if (existingSeasons.length > 0) {
        console.log("Clearing incomplete data before reimport...");

        // Delete teams
        for (const team of existingTeams) {
          await ctx.db.delete(team._id);
        }

        // Delete matchups
        for (const matchup of existingMatchups) {
          await ctx.db.delete(matchup._id);
        }

        // Delete seasons
        for (const season of existingSeasons) {
          await ctx.db.delete(season._id);
        }

        // Delete league
        await ctx.db.delete(existingLeague._id);
      }
    }

    // Create temp user for commissioner and team owners if needed
    const existingUser = await ctx.db.query("users")
      .filter((q) => q.eq(q.field("externalId"), "temp_user"))
      .first();

    const tempUserId = existingUser
      ? existingUser._id
      : await ctx.db.insert("users", {
          name: "Temp User",
          externalId: "temp_user",
        });

    // Create or use existing league
    const leagueId = existingLeague?._id || await ctx.db.insert("leagues", {
      name: "Playaz Only",
      platform: "ESPN",
      commissionerId: tempUserId as any,
      createdAt: now,
      updatedAt: now,
    });

    // Use actual ESPN data from imported JSON files (data is at root level, not wrapped in year key)
    const espnData = {
      "2018": espnData2018 as any,
      "2019": espnData2019 as any,
      "2020": espnData2020 as any,
      "2021": espnData2021 as any,
      "2022": espnData2022 as any,
      "2023": espnData2023 as any,
      "2024": espnData2024 as any,
      "2025": espnData2025 as any,
    };

    const seasons = [];
    const teams = [];
    const teamMap = new Map(); // Map ESPN team names to Convex team IDs
    let totalMatchups = 0;

    // Create seasons and teams for each year
    for (const [yearStr, seasonData] of Object.entries(espnData)) {
      const year = parseInt(yearStr);

      // Create season
      const seasonId = await ctx.db.insert("seasons", {
        leagueId,
        year,
        isActive: year === 2025,
        playoffTeams: 6,
        regularSeasonWeeks: 14,
        playoffWeeks: 3,
        dataSource: "ESPN",
        createdAt: now,
        updatedAt: now,
      });

      seasons.push({ year, seasonId });

      // Create a map of team names to team IDs for this season
      const seasonTeamMap = new Map();

      // Create teams for this season
      for (const teamData of seasonData.teams) {
        const ownerDisplayName = teamData.owners?.[0]?.displayName || "Unknown";

        // Find or create owner
        let owner = await ctx.db
          .query("owners")
          .withIndex("byDisplayName", (q) => q.eq("displayName", ownerDisplayName))
          .first();

        if (!owner) {
          const ownerId = await ctx.db.insert("owners", {
            displayName: ownerDisplayName,
            userId: tempUserId,
            createdAt: now,
            updatedAt: now,
          });
          owner = await ctx.db.get(ownerId);
        }

        const teamId = await ctx.db.insert("teams", {
          leagueId,
          seasonId,
          espnTeamId: teamData.team_id,
          name: teamData.team_name,
          ownerId: owner!._id,
          standing: teamData.standing,
          finalStanding: teamData.final_standing,
          createdAt: now,
          updatedAt: now,
        });

        // Store team mapping for later use
        const teamKey = `${year}-${teamData.owners[0].displayName}`;
        teamMap.set(teamKey, teamId);
        seasonTeamMap.set(teamData.team_name, teamId);

        teams.push({
          year,
          teamId,
          teamName: teamData.team_name,
          ownerName: teamData.owners[0].displayName,
          wins: teamData.wins,
          losses: teamData.losses,
          pointsFor: teamData.points_for,
          pointsAgainst: teamData.points_against,
          standing: teamData.standing,
          finalStanding: teamData.final_standing
        });
      }

      // Import matchups for this season
      if (seasonData.matchups && Array.isArray(seasonData.matchups)) {
        for (const matchup of seasonData.matchups) {
          const homeTeamId = seasonTeamMap.get(matchup.home_team);
          const awayTeamId = seasonTeamMap.get(matchup.away_team);

          if (homeTeamId && awayTeamId) {
            // Determine game type based on week number
            let gameType = "REGULAR";
            if (matchup.week >= 15 && matchup.week <= 16) {
              gameType = matchup.week === 16 ? "CHAMPIONSHIP" : "PLAYOFF";
            }

            await ctx.db.insert("matchups", {
              leagueId,
              seasonId,
              week: matchup.week,
              homeTeamId,
              awayTeamId,
              homeScore: matchup.home_score,
              awayScore: matchup.away_score,
              gameType,
              createdAt: now,
              updatedAt: now,
            });
            totalMatchups++;
          }
        }
      }
    }

    return {
      message: "Successfully imported all ESPN data!",
      leagueId,
      seasonsCreated: seasons.length,
      teamsCreated: teams.length,
      matchupsCreated: totalMatchups,
      seasons,
      teams: teams.slice(0, 10) // Return first 10 teams as sample
    };
  },
});

// Get all teams with their season data
export const getAllTeamsWithSeasons = mutation({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db.query("teams").collect();
    const seasons = await ctx.db.query("seasons").collect();
    
    const seasonMap = new Map(seasons.map(s => [s._id, s]));
    
    return teams.map(team => ({
      ...team,
      season: seasonMap.get(team.seasonId)
    }));
  },
});

// Get team standings for a specific season
export const getTeamStandings = mutation({
  args: { year: v.number() },
  handler: async (ctx, args) => {
    const season = await ctx.db
      .query("seasons")
      .withIndex("byYear", (q) => q.eq("year", args.year))
      .first();
    
    if (!season) return [];
    
    const teams = await ctx.db
      .query("teams")
      .withIndex("bySeason", (q) => q.eq("seasonId", season._id))
      .collect();
    
    return teams.sort((a, b) => (a.finalStanding || 0) - (b.finalStanding || 0));
  },
});

// Get all-time standings across all seasons
export const getAllTimeStandings = mutation({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db.query("teams").collect();
    const seasons = await ctx.db.query("seasons").collect();
    
    const seasonMap = new Map(seasons.map(s => [s._id, s]));
    
    // Group teams by owner name (assuming same owner across seasons)
    const ownerStats = new Map();
    
    // Get all matchups to calculate team stats
    const allMatchups = await ctx.db.query("matchups").collect();

    // Calculate stats for each team from matchups
    const teamStatsMap = new Map();
    teams.forEach(team => {
      const teamMatchups = allMatchups.filter(m => m.homeTeamId === team._id || m.awayTeamId === team._id);
      let wins = 0, losses = 0, pointsFor = 0, pointsAgainst = 0;

      teamMatchups.forEach(m => {
        const isHome = m.homeTeamId === team._id;
        const teamScore = isHome ? m.homeScore : m.awayScore;
        const oppScore = isHome ? m.awayScore : m.homeScore;

        pointsFor += teamScore;
        pointsAgainst += oppScore;
        if (teamScore > oppScore) wins++;
        else if (teamScore < oppScore) losses++;
      });

      teamStatsMap.set(team._id, { wins, losses, pointsFor, pointsAgainst });
    });

    teams.forEach(team => {
      const season = seasonMap.get(team.seasonId);
      if (!season) return;

      const ownerKey = team.name; // Using team name as key for now

      if (!ownerStats.has(ownerKey)) {
        ownerStats.set(ownerKey, {
          teamName: ownerKey,
          totalWins: 0,
          totalLosses: 0,
          totalPointsFor: 0,
          totalPointsAgainst: 0,
          seasons: 0,
          championships: 0,
          secondPlace: 0,
          thirdPlace: 0
        });
      }

      const teamStats = teamStatsMap.get(team._id) || { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 };
      const stats = ownerStats.get(ownerKey);
      stats.totalWins += teamStats.wins;
      stats.totalLosses += teamStats.losses;
      stats.totalPointsFor += teamStats.pointsFor;
      stats.totalPointsAgainst += teamStats.pointsAgainst;
      stats.seasons += 1;
      
      if (team.finalStanding === 1) stats.championships += 1;
      if (team.finalStanding === 2) stats.secondPlace += 1;
      if (team.finalStanding === 3) stats.thirdPlace += 1;
    });
    
    return Array.from(ownerStats.values()).sort((a, b) => {
      const aWinPct = a.totalWins / (a.totalWins + a.totalLosses);
      const bWinPct = b.totalWins / (b.totalWins + b.totalLosses);
      return bWinPct - aWinPct;
    });
  },
});
