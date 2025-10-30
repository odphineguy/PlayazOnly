import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// League Management Functions
export const createLeague = mutation({
  args: {
    name: v.string(),
    espnLeagueId: v.optional(v.number()),
    platform: v.string(),
    commissionerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("leagues", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getLeaguesByCommissioner = query({
  args: { commissionerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leagues")
      .withIndex("byCommissioner", (q) => q.eq("commissionerId", args.commissionerId))
      .collect();
  },
});

export const getLeagueById = query({
  args: { leagueId: v.id("leagues") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.leagueId);
  },
});

// Season Management Functions
export const createSeason = mutation({
  args: {
    leagueId: v.id("leagues"),
    year: v.number(),
    isActive: v.boolean(),
    totalTeams: v.number(),
    playoffTeams: v.number(),
    regularSeasonWeeks: v.number(),
    playoffWeeks: v.number(),
    dataSource: v.string(), // "ESPN", "MANUAL", "IMPORTED"
    hasCompleteData: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("seasons", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Create placeholder seasons for 2010-2017
export const createHistoricalSeasons = mutation({
  args: {
    leagueId: v.id("leagues"),
    startYear: v.number(),
    endYear: v.number(),
  },
  handler: async (ctx, args) => {
    const { leagueId, startYear, endYear } = args;
    const now = Date.now();
    const seasons = [];

    for (let year = startYear; year <= endYear; year++) {
      const seasonId = await ctx.db.insert("seasons", {
        leagueId,
        year,
        isActive: false,
        totalTeams: 12, // Default team count
        playoffTeams: 6, // Default playoff teams
        regularSeasonWeeks: 14,
        playoffWeeks: 3,
        dataSource: "MANUAL",
        hasCompleteData: false, // Will be updated when data is added
        createdAt: now,
        updatedAt: now,
      });
      seasons.push({ year, seasonId });
    }

    return {
      seasonsCreated: seasons.length,
      seasons,
      message: `Created ${seasons.length} historical seasons from ${startYear} to ${endYear}`,
    };
  },
});

export const getSeasonsByLeague = query({
  args: { leagueId: v.id("leagues") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("seasons")
      .withIndex("byLeague", (q) => q.eq("leagueId", args.leagueId))
      .order("desc")
      .collect();
  },
});

// Team Management Functions
export const createTeam = mutation({
  args: {
    leagueId: v.id("leagues"),
    seasonId: v.id("seasons"),
    espnTeamId: v.optional(v.number()),
    name: v.string(),
    ownerId: v.id("users"),
    wins: v.number(),
    losses: v.number(),
    ties: v.optional(v.number()),
    pointsFor: v.number(),
    pointsAgainst: v.number(),
    standing: v.number(),
    finalStanding: v.optional(v.number()),
    streakLength: v.number(),
    streakType: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("teams", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getTeamsBySeason = query({
  args: { seasonId: v.id("seasons") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("teams")
      .withIndex("bySeason", (q) => q.eq("seasonId", args.seasonId))
      .order("asc")
      .collect();
  },
});

export const getTeamsByLeague = query({
  args: { leagueId: v.id("leagues") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("teams")
      .withIndex("byLeague", (q) => q.eq("leagueId", args.leagueId))
      .collect();
  },
});

// Player Management Functions
export const createPlayer = mutation({
  args: {
    name: v.string(),
    position: v.string(),
    team: v.optional(v.string()),
    espnPlayerId: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("players", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getPlayersByPosition = query({
  args: { position: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("players")
      .withIndex("byPosition", (q) => q.eq("position", args.position))
      .collect();
  },
});

// Transaction Management Functions
export const createTransaction = mutation({
  args: {
    leagueId: v.id("leagues"),
    seasonId: v.id("seasons"),
    type: v.string(),
    description: v.string(),
    involvedTeams: v.array(v.id("teams")),
    involvedPlayers: v.array(v.id("players")),
    week: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("transactions", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getTransactionsBySeason = query({
  args: { seasonId: v.id("seasons") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .withIndex("bySeason", (q) => q.eq("seasonId", args.seasonId))
      .order("desc")
      .collect();
  },
});

// Get all transactions
export const getAllTransactions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("transactions").order("desc").collect();
  },
});

// Get transactions by type and season
export const getTransactionsByTypeAndSeason = query({
  args: { 
    seasonId: v.optional(v.id("seasons")),
    type: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let transactions;
    
    if (args.seasonId) {
      transactions = await ctx.db
        .query("transactions")
        .withIndex("bySeason", (q) => q.eq("seasonId", args.seasonId!))
        .collect();
    } else {
      transactions = await ctx.db.query("transactions").collect();
    }
    
    if (args.type) {
      return transactions.filter(t => t.type === args.type).sort((a, b) => b.createdAt - a.createdAt);
    }
    
    return transactions.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Get transaction statistics (aggregated counts by type)
export const getTransactionStats = query({
  args: { 
    seasonId: v.optional(v.id("seasons")),
    teamId: v.optional(v.id("teams"))
  },
  handler: async (ctx, args) => {
    let allTransactions;
    
    if (args.seasonId) {
      allTransactions = await ctx.db
        .query("transactions")
        .withIndex("bySeason", (q) => q.eq("seasonId", args.seasonId!))
        .collect();
    } else {
      allTransactions = await ctx.db.query("transactions").collect();
    }
    
    // Filter by team if specified
    const transactions = args.teamId 
      ? allTransactions.filter(t => t.involvedTeams.includes(args.teamId!))
      : allTransactions;
    
    // Count by type
    const stats = {
      total: transactions.length,
      waivers: 0,
      trades: 0,
      freeAgents: 0,
      drops: 0,
      other: 0,
    };
    
    transactions.forEach(t => {
      const type = t.type.toUpperCase();
      if (type.includes("WAIVER")) {
        stats.waivers++;
      } else if (type.includes("TRADE")) {
        stats.trades++;
      } else if (type.includes("FREE_AGENT") || type.includes("ADD")) {
        stats.freeAgents++;
      } else if (type.includes("DROP")) {
        stats.drops++;
      } else {
        stats.other++;
      }
    });
    
    return stats;
  },
});

// Get transaction statistics by year for charts
// This query aggregates transactions by year for display in the chart
export const getTransactionStatsByYear = query({
  args: {},
  handler: async (ctx) => {
    const seasons = await ctx.db.query("seasons").collect();
    const transactions = await ctx.db.query("transactions").collect();
    
    // Group transactions by season
    const transactionsBySeason = new Map<any, typeof transactions>();
    transactions.forEach(t => {
      const existing = transactionsBySeason.get(t.seasonId) || [];
      existing.push(t);
      transactionsBySeason.set(t.seasonId, existing);
    });
    
    // Create season map for quick lookup
    const seasonMap = new Map<any, (typeof seasons)[number]>();
    seasons.forEach(s => seasonMap.set(s._id, s));
    
    // Aggregate stats by year
    const statsByYear = new Map<number, { year: number; totalTransactions: number; totalTrades: number; totalWaivers: number }>();
    
    transactionsBySeason.forEach((txns, seasonId) => {
      const season = seasonMap.get(seasonId);
      if (!season) return;
      
      const year = season.year;
      if (!statsByYear.has(year)) {
        statsByYear.set(year, {
          year,
          totalTransactions: 0,
          totalTrades: 0,
          totalWaivers: 0,
        });
      }
      
      const stats = statsByYear.get(year)!;
      stats.totalTransactions += txns.length;
      
      txns.forEach(t => {
        const type = t.type.toUpperCase();
        if (type.includes("TRADE")) {
          stats.totalTrades++;
        } else if (type.includes("WAIVER")) {
          stats.totalWaivers++;
        }
      });
    });
    
    // Convert to array and sort by year
    return Array.from(statsByYear.values()).sort((a, b) => a.year - b.year);
  },
});

// Get transaction rankings by team (top performers in transactions)
export const getTransactionRankings = query({
  args: { 
    seasonId: v.optional(v.id("seasons")),
    type: v.optional(v.string()) // "WAIVER", "TRADE", etc.
  },
  handler: async (ctx, args) => {
    const seasons = await ctx.db.query("seasons").collect();
    const seasonMap = new Map(seasons.map(s => [s._id, s]));
    
    let transactions;
    if (args.seasonId) {
      transactions = await ctx.db
        .query("transactions")
        .withIndex("bySeason", (q) => q.eq("seasonId", args.seasonId!))
        .collect();
    } else {
      transactions = await ctx.db.query("transactions").collect();
    }
    
    // Filter by type if specified
    if (args.type) {
      transactions = transactions.filter(t => t.type.toUpperCase().includes(args.type!.toUpperCase()));
    }
    
    // Count transactions per team
    const teamStats = new Map<string, { teamId: string; count: number; seasonIds: Set<any> }>();
    
    transactions.forEach(t => {
      t.involvedTeams.forEach(teamId => {
        if (!teamStats.has(teamId)) {
          teamStats.set(teamId, { teamId, count: 0, seasonIds: new Set() });
        }
        const stats = teamStats.get(teamId)!;
        stats.count++;
        stats.seasonIds.add(t.seasonId);
      });
    });
    
    // Convert to array and calculate per-season averages
    const rankings = Array.from(teamStats.values()).map(stats => {
      const seasonsCount = args.seasonId ? 1 : stats.seasonIds.size;
      return {
        teamId: stats.teamId,
        count: stats.count,
        avgPerSeason: stats.count / Math.max(seasonsCount, 1),
      };
    }).sort((a, b) => b.avgPerSeason - a.avgPerSeason);
    
    // Get team details for top rankings
    const teams = await ctx.db.query("teams").collect();
    const teamMap = new Map(teams.map(t => [t._id, t]));
    
    return rankings.slice(0, 10).map(rank => ({
      team: teamMap.get(rank.teamId as any),
      count: rank.count,
      avgPerSeason: rank.avgPerSeason,
    })).filter(r => r.team);
  },
});

// Draft Pick Management Functions
export const createDraftPick = mutation({
  args: {
    leagueId: v.id("leagues"),
    seasonId: v.id("seasons"),
    teamId: v.id("teams"),
    playerId: v.id("players"),
    round: v.number(),
    pick: v.number(),
    overallPick: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("draftPicks", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getDraftPicksBySeason = query({
  args: { seasonId: v.id("seasons") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("draftPicks")
      .withIndex("bySeason", (q) => q.eq("seasonId", args.seasonId))
      .order("asc")
      .collect();
  },
});

// Analytics Functions
export const getLeagueStats = query({
  args: { leagueId: v.id("leagues") },
  handler: async (ctx, args) => {
    const seasons = await ctx.db
      .query("seasons")
      .withIndex("byLeague", (q) => q.eq("leagueId", args.leagueId))
      .collect();

    const teams = await ctx.db
      .query("teams")
      .withIndex("byLeague", (q) => q.eq("leagueId", args.leagueId))
      .collect();

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("byLeague", (q) => q.eq("leagueId", args.leagueId))
      .collect();

    return {
      totalSeasons: seasons.length,
      totalTeams: teams.length,
      totalTransactions: transactions.length,
      seasons: seasons.map(season => ({
        ...season,
        teams: teams.filter(team => team.seasonId === season._id),
      })),
    };
  },
});

// Sample Data Functions
export const createSampleData = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // First, create a sample user
    const userId = await ctx.db.insert("users", {
      name: "Sample User",
      externalId: "sample_user_123",
    });
    
    // Create a sample league
    const leagueId = await ctx.db.insert("leagues", {
      name: "PlayazOnly Fantasy League",
      platform: "ESPN",
      commissionerId: userId,
      createdAt: now,
      updatedAt: now,
    });

    // Create sample seasons
    const seasons = [];
    for (let year = 2018; year <= 2024; year++) {
      const seasonId = await ctx.db.insert("seasons", {
        leagueId,
        year,
        isActive: year === 2024,
        totalTeams: 12,
        playoffTeams: 6,
        regularSeasonWeeks: 14,
        playoffWeeks: 3,
        dataSource: "MANUAL",
        hasCompleteData: true,
        createdAt: now,
        updatedAt: now,
      });
      seasons.push({ year, seasonId });
    }

    // Create sample teams for 2024 season
    const currentSeason = seasons.find(s => s.year === 2024);
    if (currentSeason) {
      const teamNames = [
        "South Side Delinquents", "What would Breesus do?", "Chandler TopFeeders", 
        "Miami Big D Big Sack", "Young Money Cash Money", "Killer Beers",
        "Cock Blockers", "BOTTOM FEEDER", "The Tank", "OG LA Raiders",
        "Mad Men", "Wreaking Crew JDR"
      ];

      for (let i = 0; i < teamNames.length; i++) {
        await ctx.db.insert("teams", {
          leagueId,
          seasonId: currentSeason.seasonId,
          name: teamNames[i],
          ownerId: userId, // Use the same user for all teams
          wins: Math.floor(Math.random() * 10),
          losses: Math.floor(Math.random() * 10),
          ties: 0,
          pointsFor: Math.floor(Math.random() * 2000) + 1000,
          pointsAgainst: Math.floor(Math.random() * 2000) + 1000,
          standing: i + 1,
          streakLength: Math.floor(Math.random() * 5),
          streakType: Math.random() > 0.5 ? "WIN" : "LOSS",
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return {
      message: "Sample data created successfully!",
      leagueId,
      userId,
      seasonsCreated: seasons.length,
      teamsCreated: 12,
    };
  },
});

// Get all leagues
export const getAllLeagues = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("leagues").collect();
  },
});

// Get all seasons
export const getAllSeasons = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("seasons").collect();
  },
});

// Get all teams
export const getAllTeams = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("teams").collect();
  },
});

// Debug: Check what owner data we have
export const debugTeamOwners = query({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db.query("teams").collect();
    const sample = teams.slice(0, 20).map(t => ({
      name: t.name,
      ownerDisplayName: t.ownerDisplayName,
      wins: t.wins,
      losses: t.losses,
      seasonId: t.seasonId
    }));

    return {
      totalTeams: teams.length,
      sample,
      uniqueOwners: [...new Set(teams.map(t => t.ownerDisplayName))],
      uniqueTeamNames: [...new Set(teams.map(t => t.name))]
    };
  },
});

// Get all matchups
export const getAllMatchups = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("matchups").collect();
  },
});

// Get matchup by ID
export const getMatchupById = query({
  args: { matchupId: v.id("matchups") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.matchupId);
  },
});

// Clear all fantasy football data (for re-importing fresh data)
export const clearAllData = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete in order: teams, seasons, leagues (to avoid foreign key issues)
    const teams = await ctx.db.query("teams").collect();
    for (const team of teams) {
      await ctx.db.delete(team._id);
    }

    const matchups = await ctx.db.query("matchups").collect();
    for (const matchup of matchups) {
      await ctx.db.delete(matchup._id);
    }

    const seasons = await ctx.db.query("seasons").collect();
    for (const season of seasons) {
      await ctx.db.delete(season._id);
    }

    const leagues = await ctx.db.query("leagues").collect();
    for (const league of leagues) {
      await ctx.db.delete(league._id);
    }

    return {
      message: "All data cleared successfully!",
      teamsDeleted: teams.length,
      matchupsDeleted: matchups.length,
      seasonsDeleted: seasons.length,
      leaguesDeleted: leagues.length
    };
  },
});

// Gamecenter-specific queries

// Get top matchups by total score (shootouts)
export const getTopMatchups = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const matchups = await ctx.db.query("matchups").collect();
    
    // Calculate total score for each matchup and sort
    const matchupsWithTotalScore = matchups.map(matchup => ({
      ...matchup,
      totalScore: matchup.homeScore + matchup.awayScore
    })).sort((a, b) => b.totalScore - a.totalScore);
    
    return matchupsWithTotalScore.slice(0, limit);
  },
});

// Get lowest scoring matchups (snoozers)
export const getLowestMatchups = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const matchups = await ctx.db.query("matchups").collect();
    
    // Calculate total score for each matchup and sort
    const matchupsWithTotalScore = matchups.map(matchup => ({
      ...matchup,
      totalScore: matchup.homeScore + matchup.awayScore
    })).sort((a, b) => a.totalScore - b.totalScore);
    
    return matchupsWithTotalScore.slice(0, limit);
  },
});

// Get biggest blowouts (largest margin of victory)
export const getBiggestBlowouts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const matchups = await ctx.db.query("matchups").collect();
    
    // Calculate margin for each matchup and sort
    const matchupsWithMargin = matchups.map(matchup => ({
      ...matchup,
      margin: Math.abs(matchup.homeScore - matchup.awayScore)
    })).sort((a, b) => b.margin - a.margin);
    
    return matchupsWithMargin.slice(0, limit);
  },
});

