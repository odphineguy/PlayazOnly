import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Calculate team statistics from matchups data
 * This replaces the need to store wins, losses, ties, pointsFor, pointsAgainst in the teams table
 */
export const getTeamStats = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    // Get all matchups involving this team
    const allMatchups = await ctx.db.query("matchups").collect();

    const matchups = allMatchups.filter(
      m => m.homeTeamId === args.teamId || m.awayTeamId === args.teamId
    );

    let wins = 0;
    let losses = 0;
    let ties = 0;
    let pointsFor = 0;
    let pointsAgainst = 0;
    let currentStreak = 0;
    let streakType: "WIN" | "LOSS" | "TIE" = "WIN";

    // Sort matchups by week to calculate streak
    const sortedMatchups = matchups.sort((a, b) => a.week - b.week);

    sortedMatchups.forEach((m, index) => {
      let teamScore: number;
      let opponentScore: number;
      let didWin: boolean;
      let didLose: boolean;
      let didTie: boolean;

      if (m.homeTeamId === args.teamId) {
        teamScore = m.homeScore;
        opponentScore = m.awayScore;
      } else {
        teamScore = m.awayScore;
        opponentScore = m.homeScore;
      }

      pointsFor += teamScore;
      pointsAgainst += opponentScore;

      didWin = teamScore > opponentScore;
      didLose = teamScore < opponentScore;
      didTie = teamScore === opponentScore;

      if (didWin) wins++;
      else if (didLose) losses++;
      else ties++;

      // Calculate current streak (only for most recent games)
      if (index === sortedMatchups.length - 1) {
        // Start from last game and work backwards
        let currentType: "WIN" | "LOSS" | "TIE" = didWin ? "WIN" : didLose ? "LOSS" : "TIE";
        streakType = currentType;
        currentStreak = 1;

        for (let i = sortedMatchups.length - 2; i >= 0; i--) {
          const prevMatch = sortedMatchups[i];
          let prevScore: number;
          let prevOppScore: number;

          if (prevMatch.homeTeamId === args.teamId) {
            prevScore = prevMatch.homeScore;
            prevOppScore = prevMatch.awayScore;
          } else {
            prevScore = prevMatch.awayScore;
            prevOppScore = prevMatch.homeScore;
          }

          const prevWin = prevScore > prevOppScore;
          const prevLoss = prevScore < prevOppScore;
          const prevTie = prevScore === prevOppScore;
          const prevType: "WIN" | "LOSS" | "TIE" = prevWin ? "WIN" : prevLoss ? "LOSS" : "TIE";

          if (prevType === currentType) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    });

    return {
      wins,
      losses,
      ties,
      pointsFor: parseFloat(pointsFor.toFixed(2)),
      pointsAgainst: parseFloat(pointsAgainst.toFixed(2)),
      streakLength: currentStreak,
      streakType,
      gamesPlayed: wins + losses + ties,
      winPercentage: wins + losses + ties > 0
        ? parseFloat(((wins / (wins + losses + ties)) * 100).toFixed(2))
        : 0,
    };
  },
});

/**
 * Get team stats for multiple teams at once (more efficient for league views)
 */
export const getBulkTeamStats = query({
  args: { teamIds: v.array(v.id("teams")) },
  handler: async (ctx, args) => {
    const allMatchups = await ctx.db.query("matchups").collect();

    const teamStatsMap = new Map<string, {
      wins: number;
      losses: number;
      ties: number;
      pointsFor: number;
      pointsAgainst: number;
      streakLength: number;
      streakType: "WIN" | "LOSS" | "TIE";
    }>();

    // Initialize stats for all teams
    args.teamIds.forEach(teamId => {
      teamStatsMap.set(teamId, {
        wins: 0,
        losses: 0,
        ties: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        streakLength: 0,
        streakType: "WIN",
      });
    });

    // Calculate stats for each team
    args.teamIds.forEach(teamId => {
      const matchups = allMatchups.filter(
        m => m.homeTeamId === teamId || m.awayTeamId === teamId
      );

      const stats = teamStatsMap.get(teamId)!;
      const sortedMatchups = matchups.sort((a, b) => a.week - b.week);

      sortedMatchups.forEach((m, index) => {
        const isHome = m.homeTeamId === teamId;
        const teamScore = isHome ? m.homeScore : m.awayScore;
        const opponentScore = isHome ? m.awayScore : m.homeScore;

        stats.pointsFor += teamScore;
        stats.pointsAgainst += opponentScore;

        if (teamScore > opponentScore) stats.wins++;
        else if (teamScore < opponentScore) stats.losses++;
        else stats.ties++;

        // Calculate streak for last game
        if (index === sortedMatchups.length - 1) {
          const didWin = teamScore > opponentScore;
          const didLose = teamScore < opponentScore;
          stats.streakType = didWin ? "WIN" : didLose ? "LOSS" : "TIE";
          stats.streakLength = 1;

          // Count backwards
          for (let i = sortedMatchups.length - 2; i >= 0; i--) {
            const prevMatch = sortedMatchups[i];
            const prevIsHome = prevMatch.homeTeamId === teamId;
            const prevScore = prevIsHome ? prevMatch.homeScore : prevMatch.awayScore;
            const prevOppScore = prevIsHome ? prevMatch.awayScore : prevMatch.homeScore;

            const prevWin = prevScore > prevOppScore;
            const prevLoss = prevScore < prevOppScore;
            const prevType: "WIN" | "LOSS" | "TIE" = prevWin ? "WIN" : prevLoss ? "LOSS" : "TIE";

            if (prevType === stats.streakType) {
              stats.streakLength++;
            } else {
              break;
            }
          }
        }
      });
    });

    // Convert map to array of results
    return args.teamIds.map(teamId => ({
      teamId,
      ...teamStatsMap.get(teamId)!,
      gamesPlayed: teamStatsMap.get(teamId)!.wins + teamStatsMap.get(teamId)!.losses + teamStatsMap.get(teamId)!.ties,
    }));
  },
});

/**
 * Get team stats for a specific season
 */
export const getTeamStatsBySeason = query({
  args: { seasonId: v.id("seasons") },
  handler: async (ctx, args) => {
    const teams = await ctx.db
      .query("teams")
      .withIndex("bySeason", (q) => q.eq("seasonId", args.seasonId))
      .collect();

    const matchups = await ctx.db
      .query("matchups")
      .withIndex("bySeason", (q) => q.eq("seasonId", args.seasonId))
      .collect();

    return teams.map(team => {
      const teamMatchups = matchups.filter(
        m => m.homeTeamId === team._id || m.awayTeamId === team._id
      );

      let wins = 0;
      let losses = 0;
      let ties = 0;
      let pointsFor = 0;
      let pointsAgainst = 0;

      teamMatchups.forEach(m => {
        const isHome = m.homeTeamId === team._id;
        const teamScore = isHome ? m.homeScore : m.awayScore;
        const opponentScore = isHome ? m.awayScore : m.homeScore;

        pointsFor += teamScore;
        pointsAgainst += opponentScore;

        if (teamScore > opponentScore) wins++;
        else if (teamScore < opponentScore) losses++;
        else ties++;
      });

      return {
        team,
        wins,
        losses,
        ties,
        pointsFor: parseFloat(pointsFor.toFixed(2)),
        pointsAgainst: parseFloat(pointsAgainst.toFixed(2)),
        gamesPlayed: wins + losses + ties,
      };
    }).sort((a, b) => b.wins - a.wins || b.pointsFor - a.pointsFor);
  },
});
