from espn_api.football import League
import json

# Your ESPN credentials
ESPN_S2 = "AEBg7069VUyGhJpLv4wzFu6BQ3qsoufVknZiYk0zfsAeDz7OcrK56zNt5qJHCYofC0n%2BmhfrgN4qBvPfOBTtgsrj%2FAIiwGTo6098RqsXLr4Z8VgHgF7Z2NcXgmLbabh%2BBo3FvYeuML4lWpc09zQWTsvfTLEZf7OOgt3hf2ESKIwH9DWbf3kK0ggxLDLZtbRrJvOvn0WgXZ%2Fq%2BWYIwDpWUh23b8nxtNX5kIvTD2y1s4DDGcX9nSyqFvZjxqY8wDdzvEuizcCdRSOg73eJ%2B3INobR5EOsYTIgiKOHwa5NG8ZgHartgUHIY71oYO%2B%2FDiEWFAUJIInSNOzv1LPwVYj6n%2FPDN"
SWID = "{1BF22DC3-090B-47B9-A6B3-9A4C3699A3E7}"
LEAGUE_ID = 262148

# Years to fetch (ESPN deleted data before 2018)
YEARS = range(2018, 2026)

def fetch_league_year(year):
    """Fetch league data for a specific year"""
    try:
        print(f"Fetching {year}...", end=" ")
        league = League(
            league_id=LEAGUE_ID,
            year=year,
            espn_s2=ESPN_S2,
            swid=SWID
        )
        print("✓ Success!")
        return league
    except Exception as e:
        print(f"✗ Failed - {str(e)}")
        return None

def save_league_data(league, year):
    """Save league data to JSON"""
    if not league:
        return
    
    data = {
        'year': year,
        'league_name': league.settings.name,
        'teams': [],
        'matchups': [],
        'settings': {
            'reg_season_count': league.settings.reg_season_count,
            'playoff_team_count': league.settings.playoff_team_count,
            'team_count': league.settings.team_count,
        }
    }
    
    # Get team data
    for team in league.teams:
        team_data = {
            'team_id': team.team_id,
            'team_name': f"{team.team_name}",
            'owners': team.owners,
            'wins': team.wins,
            'losses': team.losses,
            'points_for': team.points_for,
            'points_against': team.points_against,
            'standing': team.standing,
            'final_standing': team.final_standing,
            'streak_length': team.streak_length,
            'streak_type': team.streak_type,
        }
        
        # Get roster if available
        try:
            roster_data = []
            for player in team.roster:
                roster_data.append({
                    'name': player.name,
                    'position': player.position,
                    'points': getattr(player, 'points', 0)
                })
            team_data['roster'] = roster_data
        except:
            pass
        
        data['teams'].append(team_data)
    
    # Get matchup data
    try:
        for week in range(1, league.settings.reg_season_count + 1):
            box_scores = league.box_scores(week)
            for matchup in box_scores:
                matchup_data = {
                    'week': week,
                    'home_team': matchup.home_team.team_name if matchup.home_team else "BYE",
                    'home_score': matchup.home_score,
                    'away_team': matchup.away_team.team_name if matchup.away_team else "BYE",
                    'away_score': matchup.away_score,
                }
                data['matchups'].append(matchup_data)
    except Exception as e:
        print(f"    Note: Could not fetch all matchups - {str(e)}")
    
    # Save to file
    filename = f"espn_league_{year}.json"
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"    Saved to {filename}")
    
    return data

def print_summary(league, year):
    """Print a summary of the league"""
    if not league:
        return
    
    print(f"\n{'='*60}")
    print(f"SEASON {year}: {league.settings.name}")
    print(f"{'='*60}")
    print(f"Teams: {len(league.teams)}")
    print(f"Regular Season Weeks: {league.settings.reg_season_count}")
    print(f"\nStandings:")
    
    # Sort teams by standing
    sorted_teams = sorted(league.teams, key=lambda x: x.standing)
    for team in sorted_teams:
        if team.owners:
            owner_names = ", ".join([str(o) for o in team.owners])
        else:
            owner_names = "Unknown"
        print(f"  {team.standing}. {team.team_name} ({owner_names}) - "
              f"{team.wins}-{team.losses} - {team.points_for:.1f} PF")

def main():
    print("ESPN Fantasy Football Data Fetcher")
    print("Using espn-api library")
    print(f"League ID: {LEAGUE_ID}")
    print(f"Years: {min(YEARS)} to {max(YEARS)}")
    print(f"{'-'*60}\n")
    
    all_data = {}
    successful_years = []
    
    for year in YEARS:
        league = fetch_league_year(year)
        
        if league:
            data = save_league_data(league, year)
            all_data[year] = data
            successful_years.append(year)
            print_summary(league, year)
        print()
    
    # Save combined data
    if all_data:
        combined_filename = "espn_league_all_years.json"
        with open(combined_filename, 'w') as f:
            json.dump(all_data, f, indent=2)
        print(f"\n{'='*60}")
        print(f"✓ Combined data saved to {combined_filename}")
        print(f"✓ Successfully fetched {len(successful_years)} seasons: {successful_years}")
        print(f"{'='*60}")
    else:
        print("\n⚠ No data was successfully fetched.")
        print("Try the following:")
        print("1. Make sure your league is NOT private")
        print("2. Get fresh cookies from an active browser session")
        print("3. Verify your LEAGUE_ID is correct")

if __name__ == "__main__":
    main()