// Get closest matchups (nailbiters)
export const getClosestMatchups = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const matchups = await ctx.db.query("matchups").collect();
    
    // Calculate margin for each matchup and sort
    const matchupsWithMargin = matchups.map(matchup => ({
      ...matchup,
      margin: Math.abs(matchup.homeScore - matchup.awayScore)
    })).sort((a, b) => a.margin - b.margin);
    
    return matchupsWithMargin.slice(0, limit);
  },
});

// Get championship matchups
export const getChampionshipMatchups = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const matchups = await ctx.db.query("matchups")
      .filter((q) => q.eq(q.field("gameType"), "CHAMPIONSHIP"))
      .collect();
    
    // Sort by season and week
    return matchups.sort((a, b) => {
      // We'll need to get season data to sort properly
      return b.createdAt - a.createdAt; // For now, sort by creation time
    }).slice(0, limit);
  },
});

// Get matchups by week for a specific season
export const getMatchupsByWeek = query({
  args: { 
    seasonId: v.id("seasons"),
    week: v.number()
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("matchups")
      .withIndex("bySeasonAndWeek", (q) => q.eq("seasonId", args.seasonId).eq("week", args.week))
      .collect();
  },
});

// Get matchup statistics for a specific matchup
export const getMatchupStats = query({
  args: { matchupId: v.id("matchups") },
  handler: async (ctx, args) => {
    const matchup = await ctx.db.get(args.matchupId);
    if (!matchup) return null;
    
    // Get teams
    const homeTeam = await ctx.db.get(matchup.homeTeamId);
    const awayTeam = await ctx.db.get(matchup.awayTeamId);
    
    if (!homeTeam || !awayTeam) return null;
    
    // Get season data for league averages
    const season = await ctx.db.get(matchup.seasonId);
    if (!season) return null;
    
    // Get all matchups for this season to calculate league average
    const seasonMatchups = await ctx.db.query("matchups")
      .withIndex("bySeason", (q) => q.eq("seasonId", matchup.seasonId))
      .collect();
    
    const leagueAvgScore = seasonMatchups.length > 0 
      ? seasonMatchups.reduce((sum, m) => sum + m.homeScore + m.awayScore, 0) / (seasonMatchups.length * 2)
      : 0;
    
    // Calculate team averages
    const homeTeamAvg = homeTeam.pointsFor / (homeTeam.wins + homeTeam.losses);
    const awayTeamAvg = awayTeam.pointsFor / (awayTeam.wins + awayTeam.losses);
    
    // Calculate luck factors (simplified)
    const homeLuckFactor = ((matchup.homeScore - homeTeamAvg) / homeTeamAvg) * 100;
    const awayLuckFactor = ((matchup.awayScore - awayTeamAvg) / awayTeamAvg) * 100;
    
    return {
      matchup,
      homeTeam,
      awayTeam,
      season,
      leagueAvgScore,
      homeTeamAvg,
      awayTeamAvg,
      homeLuckFactor,
      awayLuckFactor,
      margin: Math.abs(matchup.homeScore - matchup.awayScore),
      totalScore: matchup.homeScore + matchup.awayScore
    };
  },
});

