# Fetching Player Season Stats from ESPN

This guide will help you populate the `rosterEntries` table with real fantasy points so your Draft page shows accurate values.

## Prerequisites

1. **ESPN League ID**: You need your ESPN Fantasy Football league ID
2. **Python 3**: Required to run the fetch script
3. **ESPN API Package**: `pip install espn-api`

---

## Step 1: Find Your ESPN League ID

Your ESPN League ID is in your league's URL:

```
https://fantasy.espn.com/football/league?leagueId=YOUR_LEAGUE_ID_HERE
```

Example: If your URL is `https://fantasy.espn.com/football/league?leagueId=123456`, your League ID is **123456**

---

## Step 2: Configure the Script

Edit `fetch_player_stats.py` and update these values:

```python
LEAGUE_ID = 123456  # Replace with your ESPN league ID
```

### For Private Leagues Only:

If your league is private, you'll need to provide cookies:

1. Log into ESPN Fantasy Football in your browser
2. Open Developer Tools (F12)
3. Go to Application → Cookies → espn.com
4. Find `espn_s2` and `SWID` cookies
5. Add them to the script:

```python
ESPN_S2 = "your_espn_s2_cookie_value_here"
SWID = "your_swid_cookie_value_here"
```

---

## Step 3: Install Dependencies

```bash
cd EspnData
pip install espn-api
```

or

```bash
pip3 install espn-api
```

---

## Step 4: Run the Fetch Script

```bash
python3 fetch_player_stats.py
```

This will:
- Connect to your ESPN league for each season (2018-2025)
- Fetch box scores for all weeks
- Aggregate player fantasy points
- Save results to `player_season_stats.json`

**Note**: This may take 5-10 minutes as it fetches data for 8 seasons.

---

## Step 5: Import to Convex

Once the JSON file is generated, import it to Convex:

```bash
node import_player_stats_to_convex.js
```

This will:
- Read the `player_season_stats.json` file
- Import stats to your Convex database
- Populate the `rosterEntries` table

---

## Step 6: Verify

1. Check your Convex dashboard - the `rosterEntries` table should have data
2. Visit your Draft page at `/dashboard/draft`
3. You should now see real draft values based on actual performance!

---

## Troubleshooting

### "Could not connect to league"
- Double-check your `LEAGUE_ID`
- If private league, ensure cookies are correct and not expired

### "Season not found"
- Make sure you've imported league data first
- Run the league import before importing player stats

### "Player not found"
- Some players may not be in your database
- This is normal for players who were dropped early

### Rate Limiting
- The script includes delays to be nice to ESPN's API
- If you hit rate limits, wait a few minutes and try again

---

## What Gets Imported

For each drafted player in each season:
- Player ESPN ID
- Player name
- Team
- Total season fantasy points
- Year

This data populates the `rosterEntries` table so draft values can be calculated as:
```
pickValue = actualFantasyPoints - expectedValue(draftPosition)
```

---

## Questions?

If you run into issues, check:
1. Your league is accessible with the provided credentials
2. The years in the script match your available data
3. Your Convex deployment is running (`npx convex dev`)

