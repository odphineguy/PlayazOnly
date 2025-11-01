import { mutation } from "./_generated/server";

const BATCH_SIZE = 50; // Process 50 records at a time to stay well under limits

/**
 * Remove leagueId and createdAt from draftPicks table
 */
export const removeFieldsFromDraftPicks = mutation({
  args: {},
  handler: async (ctx) => {
    let updated = 0;
    const allDocs = await ctx.db.query("draftPicks").take(4095); // Max reads per execution
    
    for (const doc of allDocs) {
      const { leagueId, createdAt, _id, _creationTime, ...rest } = doc;
      await ctx.db.replace(doc._id, rest);
      updated++;
    }

    return { updated, total: allDocs.length };
  },
});

/**
 * Remove leagueId and createdAt from matchups table
 */
export const removeFieldsFromMatchups = mutation({
  args: {},
  handler: async (ctx) => {
    let updated = 0;
    const allDocs = await ctx.db.query("matchups").take(4095);
    
    for (const doc of allDocs) {
      const { leagueId, createdAt, _id, _creationTime, ...rest } = doc;
      await ctx.db.replace(doc._id, rest);
      updated++;
    }

    return { updated, total: allDocs.length };
  },
});

/**
 * Remove leagueId and createdAt from teams table
 */
export const removeFieldsFromTeams = mutation({
  args: {},
  handler: async (ctx) => {
    let updated = 0;
    const allDocs = await ctx.db.query("teams").take(4095);
    
    for (const doc of allDocs) {
      const { leagueId, createdAt, _id, _creationTime, ...rest } = doc;
      await ctx.db.replace(doc._id, rest);
      updated++;
    }

    return { updated, total: allDocs.length };
  },
});

/**
 * Remove leagueId and createdAt from transactions table
 */
export const removeFieldsFromTransactions = mutation({
  args: {},
  handler: async (ctx) => {
    let updated = 0;
    const allDocs = await ctx.db.query("transactions").take(4095);
    
    for (const doc of allDocs) {
      const { leagueId, createdAt, _id, _creationTime, ...rest } = doc;
      await ctx.db.replace(doc._id, rest);
      updated++;
    }

    return { updated, total: allDocs.length };
  },
});

/**
 * Remove leagueId and createdAt from seasons table
 */
export const removeFieldsFromSeasons = mutation({
  args: {},
  handler: async (ctx) => {
    let updated = 0;
    const allDocs = await ctx.db.query("seasons").take(4095);
    
    for (const doc of allDocs) {
      const { leagueId, createdAt, _id, _creationTime, ...rest } = doc;
      await ctx.db.replace(doc._id, rest);
      updated++;
    }

    return { updated, total: allDocs.length };
  },
});

/**
 * Remove createdAt from players table
 */
export const removeCreatedAtFromPlayers = mutation({
  args: {},
  handler: async (ctx) => {
    let updated = 0;
    const allDocs = await ctx.db.query("players").take(4095);
    
    for (const doc of allDocs) {
      const { createdAt, _id, _creationTime, ...rest } = doc;
      await ctx.db.replace(doc._id, rest);
      updated++;
    }

    return { updated, total: allDocs.length };
  },
});

/**
 * Remove createdAt from rosterEntries table
 */
export const removeCreatedAtFromRosterEntries = mutation({
  args: {},
  handler: async (ctx) => {
    let updated = 0;
    const allDocs = await ctx.db.query("rosterEntries").take(4095);
    
    for (const doc of allDocs) {
      const { createdAt, _id, _creationTime, ...rest } = doc;
      await ctx.db.replace(doc._id, rest);
      updated++;
    }

    return { updated, total: allDocs.length };
  },
});

/**
 * Remove createdAt from leagues table
 */
export const removeCreatedAtFromLeagues = mutation({
  args: {},
  handler: async (ctx) => {
    let updated = 0;
    const allDocs = await ctx.db.query("leagues").take(4095);

    for (const doc of allDocs) {
      const { createdAt, _id, _creationTime, ...rest } = doc;
      await ctx.db.replace(doc._id, rest);
      updated++;
    }

    return { updated, total: allDocs.length };
  },
});

/**
 * CRITICAL: Remove denormalized owner/team data from draftPicks table
 * This is the main storage reducer - these fields were migrated to owners/teamStats/vorCache tables
 */
export const removeDenormalizedDataFromPicks = mutation({
  args: {},
  handler: async (ctx) => {
    let updated = 0;
    const allDocs = await ctx.db.query("draftPicks").take(4095);

    for (const doc of allDocs) {
      // Build new object with only schema-defined fields
      const cleanedDoc: any = {
        seasonId: doc.seasonId,
        teamId: doc.teamId,
        playerId: doc.playerId,
        round: doc.round,
        pick: doc.pick,
        overallPick: doc.overallPick,
      };

      // Add optional fields if they exist
      if ((doc as any).leagueId !== undefined) {
        cleanedDoc.leagueId = (doc as any).leagueId;
      }
      if ((doc as any).createdAt !== undefined) {
        cleanedDoc.createdAt = (doc as any).createdAt;
      }

      await ctx.db.replace(doc._id, cleanedDoc);
      updated++;
    }

    return {
      updated,
      total: allDocs.length,
      message: `Removed denormalized owner/team/VOR data from ${updated} draft picks`
    };
  },
});