// Clean up duplicate data in the database
export const cleanupDuplicates = mutation({
  args: {},
  handler: async (ctx) => {
    let deletedSeasons = 0;
    let deletedTeams = 0;
    let deletedLeagues = 0;

    // 1. Remove duplicate leagues (keep oldest "Playaz Only" league)
    const allLeagues = await ctx.db.query("leagues").collect();
    const playazLeagues = allLeagues.filter(l => l.name === "Playaz Only");

    if (playazLeagues.length > 1) {
      // Sort by createdAt, keep the oldest
      playazLeagues.sort((a, b) => a.createdAt - b.createdAt);
      const keepLeague = playazLeagues[0];

      // Delete duplicates
      for (let i = 1; i < playazLeagues.length; i++) {
        await ctx.db.delete(playazLeagues[i]._id);
        deletedLeagues++;
      }

      // Use the kept league for cleanup
      const leagueId = keepLeague._id;

      // 2. Remove duplicate seasons for this league (keep most recent for each year)
      const allSeasons = await ctx.db.query("seasons")
        .withIndex("byLeague", (q) => q.eq("leagueId", leagueId))
        .collect();

      const seasonsByYear = new Map();
      allSeasons.forEach(season => {
        const existing = seasonsByYear.get(season.year);
        if (!existing || season.createdAt > existing.createdAt) {
          if (existing) {
            seasonsByYear.set(season.year, { keep: season, duplicates: [existing, ...(seasonsByYear.get(season.year)?.duplicates || [])] });
          } else {
            seasonsByYear.set(season.year, { keep: season, duplicates: [] });
          }
        } else {
          const current = seasonsByYear.get(season.year);
          seasonsByYear.set(season.year, {
            keep: current.keep,
            duplicates: [...current.duplicates, season]
          });
        }
      });

      // Delete duplicate seasons and their teams
      for (const [year, { keep, duplicates }] of seasonsByYear) {
        for (const dupSeason of duplicates) {
          // Delete all teams for this duplicate season
          const teamsToDelete = await ctx.db.query("teams")
            .withIndex("bySeason", (q) => q.eq("seasonId", dupSeason._id))
            .collect();

          for (const team of teamsToDelete) {
            await ctx.db.delete(team._id);
            deletedTeams++;
          }

          // Delete the duplicate season
          await ctx.db.delete(dupSeason._id);
          deletedSeasons++;
        }
      }

      // 3. Remove duplicate teams within kept seasons (same seasonId + name)
      const keptSeasons = Array.from(seasonsByYear.values()).map(s => s.keep);
      for (const season of keptSeasons) {
        const seasonTeams = await ctx.db.query("teams")
          .withIndex("bySeason", (q) => q.eq("seasonId", season._id))
          .collect();

        const teamsByName = new Map();
        seasonTeams.forEach(team => {
          const existing = teamsByName.get(team.name);
          if (!existing || team.createdAt > existing.createdAt) {
            if (existing) {
              teamsByName.set(team.name, { keep: team, duplicates: [existing, ...(teamsByName.get(team.name)?.duplicates || [])] });
            } else {
              teamsByName.set(team.name, { keep: team, duplicates: [] });
            }
          } else {
            const current = teamsByName.get(team.name);
            teamsByName.set(team.name, {
              keep: current.keep,
              duplicates: [...current.duplicates, team]
            });
          }
        });

        // Delete duplicate teams
        for (const [name, { keep, duplicates }] of teamsByName) {
          for (const dupTeam of duplicates) {
            await ctx.db.delete(dupTeam._id);
            deletedTeams++;
          }
        }
      }
    }

    return {
      message: "Cleanup completed!",
      deletedLeagues,
      deletedSeasons,
      deletedTeams
    };
  },
});

