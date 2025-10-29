#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { ConvexHttpClient } = require('convex/browser');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      process.env[key] = value;
    }
  });
}

const STATS_FILE = path.join(__dirname, 'player_season_stats.json');

async function importPlayerStats() {
  console.log('📊 Importing Player Season Stats to Convex\n');
  console.log('='.repeat(50));

  // Check if stats file exists
  if (!fs.existsSync(STATS_FILE)) {
    console.error(`\n❌ Error: ${STATS_FILE} not found!`);
    console.log('   Please run fetch_player_stats.py first\n');
    process.exit(1);
  }

  // Read stats file
  console.log(`\n📖 Reading ${STATS_FILE}...`);
  const playerStats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));

  const years = Object.keys(playerStats);
  console.log(`   Found data for ${years.length} seasons: ${years.join(', ')}\n`);

  // Get Convex URL
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
  if (!convexUrl) {
    console.error('❌ Error: CONVEX_URL not found in environment!');
    console.log('   Make sure your .env.local file is properly configured\n');
    process.exit(1);
  }

  console.log(`🔗 Connecting to Convex: ${convexUrl}\n`);
  const client = new ConvexHttpClient(convexUrl);

  // Import stats for each year
  let totalImported = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;

  for (const year of years) {
    const yearStats = playerStats[year];
    console.log(`📅 Importing ${year}...`);
    console.log(`   Players with stats: ${yearStats.length}`);

    try {
      const result = await client.mutation('importPlayerStats:importPlayerSeasonStats', {
        year: parseInt(year),
        playerStats: yearStats
      });

      console.log(`   ✅ Imported: ${result.importedCount}`);
      console.log(`   🔄 Updated: ${result.updatedCount}`);
      console.log(`   ⏭️  Skipped: ${result.skippedCount}\n`);

      totalImported += result.importedCount;
      totalUpdated += result.updatedCount;
      totalSkipped += result.skippedCount;

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
    }
  }

  console.log('='.repeat(50));
  console.log('✨ IMPORT COMPLETE!\n');
  console.log(`📊 Summary:`);
  console.log(`   Total imported: ${totalImported}`);
  console.log(`   Total updated: ${totalUpdated}`);
  console.log(`   Total skipped: ${totalSkipped}`);
  console.log('='.repeat(50));
  console.log('\n💡 Next step: Check your Draft page to see real values!\n');
}

importPlayerStats().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
