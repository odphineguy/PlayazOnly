#!/usr/bin/env python3
"""
Fetch player season stats from ESPN Fantasy Football API
This script fetches individual player fantasy points for each season
"""

import json
import os
from espn_api.football import League
from typing import Dict, List
import time

# ESPN League Configuration
LEAGUE_ID = 262148  # Playaz Only league ID
ESPN_S2 = ""  # Your ESPN_S2 cookie (if private league)
SWID = ""  # Your SWID cookie (if private league)

# Years to fetch
YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]


def get_league(year: int) -> League:
    """Connect to ESPN Fantasy Football league for a specific year"""
    try:
        if ESPN_S2 and SWID:
            league = League(league_id=LEAGUE_ID, year=year, espn_s2=ESPN_S2, swid=SWID)
        else:
            # Public league
            league = League(league_id=LEAGUE_ID, year=year)
        return league
    except Exception as e:
        print(f"Error connecting to league for {year}: {e}")
        return None


def get_player_stats_from_box_scores(league: League, year: int) -> Dict[int, float]:
    """
    Get player season stats by aggregating box scores
    Returns: dict of player_id -> total_points
    """
    player_stats = {}

    print(f"  Fetching box scores for {year}...")

    # Get all matchups for all weeks
    for week in range(1, league.settings.reg_season_count + 1):
        try:
            box_scores = league.box_scores(week)

            for matchup in box_scores:
                # Process home team
                if matchup.home_team:
                    for player in matchup.home_lineup:
                        if player.playerId not in player_stats:
                            player_stats[player.playerId] = 0.0
                        player_stats[player.playerId] += player.points

                # Process away team
                if matchup.away_team:
                    for player in matchup.away_lineup:
                        if player.playerId not in player_stats:
                            player_stats[player.playerId] = 0.0
                        player_stats[player.playerId] += player.points

            print(f"    Week {week} complete")
            time.sleep(0.5)  # Be nice to ESPN's API

        except Exception as e:
            print(f"    Error fetching week {week}: {e}")
            continue

    return player_stats


def load_draft_data(year: int) -> List[Dict]:
    """Load draft data from JSON file"""
    draft_file = f"EspnDraft/espn_draft_{year}.json"

    if not os.path.exists(draft_file):
        print(f"  Warning: Draft file not found: {draft_file}")
        return []

    with open(draft_file, 'r') as f:
        data = json.load(f)
        return data.get('draft_picks', [])


def main():
    """Main function to fetch and save player stats"""

    print("ESPN Player Stats Fetcher")
    print("=" * 50)

    # Check if we need league credentials
    if not LEAGUE_ID:
        print("\n⚠️  Please set your LEAGUE_ID in the script!")
        print("You can find it in your ESPN league URL:")
        print("https://fantasy.espn.com/football/league?leagueId=YOUR_LEAGUE_ID")
        return

    print(f"\nLeague ID: {LEAGUE_ID}")
    print(f"Years to fetch: {', '.join(map(str, YEARS))}\n")

    all_player_stats = {}

    for year in YEARS:
        print(f"Processing {year}...")

        try:
            # Connect to league
            league = get_league(year)
            if not league:
                print(f"  Skipping {year} - could not connect to league\n")
                continue

            print(f"  Connected to: {league.settings.name}")

            # Get player stats from box scores
            player_stats = get_player_stats_from_box_scores(league, year)

            # Load draft data to know which players we care about
            draft_picks = load_draft_data(year)

            # Match draft picks with player stats
            year_data = []
            for pick in draft_picks:
                player_id = pick.get('player_id')
                player_name = pick.get('player_name')
                team_id = pick.get('team_id')
                team_name = pick.get('team_name')

                points = player_stats.get(player_id, 0.0)

                year_data.append({
                    'player_id': player_id,
                    'player_name': player_name,
                    'team_id': team_id,
                    'team_name': team_name,
                    'total_points': round(points, 2),
                    'year': year
                })

            all_player_stats[year] = year_data

            print(f"  ✓ Fetched stats for {len(year_data)} drafted players")
            print(f"  ✓ {sum(1 for p in year_data if p['total_points'] > 0)} players with points\n")

        except Exception as e:
            print(f"  Error processing {year}: {e}\n")
            continue

    # Save to file
    output_file = "player_season_stats.json"
    with open(output_file, 'w') as f:
        json.dump(all_player_stats, f, indent=2)

    print("=" * 50)
    print(f"✅ Player stats saved to: {output_file}")
    print("\nNext steps:")
    print("1. Review the generated JSON file")
    print("2. Import the data to Convex using the import mutation")
    print()


if __name__ == "__main__":
    main()