// Get weekly champion (highest scoring team in a specific week)
export const getWeeklyChamp = query({
  args: {
    seasonId: v.id("seasons"),
    week: v.number()
  },
  handler: async (ctx, args) => {
    // Validate season exists
    const season = await ctx.db.get(args.seasonId);
    if (!season) return null;

    const matchups = await ctx.db.query("matchups")
      .withIndex("bySeasonAndWeek", (q) => q.eq("seasonId", args.seasonId).eq("week", args.week))
      .collect();

    if (matchups.length === 0) return null;

    // Find the highest score across all matchups
    let highestScore = 0;
    let champTeamId = null;

    matchups.forEach(matchup => {
      if (matchup.homeScore > highestScore) {
        highestScore = matchup.homeScore;
        champTeamId = matchup.homeTeamId;
      }
      if (matchup.awayScore > highestScore) {
        highestScore = matchup.awayScore;
        champTeamId = matchup.awayTeamId;
      }
    });

    if (!champTeamId) return null;

    const team = await ctx.db.get(champTeamId);
    return { team, score: highestScore };
  },
});

// Get most disappointing team (biggest underperformance vs team average)
export const getMostDisappointing = query({
  args: {
    seasonId: v.id("seasons"),
    week: v.number()
  },
  handler: async (ctx, args) => {
    // Validate season exists
    const season = await ctx.db.get(args.seasonId);
    if (!season) return null;

    const matchups = await ctx.db.query("matchups")
      .withIndex("bySeasonAndWeek", (q) => q.eq("seasonId", args.seasonId).eq("week", args.week))
      .collect();

    if (matchups.length === 0) return null;

    let worstPerformance = 0;
    let disappointingTeamId = null;
    let disappointingScore = 0;

    for (const matchup of matchups) {
      // Check home team
      const homeTeam = await ctx.db.get(matchup.homeTeamId);
      if (homeTeam) {
        const games = homeTeam.wins + homeTeam.losses;
        if (games > 0) {
          const homeAvg = homeTeam.pointsFor / games;
          const homeDiff = matchup.homeScore - homeAvg;
          if (homeDiff < worstPerformance) {
            worstPerformance = homeDiff;
            disappointingTeamId = matchup.homeTeamId;
            disappointingScore = matchup.homeScore;
          }
        }
      }

      // Check away team
      const awayTeam = await ctx.db.get(matchup.awayTeamId);
      if (awayTeam) {
        const games = awayTeam.wins + awayTeam.losses;
        if (games > 0) {
          const awayAvg = awayTeam.pointsFor / games;
          const awayDiff = matchup.awayScore - awayAvg;
          if (awayDiff < worstPerformance) {
            worstPerformance = awayDiff;
            disappointingTeamId = matchup.awayTeamId;
            disappointingScore = matchup.awayScore;
          }
        }
      }
    }

    if (!disappointingTeamId) return null;

    const team = await ctx.db.get(disappointingTeamId);
    return { team, score: disappointingScore, underperformance: worstPerformance };
  },
});

