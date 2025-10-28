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
