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

// Read position mapping
const positionDataPath = path.join(__dirname, 'player-positions.json');

if (!fs.existsSync(positionDataPath)) {
  console.error('❌ Error: player-positions.json not found!');
  console.log('   Please run: node scripts/fixPlayerPositions.js first\n');
  process.exit(1);
}

console.log('📖 Reading position data...\n');
const positionData = JSON.parse(fs.readFileSync(positionDataPath, 'utf8'));

console.log(`📦 Preparing to update ${positionData.positionMapping.length} players...\n`);

// Get Convex deployment URL from environment
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;

if (!convexUrl) {
  console.error('❌ Error: CONVEX_URL not found in environment!');
  console.log('   Make sure your .env.local file is properly configured\n');
  process.exit(1);
}

console.log(`🔗 Connecting to Convex: ${convexUrl}\n`);

async function updatePositions() {
  const client = new ConvexHttpClient(convexUrl);

  try {
    console.log('🚀 Calling updatePlayerPositions mutation...\n');

    const result = await client.mutation('draftData:updatePlayerPositions', positionData);

    console.log('\n' + '='.repeat(60));
    console.log('✨ POSITION UPDATE COMPLETE!');
    console.log('='.repeat(60));
    console.log(`\n✅ Updated: ${result.updatedCount} players`);
    console.log(`⏭️  Skipped (already correct): ${result.totalPlayers - result.updatedCount - result.notFoundCount} players`);
    console.log(`⚠️  Not found in database: ${result.notFoundCount} players\n`);

    if (result.notFoundPlayers && result.notFoundPlayers.length > 0) {
      console.log('Players not found (first 20):');
      result.notFoundPlayers.forEach(name => {
        console.log(`   - ${name}`);
      });
      console.log('');
    }

    console.log('💡 Next steps:');
    console.log('   1. Check the draft page to verify positions are correct');
    console.log('   2. Delete the scripts folder if everything looks good\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error updating positions:', error.message);
    console.error(error);
    process.exit(1);
  }
}

updatePositions();