// Get most dominating team (biggest margin of victory)
export const getMostDominating = query({
  args: {
    seasonId: v.id("seasons"),
    week: v.number()
  },
  handler: async (ctx, args) => {
    // Validate season exists
    const season = await ctx.db.get(args.seasonId);
    if (!season) return null;

    const matchups = await ctx.db.query("matchups")
      .withIndex("bySeasonAndWeek", (q) => q.eq("seasonId", args.seasonId).eq("week", args.week))
      .collect();

    if (matchups.length === 0) return null;

    let biggestMargin = 0;
    let dominatingTeamId = null;
    let dominatingScore = 0;

    matchups.forEach(matchup => {
      const margin = Math.abs(matchup.homeScore - matchup.awayScore);
      if (margin > biggestMargin) {
        biggestMargin = margin;
        if (matchup.homeScore > matchup.awayScore) {
          dominatingTeamId = matchup.homeTeamId;
          dominatingScore = matchup.homeScore;
        } else {
          dominatingTeamId = matchup.awayTeamId;
          dominatingScore = matchup.awayScore;
        }
      }
    });

    if (!dominatingTeamId) return null;

    const team = await ctx.db.get(dominatingTeamId);
    return { team, score: dominatingScore, margin: biggestMargin };
  },
});

// Get luckiest team (highest positive luck factor)
export const getLuckiest = query({
  args: {
    seasonId: v.id("seasons"),
    week: v.number()
  },
  handler: async (ctx, args) => {
    // Validate season exists
    const season = await ctx.db.get(args.seasonId);
    if (!season) return null;

    const matchups = await ctx.db.query("matchups")
      .withIndex("bySeasonAndWeek", (q) => q.eq("seasonId", args.seasonId).eq("week", args.week))
      .collect();

    if (matchups.length === 0) return null;

    let highestLuck = -Infinity;
    let luckiestTeamId = null;
    let luckiestScore = 0;

    for (const matchup of matchups) {
      // Check home team (only if they won)
      if (matchup.homeScore > matchup.awayScore) {
        const homeTeam = await ctx.db.get(matchup.homeTeamId);
        if (homeTeam) {
          const games = homeTeam.wins + homeTeam.losses;
          if (games > 0) {
            const homeAvg = homeTeam.pointsFor / games;
            if (homeAvg > 0) {
              const homeLuck = ((matchup.homeScore - homeAvg) / homeAvg) * 100;
              if (homeLuck > highestLuck) {
                highestLuck = homeLuck;
                luckiestTeamId = matchup.homeTeamId;
                luckiestScore = matchup.homeScore;
              }
            }
          }
        }
      }

      // Check away team (only if they won)
      if (matchup.awayScore > matchup.homeScore) {
        const awayTeam = await ctx.db.get(matchup.awayTeamId);
        if (awayTeam) {
          const games = awayTeam.wins + awayTeam.losses;
          if (games > 0) {
            const awayAvg = awayTeam.pointsFor / games;
            if (awayAvg > 0) {
              const awayLuck = ((matchup.awayScore - awayAvg) / awayAvg) * 100;
              if (awayLuck > highestLuck) {
                highestLuck = awayLuck;
                luckiestTeamId = matchup.awayTeamId;
                luckiestScore = matchup.awayScore;
              }
            }
          }
        }
      }
    }

    if (!luckiestTeamId) return null;

    const team = await ctx.db.get(luckiestTeamId);
    return { team, score: luckiestScore, luckFactor: highestLuck };
  },
});
