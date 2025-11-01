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

    // Owner identity table - normalized across seasons
    owners: defineTable({
      displayName: v.string(),
      espnOwnerId: v.optional(v.number()),
      userId: v.id("users"),
      createdAt: v.optional(v.number()),
      updatedAt: v.number(),
    }).index("byUserId", ["userId"])
      .index("byDisplayName", ["displayName"])
      .index("byEspnOwnerId", ["espnOwnerId"]),

    // Fantasy Football League Schema - Phase 1: Core League Structure
    leagues: defineTable({
      name: v.string(),
      espnLeagueId: v.optional(v.number()),
      platform: v.string(), // "ESPN", "Yahoo", "Sleeper", etc.
      commissionerId: v.id("users"),
      createdAt: v.optional(v.number()),
      updatedAt: v.number(),
    }).index("byCommissioner", ["commissionerId"])
      .index("byEspnLeagueId", ["espnLeagueId"]),

    // Fantasy Football League Schema - Phase 2: Full Data Structure
    seasons: defineTable({
      leagueId: v.optional(v.id("leagues")),
      year: v.number(),
      isActive: v.boolean(),
      playoffTeams: v.number(),
      regularSeasonWeeks: v.number(),
      playoffWeeks: v.number(),
      dataSource: v.string(), // "ESPN", "MANUAL", "IMPORTED"
      createdAt: v.optional(v.number()),
      updatedAt: v.number(),
      // Legacy fields - kept for backward compat, not used in code
      totalTeams: v.optional(v.number()),
      hasCompleteData: v.optional(v.boolean()),
    }).index("byLeague", ["leagueId"])
      .index("byYear", ["year"])
      .index("byLeagueAndYear", ["leagueId", "year"])
      .index("byDataSource", ["dataSource"]),

    teams: defineTable({
      leagueId: v.optional(v.id("leagues")),
      seasonId: v.id("seasons"),
      espnTeamId: v.optional(v.number()),
      name: v.string(),
      ownerId: v.id("owners"),
      standing: v.number(),
      finalStanding: v.optional(v.number()),
      createdAt: v.optional(v.number()),
      updatedAt: v.number(),
      // Legacy fields - kept for backward compat, calculated from matchups now
      wins: v.optional(v.number()),
      losses: v.optional(v.number()),
      ties: v.optional(v.number()),
      pointsFor: v.optional(v.number()),
      pointsAgainst: v.optional(v.number()),
      streakLength: v.optional(v.number()),
      streakType: v.optional(v.string()),
      ownerDisplayName: v.optional(v.string()),
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
      createdAt: v.optional(v.number()),
      updatedAt: v.number(),
    }).index("byEspnPlayerId", ["espnPlayerId"])
      .index("byPosition", ["position"]),

    rosterEntries: defineTable({
      teamId: v.id("teams"),
      playerId: v.id("players"),
      seasonId: v.id("seasons"),
      week: v.optional(v.number()),
      points: v.number(),
      createdAt: v.optional(v.number()),
      updatedAt: v.number(),
      isStarter: v.optional(v.boolean()), // Legacy field - not used
    }).index("byTeam", ["teamId"])
      .index("byPlayer", ["playerId"])
      .index("bySeason", ["seasonId"])
      .index("byTeamAndSeason", ["teamId", "seasonId"]),

    transactions: defineTable({
      leagueId: v.optional(v.id("leagues")),
      seasonId: v.id("seasons"),
      type: v.string(), // "TRADE", "WAIVER", "FREE_AGENT", "DRAFT"
      description: v.string(),
      involvedTeams: v.array(v.id("teams")),
      involvedPlayers: v.array(v.id("players")),
      week: v.optional(v.number()),
      createdAt: v.optional(v.number()),
      updatedAt: v.number(),
    }).index("byLeague", ["leagueId"])
      .index("bySeason", ["seasonId"])
      .index("byType", ["type"])
      .index("byLeagueAndSeason", ["leagueId", "seasonId"]),

    draftPicks: defineTable({
      leagueId: v.optional(v.id("leagues")),
      seasonId: v.id("seasons"),
      teamId: v.id("teams"),
      playerId: v.id("players"),
      round: v.number(),
      pick: v.number(),
      overallPick: v.number(),
      createdAt: v.optional(v.number()),
    }).index("byLeague", ["leagueId"])
      .index("bySeason", ["seasonId"])
      .index("byTeam", ["teamId"])
      .index("byLeagueAndSeason", ["leagueId", "seasonId"]),

    // Matchups/Games table for storing weekly matchups
    matchups: defineTable({
      leagueId: v.optional(v.id("leagues")),
      seasonId: v.id("seasons"),
      week: v.number(),
      homeTeamId: v.id("teams"),
      awayTeamId: v.id("teams"),
      homeScore: v.number(),
      awayScore: v.number(),
      gameType: v.string(), // "REGULAR", "PLAYOFF", "CHAMPIONSHIP"
      createdAt: v.optional(v.number()),
      updatedAt: v.number(),
    }).index("byLeague", ["leagueId"])
      .index("bySeason", ["seasonId"])
      .index("byWeek", ["week"])
      .index("bySeasonAndWeek", ["seasonId", "week"])
      .index("byHomeTeam", ["homeTeamId"])
      .index("byAwayTeam", ["awayTeamId"])
      .index("byLeagueAndSeason", ["leagueId", "seasonId"]),
  });