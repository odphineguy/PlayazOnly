// Script to import draft data to Convex
// Run with: node scripts/importDraftToConvex.js

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://content-buffalo-738.convex.cloud';

async function importDraftData() {
  console.log('Starting draft data import...');
  console.log('Convex URL:', CONVEX_URL);

  // Read draft JSON files
  const draftFiles = {
    '2018': 'EspnData/EspnDraft/espn_draft_2018.json',
    '2019': 'EspnData/EspnDraft/espn_draft_2019.json',
    '2020': 'EspnData/EspnDraft/espn_draft_2020.json',
    '2021': 'EspnData/EspnDraft/espn_draft_2021.json',
    '2022': 'EspnData/EspnDraft/espn_draft_2022.json',
    '2023': 'EspnData/EspnDraft/espn_draft_2023.json',
    '2024': 'EspnData/EspnDraft/espn_draft_2024.json',
    '2025': 'EspnData/EspnDraft/espn_draft_2025.json',
  };

  for (const [year, filePath] of Object.entries(draftFiles)) {
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${year} - file not found: ${filePath}`);
      continue;
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(`\nImporting ${year} draft data...`);
      
      // Call the importDraftData mutation
      const response = await axios.post(`${CONVEX_URL}/importDraftData`, {
        args: {
          year: parseInt(year),
          draftPicks: data.draft_picks || []
        }
      });

      console.log(`✅ ${year}: ${response.data.message}`);
      if (response.data.picksImported) {
        console.log(`   - Picks imported: ${response.data.picksImported}`);
      }
    } catch (error) {
      console.error(`❌ Error importing ${year}:`, error.message);
    }
  }

  console.log('\n✅ Draft data import completed!');
}

importDraftData().catch(console.error);

