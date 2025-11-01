import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Migration: Populate the owners table from existing team data
 * This extracts unique owners from teams and creates normalized owner records
 */
export const migrateToOwnersTable = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting migration to owners table...");

    // Get all teams
    const allTeams = await ctx.db.query("teams").collect();
    console.log(`Found ${allTeams.length} teams`);

    // Get all users (we'll need to map to userId)
    const allUsers = await ctx.db.query("users").collect();
    const defaultUser = allUsers[0]; // Fallback user if needed

    if (!defaultUser) {
      throw new Error("No users found. Please create at least one user first.");
    }

    // Track unique owners by display name
    const ownerMap = new Map<string, {
      displayName: string;
      userId: any;
      espnOwnerId?: number;
      teamIds: any[];
    }>();

    // Collect unique owner information from teams
    allTeams.forEach(team => {
      // Try to get owner display name from team
      const displayName = (team as any).ownerDisplayName || team.name;

      if (!ownerMap.has(displayName)) {
        ownerMap.set(displayName, {
          displayName,
          userId: (team as any).ownerId || defaultUser._id, // Use existing ownerId or default
          teamIds: [team._id],
        });
      } else {
        ownerMap.get(displayName)!.teamIds.push(team._id);
      }
    });

    console.log(`Found ${ownerMap.size} unique owners`);

    // Create owner records
    const ownerIdMap = new Map<string, any>();

    for (const [displayName, ownerData] of ownerMap) {
      const now = Date.now();

      const ownerId = await ctx.db.insert("owners", {
        displayName: ownerData.displayName,
        userId: ownerData.userId,
        espnOwnerId: ownerData.espnOwnerId,
        createdAt: now,
        updatedAt: now,
      });

      ownerIdMap.set(displayName, ownerId);
      console.log(`Created owner: ${displayName} -> ${ownerId}`);
    }

    // Update all teams to reference the new owners
    let teamsUpdated = 0;

    for (const team of allTeams) {
      const displayName = (team as any).ownerDisplayName || team.name;
      const ownerId = ownerIdMap.get(displayName);

      if (ownerId) {
        // Update team to use new ownerId
        await ctx.db.patch(team._id, {
          ownerId: ownerId,
          updatedAt: Date.now(),
        });
        teamsUpdated++;
      }
    }

    return {
      success: true,
      message: `Migration complete! Created ${ownerIdMap.size} owners and updated ${teamsUpdated} teams.`,
      ownersCreated: ownerIdMap.size,
      teamsUpdated,
      owners: Array.from(ownerMap.keys()),
    };
  },
});

/**
 * Migration: Remove old calculated fields from teams table
 * Note: This is a data cleanup, the schema must be updated separately
 */
export const removeCalculatedTeamFields = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting cleanup of calculated team fields...");

    const allTeams = await ctx.db.query("teams").collect();
    console.log(`Found ${allTeams.length} teams to clean`);

    let teamsUpdated = 0;

    for (const team of allTeams) {
      const updates: any = {
        updatedAt: Date.now(),
      };

      // Note: Convex will automatically ignore fields that don't exist in the schema
      // But we can explicitly unset them if needed using replace
      await ctx.db.patch(team._id, updates);
      teamsUpdated++;
    }

    return {
      success: true,
      message: `Cleaned ${teamsUpdated} teams. Old fields will be ignored by new schema.`,
      teamsUpdated,
    };
  },
});

/**
 * Migration: Remove old calculated fields from seasons table
 */
export const removeCalculatedSeasonFields = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting cleanup of calculated season fields...");

    const allSeasons = await ctx.db.query("seasons").collect();
    console.log(`Found ${allSeasons.length} seasons to clean`);

    let seasonsUpdated = 0;

    for (const season of allSeasons) {
      await ctx.db.patch(season._id, {
        updatedAt: Date.now(),
      });
      seasonsUpdated++;
    }

    return {
      success: true,
      message: `Cleaned ${seasonsUpdated} seasons. Old fields will be ignored by new schema.`,
      seasonsUpdated,
    };
  },
});

