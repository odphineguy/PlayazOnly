const fs = require('fs');
const path = require('path');

// Path to ESPN data directory
const espnDataDir = path.join(__dirname, '..', 'EspnData');

// Read all league JSON files
const leagueFiles = [
  'espn_league_2018.json',
  'espn_league_2019.json',
  'espn_league_2020.json',
  'espn_league_2021.json',
  'espn_league_2022.json',
  'espn_league_2023.json',
  'espn_league_2024.json',
  'espn_league_2025.json',
];

console.log('🔍 Extracting player positions from league files...\n');

// Map to store player positions (playerName -> position)
const playerPositions = new Map();

// Read each league file and extract positions
leagueFiles.forEach(fileName => {
  const filePath = path.join(espnDataDir, fileName);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${fileName}`);
    return;
  }

  console.log(`📄 Reading ${fileName}...`);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const leagueData = JSON.parse(fileContent);

  // Extract positions from team rosters
  if (leagueData.teams && Array.isArray(leagueData.teams)) {
    leagueData.teams.forEach(team => {
      if (team.roster && Array.isArray(team.roster)) {
        team.roster.forEach(player => {
          if (player.name && player.position) {
            // Store position (later files will overwrite if position changed)
            const normalizedName = player.name.toLowerCase().trim();
            playerPositions.set(normalizedName, {
              name: player.name,
              position: player.position
            });
          }
        });
      }
    });
  }
});

console.log(`\n✅ Extracted positions for ${playerPositions.size} unique players\n`);

// Create position mapping array for Convex
const positionMapping = Array.from(playerPositions.values()).map(({ name, position }) => ({
  playerName: name,
  position: position
}));

// Save to file that we'll use with Convex
const outputPath = path.join(__dirname, 'player-positions.json');
fs.writeFileSync(outputPath, JSON.stringify({ positionMapping }, null, 2));
console.log(`💾 Saved position mapping to ${outputPath}\n`);

// Show position breakdown
const positionCounts = {};
positionMapping.forEach(({ position }) => {
  positionCounts[position] = (positionCounts[position] || 0) + 1;
});

console.log('📊 Position breakdown:');
Object.entries(positionCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([position, count]) => {
    console.log(`   ${position}: ${count} players`);
  });

console.log('\n' + '='.repeat(60));
console.log('✅ Position data prepared successfully!');
console.log('='.repeat(60));
console.log('\n📋 Next step: Run the following command to update the database:\n');
console.log(`   node ${path.join(__dirname, 'runPositionUpdate.js')}`);
console.log('\n');
