import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { paymentAttemptSchemaValidator } from "./paymentAttemptTypes";

export default defineSchema({
    // Core tables for initial deployment
    users: defineTable({
      name: v.string(),
      // this the Clerk ID, stored in the subject JWT field
      externalId: v.string(),
    }).index("byExternalId", ["externalId"]),
    
    paymentAttempts: defineTable(paymentAttemptSchemaValidator)
      .index("byPaymentId", ["payment_id"])
      .index("byUserId", ["userId"])
      .index("byPayerUserId", ["payer.user_id"]),

    // Fantasy Football League Schema - Phase 1: Core League Structure
    leagues: defineTable({
      name: v.string(),
      espnLeagueId: v.optional(v.number()),
      platform: v.string(), // "ESPN", "Yahoo", "Sleeper", etc.
      commissionerId: v.id("users"),
      createdAt: v.number(),
      updatedAt: v.number(),
    }).index("byCommissioner", ["commissionerId"])
      .index("byEspnLeagueId", ["espnLeagueId"]),

    // Fantasy Football League Schema - Phase 2: Full Data Structure
    seasons: defineTable({
      leagueId: v.id("leagues"),
      year: v.number(),
      isActive: v.boolean(),
      totalTeams: v.number(),
      playoffTeams: v.number(),
      regularSeasonWeeks: v.number(),
      playoffWeeks: v.number(),
      dataSource: v.string(), // "ESPN", "MANUAL", "IMPORTED"
      hasCompleteData: v.boolean(), // true if all data is available
      createdAt: v.number(),
      updatedAt: v.number(),
    }).index("byLeague", ["leagueId"])
      .index("byYear", ["year"])
      .index("byLeagueAndYear", ["leagueId", "year"])
      .index("byDataSource", ["dataSource"]),

    teams: defineTable({
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
      streakType: v.string(), // "WIN", "LOSS"
      createdAt: v.number(),
      updatedAt: v.number(),
    }).index("byLeague", ["leagueId"])
      .index("bySeason", ["seasonId"])
      .index("byOwner", ["ownerId"])
      .index("byLeagueAndSeason", ["leagueId", "seasonId"])
      .index("byEspnTeamId", ["espnTeamId"]),

    players: defineTable({
      name: v.string(),
      position: v.string(),
      team: v.optional(v.string()), // NFL team
      espnPlayerId: v.optional(v.number()),
      createdAt: v.number(),
      updatedAt: v.number(),
    }).index("byEspnPlayerId", ["espnPlayerId"])
      .index("byPosition", ["position"]),

    rosterEntries: defineTable({
      teamId: v.id("teams"),
      playerId: v.id("players"),
      seasonId: v.id("seasons"),
      week: v.optional(v.number()),
      points: v.number(),
      isStarter: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }).index("byTeam", ["teamId"])
      .index("byPlayer", ["playerId"])
      .index("bySeason", ["seasonId"])
      .index("byTeamAndSeason", ["teamId", "seasonId"]),

    transactions: defineTable({
      leagueId: v.id("leagues"),
      seasonId: v.id("seasons"),
      type: v.string(), // "TRADE", "WAIVER", "FREE_AGENT", "DRAFT"
      description: v.string(),
      involvedTeams: v.array(v.id("teams")),
      involvedPlayers: v.array(v.id("players")),
      week: v.optional(v.number()),
      createdAt: v.number(),
      updatedAt: v.number(),
    }).index("byLeague", ["leagueId"])
      .index("bySeason", ["seasonId"])
      .index("byType", ["type"])
      .index("byLeagueAndSeason", ["leagueId", "seasonId"]),

    draftPicks: defineTable({
      leagueId: v.id("leagues"),
      seasonId: v.id("seasons"),
      teamId: v.id("teams"),
      playerId: v.id("players"),
      round: v.number(),
      pick: v.number(),
      overallPick: v.number(),
      createdAt: v.number(),
    }).index("byLeague", ["leagueId"])
      .index("bySeason", ["seasonId"])
      .index("byTeam", ["teamId"])
      .index("byLeagueAndSeason", ["leagueId", "seasonId"]),

    // Matchups/Games table for storing weekly matchups
    matchups: defineTable({
      leagueId: v.id("leagues"),
      seasonId: v.id("seasons"),
      week: v.number(),
      homeTeamId: v.id("teams"),
      awayTeamId: v.id("teams"),
      homeScore: v.number(),
      awayScore: v.number(),
      gameType: v.string(), // "REGULAR", "PLAYOFF", "CHAMPIONSHIP"
      createdAt: v.number(),
      updatedAt: v.number(),
    }).index("byLeague", ["leagueId"])
      .index("bySeason", ["seasonId"])
      .index("byWeek", ["week"])
      .index("bySeasonAndWeek", ["seasonId", "week"])
      .index("byHomeTeam", ["homeTeamId"])
      .index("byAwayTeam", ["awayTeamId"])
      .index("byLeagueAndSeason", ["leagueId", "seasonId"]),
  });