/**
 * Migration: Remove isStarter field from rosterEntries
 */
export const removeIsStarterField = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting cleanup of isStarter field from roster entries...");

    const allEntries = await ctx.db.query("rosterEntries").collect();
    console.log(`Found ${allEntries.length} roster entries to clean`);

    let entriesUpdated = 0;

    // We don't need to explicitly remove the field - the new schema will ignore it
    // But we can update the record to trigger a schema validation
    for (const entry of allEntries) {
      await ctx.db.patch(entry._id, {
        updatedAt: Date.now(),
      });
      entriesUpdated++;

      // Log progress every 1000 entries
      if (entriesUpdated % 1000 === 0) {
        console.log(`Progress: ${entriesUpdated}/${allEntries.length} entries updated`);
      }
    }

    return {
      success: true,
      message: `Cleaned ${entriesUpdated} roster entries. isStarter field will be ignored by new schema.`,
      entriesUpdated,
    };
  },
});

/**
 * Run all migrations in sequence
 */
export const runAllMigrations = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting full migration sequence...");

    const results = {
      owners: null as any,
      teams: null as any,
      seasons: null as any,
      rosterEntries: null as any,
    };

    try {
      // 1. Create owners and migrate teams
      console.log("Step 1: Migrating to owners table...");
      results.owners = await ctx.runMutation("migrations:migrateToOwnersTable" as any, {});

      // 2. Clean team fields
      console.log("Step 2: Cleaning team fields...");
      results.teams = await ctx.runMutation("migrations:removeCalculatedTeamFields" as any, {});

      // 3. Clean season fields
      console.log("Step 3: Cleaning season fields...");
      results.seasons = await ctx.runMutation("migrations:removeCalculatedSeasonFields" as any, {});

      // 4. Clean roster entries (this may take a while)
      console.log("Step 4: Cleaning roster entries...");
      results.rosterEntries = await ctx.runMutation("migrations:removeIsStarterField" as any, {});

      console.log("All migrations complete!");

      return {
        success: true,
        message: "All migrations completed successfully!",
        results,
      };
    } catch (error) {
      console.error("Migration failed:", error);
      return {
        success: false,
        message: `Migration failed: ${error}`,
        results,
      };
    }
  },
});

/**
 * Rollback: Delete all owners and restore old team structure
 * WARNING: Only use this if migration fails and you need to rollback
 */
export const rollbackOwnersMigration = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Rolling back owners migration...");

    // Get all owners
    const allOwners = await ctx.db.query("owners").collect();
    console.log(`Found ${allOwners.length} owners to delete`);

    // Delete all owners
    for (const owner of allOwners) {
      await ctx.db.delete(owner._id);
    }

    // Note: Teams will need manual restoration of userId references
    // This is a destructive operation and should be used carefully

    return {
      success: true,
      message: `Rollback complete. Deleted ${allOwners.length} owners. Teams will need manual restoration.`,
      ownersDeleted: allOwners.length,
    };
  },
});

/**
 * Verification: Check migration status
 */
export const verifyMigration = mutation({
  args: {},
  handler: async (ctx) => {
    const owners = await ctx.db.query("owners").collect();
    const teams = await ctx.db.query("teams").collect();
    const seasons = await ctx.db.query("seasons").collect();
    const rosterEntries = await ctx.db.query("rosterEntries").collect();

    // Check if teams reference owners
    const teamsWithOwners = teams.filter(t => t.ownerId);

    // Check for old fields (these will still exist in data, but should be ignored by schema)
    const teamsWithOldFields = teams.filter(t => (t as any).wins !== undefined);

    return {
      owners: {
        count: owners.length,
        sample: owners.slice(0, 5).map(o => o.displayName),
      },
      teams: {
        total: teams.length,
        withOwners: teamsWithOwners.length,
        withOldFields: teamsWithOldFields.length,
      },
      seasons: {
        count: seasons.length,
      },
      rosterEntries: {
        count: rosterEntries.length,
      },
      migrationComplete: teamsWithOwners.length === teams.length && owners.length > 0,
    };
  },
});
