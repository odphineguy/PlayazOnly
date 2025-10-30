"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trophy } from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function HistoryPage() {
  const [allTimeSortBy, setAllTimeSortBy] = useState("league-rating");
  const [playoffSortBy, setPlayoffSortBy] = useState("medal-score");
  const [advancedSortBy, setAdvancedSortBy] = useState("avg-season-score");
  const [activeTab, setActiveTab] = useState("all-time");
  const [seasonTab, setSeasonTab] = useState("champions");
  const [leagueRatingTab, setLeagueRatingTab] = useState("league-rating");
  const [selectedTeams, setSelectedTeams] = useState<Record<string, boolean>>({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Fetch data from Convex queries
  const allTeamsRaw = useQuery(api.fantasyFootball.getAllTeams);
  const allSeasonsRaw = useQuery(api.fantasyFootball.getAllSeasons);
  const allMatchupsRaw = useQuery(api.fantasyFootball.getAllMatchups);

  // Deduplicate seasons by year (keep most recent)
  const allSeasons = (() => {
    if (!allSeasonsRaw) return null;

    const seasonsByYear = new Map();
    allSeasonsRaw.forEach(season => {
      const existing = seasonsByYear.get(season.year);
      if (!existing || season.createdAt > existing.createdAt) {
        seasonsByYear.set(season.year, season);
      }
    });

    return Array.from(seasonsByYear.values()).sort((a, b) => a.year - b.year);
  })();

  // Deduplicate teams by seasonId + name (keep most recent)
  const allTeams = (() => {
    if (!allTeamsRaw) return null;

    const teamsBySeasonAndName = new Map();
    allTeamsRaw.forEach(team => {
      const key = `${team.seasonId}-${team.name}`;
      const existing = teamsBySeasonAndName.get(key);
      if (!existing || team.createdAt > existing.createdAt) {
        teamsBySeasonAndName.set(key, team);
      }
    });

    return Array.from(teamsBySeasonAndName.values());
  })();

  // Import ESPN data if no teams exist
  const importEspnData = useMutation(api.importAllEspnData.importAllEspnData);
  const hasData = allTeams && allTeams.length > 0;

  // Auto-import data if database has insufficient data or missing matchups
  useEffect(() => {
    const needsImport =
      (!allTeams || allTeams.length < 50) || // Less than 50 teams
      (!allMatchupsRaw || allMatchupsRaw.length < 100) || // Less than 100 matchups
      (allTeams && allTeams.length > 0 && !allTeams[0].ownerDisplayName); // Missing owner data

    if (needsImport && !isDataLoaded) {
      console.log('Incomplete data detected, importing ESPN data...', {
        teamsCount: allTeams?.length,
        matchupsCount: allMatchupsRaw?.length,
        hasOwnerData: allTeams?.[0]?.ownerDisplayName
      });
      setIsDataLoaded(true);
      importEspnData().catch((error) => {
        console.error('Auto-import failed:', error);
        setIsDataLoaded(false);
      });
    }
  }, [allTeams, allSeasons, allMatchupsRaw, importEspnData, isDataLoaded]);

  // Calculate all-play records from matchup data
  const allPlayRecords = allTeams && allMatchupsRaw ? (() => {
    const teamAllPlayStats = new Map();

    // Group matchups by season and week
    const matchupsBySeasonWeek = new Map<string, typeof allMatchupsRaw>();
    allMatchupsRaw.forEach((matchup: any) => {
      const key = `${matchup.seasonId}-${matchup.week}`;
      if (!matchupsBySeasonWeek.has(key)) {
        matchupsBySeasonWeek.set(key, []);
      }
      matchupsBySeasonWeek.get(key)!.push(matchup);
    });

    // For each week, calculate all-play wins/losses
    matchupsBySeasonWeek.forEach((weekMatchups: any, key: string) => {
      // Get all scores for this week
      const teamScores = new Map<string, number>();
      weekMatchups.forEach((matchup: any) => {
        teamScores.set(matchup.homeTeamId, matchup.homeScore);
        teamScores.set(matchup.awayTeamId, matchup.awayScore);
      });

      // For each team, count how many teams they beat
      teamScores.forEach((score: number, teamId: string) => {
        if (!teamAllPlayStats.has(teamId)) {
          teamAllPlayStats.set(teamId, { wins: 0, losses: 0 });
        }
        const stats = teamAllPlayStats.get(teamId)!;

        // Compare against all other teams this week
        teamScores.forEach((otherScore: number, otherTeamId: string) => {
          if (teamId !== otherTeamId) {
            if (score > otherScore) {
              stats.wins += 1;
            } else if (score < otherScore) {
              stats.losses += 1;
            }
          }
        });
      });
    });

    return teamAllPlayStats;
  })() : new Map();

  // Process all-time standings from real data
  const allTimeStandings = allTeams && allSeasons ? (() => {
    const seasonMap = new Map(allSeasons.map(s => [s._id, s]));
    const ownerStats = new Map();

    allTeams.forEach(team => {
      const season = seasonMap.get(team.seasonId);
      if (!season) return;

      // Use ownerDisplayName as key to aggregate across all seasons for each owner
      const ownerKey = team.ownerDisplayName || team.name;

      if (!ownerStats.has(ownerKey)) {
        ownerStats.set(ownerKey, {
          teamName: ownerKey,
          totalWins: 0,
          totalLosses: 0,
          totalPointsFor: 0,
          totalPointsAgainst: 0,
          seasons: 0,
          championships: 0,
          secondPlace: 0,
          thirdPlace: 0,
          allPlayWins: 0,
          allPlayLosses: 0
        });
      }

      const stats = ownerStats.get(ownerKey);
      stats.totalWins += team.wins;
      stats.totalLosses += team.losses;
      stats.totalPointsFor += team.pointsFor;
      stats.totalPointsAgainst += team.pointsAgainst;
      stats.seasons += 1;

      // Add all-play stats for this team
      const allPlayStats = allPlayRecords.get(team._id);
      if (allPlayStats) {
        stats.allPlayWins += allPlayStats.wins;
        stats.allPlayLosses += allPlayStats.losses;
      }

      if (team.finalStanding === 1) stats.championships += 1;
      if (team.finalStanding === 2) stats.secondPlace += 1;
      if (team.finalStanding === 3) stats.thirdPlace += 1;
    });

    return Array.from(ownerStats.values()).sort((a, b) => {
      const aWinPct = a.totalWins / (a.totalWins + a.totalLosses);
      const bWinPct = b.totalWins / (b.totalWins + b.totalLosses);
      return bWinPct - aWinPct;
    });
  })() : [];

  // Process teams with seasons data
  const allTeamsWithSeasons = allTeams && allSeasons ? allTeams.map(team => {
    const season = allSeasons.find(s => s._id === team.seasonId);
    return {
      ...team,
      season
    };
  }) : [];

  // Initialize selected teams when data loads
  useEffect(() => {
    if (allTimeStandings && allTimeStandings.length > 0 && Object.keys(selectedTeams).length === 0) {
      const initialSelection: Record<string, boolean> = {};
      allTimeStandings.forEach(team => {
        initialSelection[team.teamName] = true;
      });
      setSelectedTeams(initialSelection);
    }
  }, [allTimeStandings, selectedTeams]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Process real data for display
  const allTimeStandingsData = allTimeStandings ? allTimeStandings.map((team, index) => {
    const allPlayTotal = team.allPlayWins + team.allPlayLosses;
    const allPlayWinPct = allPlayTotal > 0 ? team.allPlayWins / allPlayTotal : 0;

    return {
      team: team.teamName,
      avatar: "🟢", // Default avatar, could be customized per team
      seasons: `${team.seasons} seasons`,
      record: `${team.totalWins}-${team.totalLosses}`,
      winPct: (team.totalWins / (team.totalWins + team.totalLosses)).toFixed(3),
      winPctNum: team.totalWins / (team.totalWins + team.totalLosses),
      allPlayRecord: allPlayTotal > 0 ? `${team.allPlayWins}-${team.allPlayLosses}` : "N/A",
      allPlayWinPct: allPlayTotal > 0 ? allPlayWinPct.toFixed(3) : "N/A",
      allPlayWinPctNum: allPlayWinPct,
      leagueRating: Math.floor(1500 + (team.totalWins - team.totalLosses) * 10), // Simple calculation
      trophies: `${team.championships > 0 ? '🏆x' + team.championships : ''} ${team.secondPlace > 0 ? '🏅x' + team.secondPlace : ''} ${team.thirdPlace > 0 ? '🥉x' + team.thirdPlace : ''}`.trim() || "---",
      isCurrentUser: team.teamName === "odphineguy" // Assuming current user is odphineguy
    };
  }) : [];

  // Generate season champions data from real data
  const seasonChampionsData = allSeasons ? allSeasons
    .filter(season => season.year >= 2018 && season.year <= 2024)
    .sort((a, b) => a.year - b.year)
    .map(season => {
      const seasonTeams = allTeamsWithSeasons.filter(team => team.seasonId === season._id);
      const sortedTeams = seasonTeams.sort((a, b) => (a.finalStanding || 0) - (b.finalStanding || 0));

      // Find all-play champion (team with best all-play record for this season)
      const teamsWithAllPlay = seasonTeams.map(team => {
        const allPlayStats = allPlayRecords.get(team._id);
        return {
          team,
          allPlayWins: allPlayStats?.wins || 0,
          allPlayLosses: allPlayStats?.losses || 0,
          allPlayWinPct: allPlayStats
            ? allPlayStats.wins / (allPlayStats.wins + allPlayStats.losses)
            : 0
        };
      });

      const allPlayChampion = teamsWithAllPlay.sort((a, b) => b.allPlayWinPct - a.allPlayWinPct)[0];

      return {
        id: season._id, // Add unique ID for React key
        season: season.year,
        champion: sortedTeams[0]?.name || "TBD",
        secondPlace: sortedTeams[1]?.name || "TBD",
        thirdPlace: sortedTeams[2]?.name || "TBD",
        inSeasonChamp: sortedTeams[0]?.name || "TBD",
        pointsChamp: sortedTeams.sort((a, b) => b.pointsFor - a.pointsFor)[0]?.name || "TBD",
        allPlayChamp: allPlayChampion?.team.name || "TBD",
        isCurrentUser: sortedTeams[0]?.name === "Mad Men"
      };
    }) : [];

  // Season chumpions data (worst performers)
  const seasonChumpionsData = allSeasons ? allSeasons
    .filter(season => season.year >= 2018 && season.year <= 2024)
    .sort((a, b) => a.year - b.year)
    .map(season => {
      const seasonTeams = allTeamsWithSeasons.filter(team => team.seasonId === season._id);
      const sortedByStanding = seasonTeams.sort((a, b) => (b.finalStanding || 0) - (a.finalStanding || 0));
      const sortedByPoints = seasonTeams.sort((a, b) => a.pointsFor - b.pointsFor);

      return {
        id: season._id,
        season: season.year,
        lastPlace: sortedByStanding[0]?.name || "TBD",
        inSeasonLastPlace: sortedByStanding[0]?.name || "TBD",
        lowestScorer: sortedByPoints[0]?.name || "TBD",
        worstAllAround: sortedByStanding[0]?.name || "TBD",
        isCurrentUser: sortedByStanding[0]?.ownerDisplayName === "odphineguy"
      };
    }) : [];

  // Season top ranks data (best performers)
  const seasonTopRanksData = allSeasons ? allSeasons
    .filter(season => season.year >= 2018 && season.year <= 2024)
    .sort((a, b) => a.year - b.year)
    .map(season => {
      const seasonTeams = allTeamsWithSeasons.filter(team => team.seasonId === season._id);

      // Best by points for (proxy for best drafter/manager)
      const sortedByPoints = seasonTeams.sort((a, b) => b.pointsFor - a.pointsFor);

      // Best win percentage (proxy for best coach)
      const sortedByWinPct = seasonTeams.sort((a, b) => {
        const aWinPct = a.wins / (a.wins + a.losses);
        const bWinPct = b.wins / (b.wins + b.losses);
        return bWinPct - aWinPct;
      });

      // Calculate average opponent points (proxy for strength of schedule)
      const teamWithHardestSchedule = seasonTeams.reduce((hardest, team) => {
        const avgOppPoints = team.pointsAgainst / (team.wins + team.losses);
        const hardestAvgOppPoints = hardest.pointsAgainst / (hardest.wins + hardest.losses);
        return avgOppPoints > hardestAvgOppPoints ? team : hardest;
      }, seasonTeams[0]);

      return {
        id: season._id,
        season: season.year,
        bestDrafter: sortedByPoints[0]?.name || "TBD",
        bestManager: sortedByPoints[0]?.name || "TBD",
        bestCoach: sortedByWinPct[0]?.name || "TBD",
        hardestSchedule: teamWithHardestSchedule?.name || "TBD",
        luckiest: sortedByWinPct[0]?.name || "TBD", // Team with best record relative to points
        isCurrentUser: sortedByPoints[0]?.ownerDisplayName === "odphineguy"
      };
    }) : [];

  // Season worst ranks data (worst performers)
  const seasonWorstRanksData = allSeasons ? allSeasons
    .filter(season => season.year >= 2018 && season.year <= 2024)
    .sort((a, b) => a.year - b.year)
    .map(season => {
      const seasonTeams = allTeamsWithSeasons.filter(team => team.seasonId === season._id);

      // Worst by points for
      const sortedByPoints = seasonTeams.sort((a, b) => a.pointsFor - b.pointsFor);

      // Worst win percentage
      const sortedByWinPct = seasonTeams.sort((a, b) => {
        const aWinPct = a.wins / (a.wins + a.losses);
        const bWinPct = b.wins / (b.wins + b.losses);
        return aWinPct - bWinPct;
      });

      // Calculate average opponent points (proxy for easiest schedule)
      const teamWithEasiestSchedule = seasonTeams.reduce((easiest, team) => {
        const avgOppPoints = team.pointsAgainst / (team.wins + team.losses);
        const easiestAvgOppPoints = easiest.pointsAgainst / (easiest.wins + easiest.losses);
        return avgOppPoints < easiestAvgOppPoints ? team : easiest;
      }, seasonTeams[0]);

      return {
        id: season._id,
        season: season.year,
        worstDrafter: sortedByPoints[0]?.name || "TBD",
        worstManager: sortedByPoints[0]?.name || "TBD",
        worstCoach: sortedByWinPct[0]?.name || "TBD",
        easiestSchedule: teamWithEasiestSchedule?.name || "TBD",
        unluckiest: sortedByWinPct[0]?.name || "TBD",
        isCurrentUser: sortedByPoints[0]?.ownerDisplayName === "odphineguy"
      };
    }) : [];

  // Team colors for chart lines
  const teamColors: Record<string, string> = {
    "azknighted": "#14b8a6", // teal
    "CeeLos1987": "#8b5cf6", // purple
    "crdns31mchl": "#ec4899", // pink
    "DeezzNutzz3": "#f97316", // orange
    "Fly in ointment": "#e11d48", // hot pink
    "Izreal 187": "#6b7280", // grey
    "jdramos88": "#06b6d4", // light blue
    "Lenz31": "#8b5cf6", // purple
    "oasoto": "#dc2626", // red
    "odphineguy": "#2563eb", // blue
    "ODPhrank23": "#eab308", // yellow
    "samakers15425": "#22c55e" // green
  };

  // Handle team selection toggle
  const toggleTeam = (teamName: string) => {
    setSelectedTeams(prev => ({
      ...prev,
      [teamName]: !prev[teamName]
    }));
  };

  // Get chart data based on active tab
  const getChartData = () => {
    if (!allTeams || !allSeasons) return [];

    // Group teams by year and owner
    const dataByYear = new Map();

    allTeams.forEach(team => {
      const season = allSeasons.find(s => s._id === team.seasonId);
      if (!season) return;

      const year = season.year;
      const owner = team.ownerDisplayName || team.name;

      if (!dataByYear.has(year)) {
        dataByYear.set(year, { year: year.toString() });
      }

      const yearData = dataByYear.get(year);

      // Calculate metrics based on active tab
      switch (leagueRatingTab) {
        case "league-rating":
          // Simple ELO-style rating based on wins/losses
          const rating = 1500 + (team.wins - team.losses) * 10;
          yearData[owner] = rating;
          break;

        case "season-score":
          // Total points for the season
          yearData[owner] = parseFloat(team.pointsFor.toFixed(2));
          break;

        case "points-share":
          // Calculate as percentage of total league points
          const allPointsForYear = allTeams
            .filter(t => {
              const s = allSeasons.find(season => season._id === t.seasonId);
              return s?.year === year;
            })
            .reduce((sum, t) => sum + t.pointsFor, 0);
          const share = allPointsForYear > 0 ? (team.pointsFor / allPointsForYear) * 100 : 0;
          yearData[owner] = parseFloat(share.toFixed(2));
          break;

        case "final-ranks":
          // Final standing (lower is better, so invert for chart)
          yearData[owner] = team.finalStanding || team.standing || 12;
          break;

        case "draft-rank":
        case "manager-rank":
        case "coach-rank":
        case "strength-schedule":
        case "luck":
          // These would need additional data - placeholder for now
          yearData[owner] = Math.floor(Math.random() * 12) + 1;
          break;

        default:
          yearData[owner] = 0;
      }
    });

    // Convert to array and sort by year
    return Array.from(dataByYear.values()).sort((a, b) => parseInt(a.year) - parseInt(b.year));
  };

  // Get chart title and description based on active tab
  const getChartInfo = () => {
    switch (leagueRatingTab) {
      case "league-rating":
        return {
          title: "LEAGUE RATINGS",
          description: "Track how league member ratings have changed over the seasons."
        };
      case "season-score":
        return {
          title: "SEASON SCORES",
          description: "Compare how season scores have trended for each manager over time."
        };
      case "points-share":
        return {
          title: "POINTS SHARE",
          description: "View each team's share of total league points over time."
        };
      case "final-ranks":
        return {
          title: "FINAL RANKS",
          description: "Track final season rankings for each team over time."
        };
      case "draft-rank":
        return {
          title: "DRAFT RANK",
          description: "Compare draft performance rankings across seasons."
        };
      case "manager-rank":
        return {
          title: "MANAGER RANK",
          description: "Track managerial performance rankings over time."
        };
      case "coach-rank":
        return {
          title: "COACH RANK",
          description: "Compare coaching performance rankings across seasons."
        };
      case "strength-schedule":
        return {
          title: "STRENGTH OF SCHEDULE",
          description: "View how difficult each team's schedule was over time."
        };
      case "luck":
        return {
          title: "LUCK",
          description: "Track luck factors for each team across seasons."
        };
      default:
        return {
          title: "LEAGUE RATINGS",
          description: "Track how league member ratings have changed over the seasons."
        };
    }
  };

  // Advanced standings data - calculated from real data
  const advancedStandingsData = allTimeStandings && allTeams && allSeasons && allMatchupsRaw ? allTimeStandings.map(team => {
    const avgSeasonScore = team.seasons > 0 ? team.totalPointsFor / team.seasons : 0;
    const records = team.championships + team.secondPlace + team.thirdPlace;

    // Calculate actual win percentage
    const winPct = team.totalWins / (team.totalWins + team.totalLosses);

    // Calculate expected wins based on points (simple luck metric)
    const avgPointsFor = team.totalPointsFor / team.seasons;
    const avgPointsAgainst = team.totalPointsAgainst / team.seasons;

    // Estimate strength of schedule (higher points against = harder schedule)
    const strengthOfSchedule = avgPointsAgainst.toFixed(1);

    // Luck calculation: actual wins vs expected wins based on points
    // Simple formula: if you score more than average but have fewer wins, you're unlucky
    const expectedWinPct = 0.5 + ((avgPointsFor - avgPointsAgainst) / avgPointsFor) * 0.3;
    const luckIndex = ((winPct - expectedWinPct) * 100).toFixed(1);

    // Get owner's teams to calculate draft/manager/coach rankings
    const ownerTeams = allTeams.filter(t => (t.ownerDisplayName || t.name) === team.teamName);

    // Draft rank: Average final standing (lower is better)
    const avgFinalStanding = ownerTeams.length > 0
      ? ownerTeams.reduce((sum, t) => sum + (t.finalStanding || 12), 0) / ownerTeams.length
      : 12;

    // Manager rank: Based on average points scored
    const managerRank = avgSeasonScore.toFixed(0);

    // Coach rank: Based on win percentage
    const coachRank = (winPct * 100).toFixed(1);

    // Calculate top score percentage: How often they had the highest score in a week
    let topScoreCount = 0;
    let totalWeeks = 0;

    // Group matchups by season and week
    const matchupsByWeek = new Map<string, typeof allMatchupsRaw>();
    allMatchupsRaw.forEach((matchup: any) => {
      const key = `${matchup.seasonId}-${matchup.week}`;
      if (!matchupsByWeek.has(key)) {
        matchupsByWeek.set(key, []);
      }
      matchupsByWeek.get(key)!.push(matchup);
    });

    // For each week, check if any of this owner's teams had the top score
    matchupsByWeek.forEach((weekMatchups: any) => {
      const ownerTeamIds = new Set(ownerTeams.map((t: any) => t._id));

      // Get all scores for this week
      const weekScores = weekMatchups.flatMap((m: any) => [
        { teamId: m.homeTeamId, score: m.homeScore },
        { teamId: m.awayTeamId, score: m.awayScore }
      ]);

      // Find the highest score
      const maxScore = Math.max(...weekScores.map((s: any) => s.score));

      // Check if this owner had the highest score
      const ownerHadTopScore = weekScores.some((s: any) =>
        ownerTeamIds.has(s.teamId) && s.score === maxScore
      );

      if (ownerHadTopScore) {
        topScoreCount++;
      }
      totalWeeks++;
    });

    const topScorePct = totalWeeks > 0 ? ((topScoreCount / totalWeeks) * 100).toFixed(1) + "%" : "0.0%";

    return {
      team: team.teamName,
      avatar: "🟢",
      draft: avgFinalStanding.toFixed(1),
      manager: managerRank,
      coach: coachRank + "%",
      sos: strengthOfSchedule,
      luck: luckIndex,
      topScorePct: topScorePct,
      records: records,
      achievements: records,
      pointsShareAvg: team.seasons > 0 ? ((avgSeasonScore / 1500) * 100).toFixed(2) + "%" : "0.00%",
      avgSeasonScore: avgSeasonScore.toFixed(2),
      isCurrentUser: team.teamName === "odphineguy"
    };
  }) : [];

  // Playoff standings data - calculated from playoff performance
  const playoffStandingsData = allTimeStandings ? allTimeStandings.map(team => {
    // Count playoff appearances (teams with 1st, 2nd, or 3rd place finishes participated in playoffs)
    const playoffAppearances = team.seasons; // Assuming all seasons had playoffs
    const totalMedals = team.championships + team.secondPlace + team.thirdPlace;

    // Medal score: Gold=3pts, Silver=2pts, Bronze=1pt
    const medalScore = (team.championships * 3) + (team.secondPlace * 2) + (team.thirdPlace * 1);

    // Calculate playoff win percentage (estimate based on finishes)
    // 1st place: ~3 wins, 2nd place: ~2 wins, 3rd: ~1 win
    const estimatedPlayoffWins = (team.championships * 3) + (team.secondPlace * 2) + (team.thirdPlace * 1);
    const estimatedPlayoffGames = playoffAppearances * 3; // Assuming 3 playoff games per season
    const playoffWinPct = estimatedPlayoffGames > 0 ? estimatedPlayoffWins / estimatedPlayoffGames : 0;

    // Build trophies string
    const trophies = `${team.championships > 0 ? '🏆x' + team.championships : ''} ${team.secondPlace > 0 ? '🏅x' + team.secondPlace : ''} ${team.thirdPlace > 0 ? '🥉x' + team.thirdPlace : ''}`.trim() || "---";

    return {
      team: team.teamName,
      avatar: "🟢",
      playoffAppearances: `${playoffAppearances}`,
      playoffAppearancesNum: playoffAppearances,
      record: `${estimatedPlayoffWins}-${estimatedPlayoffGames - estimatedPlayoffWins}`,
      totalWins: estimatedPlayoffWins,
      winPct: playoffWinPct.toFixed(3),
      winPctNum: playoffWinPct,
      medals: totalMedals,
      championships: team.championships,
      runnerUps: team.secondPlace,
      thirdPlace: team.thirdPlace,
      medalScore: medalScore,
      trophies: trophies,
      isCurrentUser: team.teamName === "odphineguy"
    };
  }) : [];

  // Sort the standings based on selected criteria for each tab
  const sortedStandings = [...allTimeStandingsData].sort((a, b) => {
    switch (allTimeSortBy) {
      case "league-rating":
        return b.leagueRating - a.leagueRating;
      case "win-pct":
        return b.winPctNum - a.winPctNum;
      case "record":
        // Parse wins from record (e.g., "26-12-1" -> 26)
        const aWins = parseInt(a.record.split('-')[0]);
        const bWins = parseInt(b.record.split('-')[0]);
        return bWins - aWins;
      case "all-play-win-pct":
        return b.allPlayWinPctNum - a.allPlayWinPctNum;
      default:
        return b.leagueRating - a.leagueRating;
    }
  });

  // Sort playoff standings based on selected criteria
  const sortedPlayoffStandings = [...playoffStandingsData].sort((a, b) => {
    switch (playoffSortBy) {
      case "medal-score":
        return (b.medalScore || 0) - (a.medalScore || 0);
      case "win-pct":
        return (b.winPctNum || 0) - (a.winPctNum || 0);
      case "record":
        return (b.totalWins || 0) - (a.totalWins || 0);
      case "playoff-appearances":
        return (b.playoffAppearancesNum || 0) - (a.playoffAppearancesNum || 0);
      case "medals":
        return (b.medals || 0) - (a.medals || 0);
      default:
        return (b.medalScore || 0) - (a.medalScore || 0);
    }
  });

  // Sort advanced standings based on selected criteria
  const sortedAdvancedStandings = [...advancedStandingsData].sort((a, b) => {
    switch (advancedSortBy) {
      case "avg-season-score":
        return parseFloat(b.avgSeasonScore) - parseFloat(a.avgSeasonScore);
      case "records":
        return b.records - a.records;
      case "achievements":
        return b.achievements - a.achievements;
      case "top-score-pct":
        return 0; // TODO: implement when data is available
      case "points-share-avg":
        return parseFloat(b.pointsShareAvg) - parseFloat(a.pointsShareAvg);
      default:
        return parseFloat(b.avgSeasonScore) - parseFloat(a.avgSeasonScore);
    }
  });


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">League History</h1>
        </div>
      </div>

      {/* 3-Tab Chart Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {activeTab === "all-time" && "ALL-TIME STANDINGS"}
                {activeTab === "playoff" && "PLAYOFF STANDINGS"}
                {activeTab === "advanced" && "ADVANCED STANDINGS"}
              </CardTitle>
              <CardDescription>
                {activeTab === "all-time" && "League members all-time standings and rankings."}
                {activeTab === "playoff" && "League member performance in postseason matchups."}
                {activeTab === "advanced" && "Advanced league statistics and analytics."}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">SORT</span>
              <Select 
                value={activeTab === "playoff" ? playoffSortBy : activeTab === "advanced" ? advancedSortBy : allTimeSortBy} 
                onValueChange={activeTab === "playoff" ? setPlayoffSortBy : activeTab === "advanced" ? setAdvancedSortBy : setAllTimeSortBy}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {activeTab === "playoff" ? (
                    <>
                      <SelectItem value="win-pct">Win %</SelectItem>
                      <SelectItem value="record">Total Wins</SelectItem>
                      <SelectItem value="playoff-appearances"># of Playoff Appearances</SelectItem>
                      <SelectItem value="medals"># of Medals</SelectItem>
                      <SelectItem value="medal-score">Medal Score</SelectItem>
                    </>
                  ) : activeTab === "advanced" ? (
                    <>
                      <SelectItem value="avg-season-score">Avg Season Score</SelectItem>
                      <SelectItem value="records">Records</SelectItem>
                      <SelectItem value="achievements">Achievements</SelectItem>
                      <SelectItem value="top-score-pct">Top Score %</SelectItem>
                      <SelectItem value="points-share-avg">Points Share Avg</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="league-rating">League Rating</SelectItem>
                      <SelectItem value="win-pct">Win %</SelectItem>
                      <SelectItem value="record">Record</SelectItem>
                      <SelectItem value="all-play-win-pct">All-Play Win %</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all-time">ALL-TIME STANDINGS</TabsTrigger>
              <TabsTrigger value="playoff">PLAYOFF STANDINGS</TabsTrigger>
              <TabsTrigger value="advanced">ADVANCED STANDINGS</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all-time" className="mt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">TEAM</th>
                      <th className="text-left py-3 px-4 font-medium">SEASONS</th>
                      <th className="text-left py-3 px-4 font-medium">RECORD</th>
                      <th className="text-left py-3 px-4 font-medium">WIN %</th>
                      <th className="text-left py-3 px-4 font-medium">ALL-PLAY RECORD</th>
                      <th className="text-left py-3 px-4 font-medium">ALL-PLAY WIN %</th>
                      <th className="text-left py-3 px-4 font-medium">LEAGUE RATING</th>
                      <th className="text-left py-3 px-4 font-medium">TROPHIES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStandings.map((team, index) => (
                      <tr 
                        key={team.team} 
                        className={`border-b hover:bg-muted/50 ${team.isCurrentUser ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{team.avatar}</div>
                            <span className="font-medium">{team.team}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{team.seasons}</td>
                        <td className="py-3 px-4 font-medium">{team.record}</td>
                        <td className="py-3 px-4 font-medium">{team.winPct}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{team.allPlayRecord}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{team.allPlayWinPct}</td>
                        <td className="py-3 px-4 font-bold">{team.leagueRating}</td>
                        <td className="py-3 px-4">{team.trophies}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="playoff" className="mt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">TEAM</th>
                      <th className="text-left py-3 px-4 font-medium">PLAYOFF APPEARANCES</th>
                      <th className="text-left py-3 px-4 font-medium">RECORD</th>
                      <th className="text-left py-3 px-4 font-medium">WIN %</th>
                      <th className="text-left py-3 px-4 font-medium"># MEDALS</th>
                      <th className="text-left py-3 px-4 font-medium">MEDAL SCORE</th>
                      <th className="text-left py-3 px-4 font-medium">TROPHIES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPlayoffStandings.map((team, index) => (
                      <tr 
                        key={team.team} 
                        className={`border-b hover:bg-muted/50 ${team.isCurrentUser ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{team.avatar}</div>
                            <span className="font-medium">{team.team}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{team.playoffAppearances}</td>
                        <td className="py-3 px-4 font-medium">{team.record}</td>
                        <td className="py-3 px-4 font-medium">{team.winPct}</td>
                        <td className="py-3 px-4 font-medium">{team.medals}</td>
                        <td className="py-3 px-4 font-bold">{team.medalScore}</td>
                        <td className="py-3 px-4">{team.trophies}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="mt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">TEAM</th>
                      <th className="text-left py-3 px-4 font-medium">DRAFT</th>
                      <th className="text-left py-3 px-4 font-medium">MANAGER</th>
                      <th className="text-left py-3 px-4 font-medium">COACH</th>
                      <th className="text-left py-3 px-4 font-medium">SOS</th>
                      <th className="text-left py-3 px-4 font-medium">LUCK</th>
                      <th className="text-left py-3 px-4 font-medium">TOP SCORE %</th>
                      <th className="text-left py-3 px-4 font-medium">RECORDS</th>
                      <th className="text-left py-3 px-4 font-medium">ACHIEVEMENTS</th>
                      <th className="text-left py-3 px-4 font-medium">POINTS SHARE AVG</th>
                      <th className="text-left py-3 px-4 font-medium">AVG SEASON SCORE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAdvancedStandings.map((team, index) => (
                      <tr 
                        key={team.team} 
                        className={`border-b hover:bg-muted/50 ${team.isCurrentUser ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{team.avatar}</div>
                            <span className="font-medium">{team.team}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium">{team.draft}</td>
                        <td className="py-3 px-4 font-medium">{team.manager}</td>
                        <td className="py-3 px-4 font-medium">{team.coach}</td>
                        <td className="py-3 px-4 font-medium">{team.sos}</td>
                        <td className="py-3 px-4 font-medium">{team.luck}</td>
                        <td className="py-3 px-4 font-medium">{team.topScorePct}</td>
                        <td className="py-3 px-4 font-medium">{team.records}</td>
                        <td className="py-3 px-4 font-medium">{team.achievements}</td>
                        <td className="py-3 px-4 font-medium">{team.pointsShareAvg}</td>
                        <td className="py-3 px-4 font-bold">{team.avgSeasonScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Season-by-Season Chart */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>SEASON-BY-SEASON</CardTitle>
            <CardDescription>View the champions and leaders for each season in history.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={seasonTab} onValueChange={setSeasonTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="champions">SEASON CHAMPIONS</TabsTrigger>
              <TabsTrigger value="chumpions">SEASON CHUMPIONS</TabsTrigger>
              <TabsTrigger value="top-ranks">SEASON TOP RANKS</TabsTrigger>
              <TabsTrigger value="worst-ranks">SEASON WORST RANKS</TabsTrigger>
            </TabsList>
            
            <TabsContent value="champions" className="mt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted">
                      <th className="text-left py-3 px-4 font-medium">SEASON</th>
                      <th className="text-left py-3 px-4 font-medium">CHAMPION</th>
                      <th className="text-left py-3 px-4 font-medium">2ND PLACE</th>
                      <th className="text-left py-3 px-4 font-medium">3RD PLACE</th>
                      <th className="text-left py-3 px-4 font-medium">IN-SEASON CHAMP</th>
                      <th className="text-left py-3 px-4 font-medium">POINTS CHAMP</th>
                      <th className="text-left py-3 px-4 font-medium">ALL-PLAY CHAMP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seasonChampionsData.map((season) => (
                      <tr
                        key={season.id} 
                        className={`border-b hover:bg-muted/50 ${season.isCurrentUser ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
                      >
                        <td className="py-3 px-4 font-medium">{season.season}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">{season.champion}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">🥈</span>
                            <span className="font-medium">{season.secondPlace}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">🥉</span>
                            <span className="font-medium">{season.thirdPlace}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium">{season.inSeasonChamp}</td>
                        <td className="py-3 px-4 font-medium">{season.pointsChamp}</td>
                        <td className="py-3 px-4 font-medium">{season.allPlayChamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="chumpions" className="mt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted">
                      <th className="text-left py-3 px-4 font-medium">SEASON</th>
                      <th className="text-left py-3 px-4 font-medium">LAST PLACE</th>
                      <th className="text-left py-3 px-4 font-medium">IN-SEASON LAST PLACE</th>
                      <th className="text-left py-3 px-4 font-medium">LOWEST SCORER</th>
                      <th className="text-left py-3 px-4 font-medium">WORST ALL-AROUND</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seasonChumpionsData.map((season) => (
                      <tr
                        key={season.id} 
                        className={`border-b hover:bg-muted/50 ${season.isCurrentUser ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
                      >
                        <td className="py-3 px-4 font-medium">{season.season}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">🌮</span>
                            <span className="font-medium">{season.lastPlace}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">💀</span>
                            <span className="font-medium">{season.inSeasonLastPlace}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">🤮</span>
                            <span className="font-medium">{season.lowestScorer}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">💩</span>
                            <span className="font-medium">{season.worstAllAround}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="top-ranks" className="mt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted">
                      <th className="text-left py-3 px-4 font-medium">SEASON</th>
                      <th className="text-left py-3 px-4 font-medium">BEST DRAFTER</th>
                      <th className="text-left py-3 px-4 font-medium">BEST MANAGER</th>
                      <th className="text-left py-3 px-4 font-medium">BEST COACH</th>
                      <th className="text-left py-3 px-4 font-medium">STRENGTH OF SCHEDULE (HARDEST)</th>
                      <th className="text-left py-3 px-4 font-medium">LUCKIEST</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seasonTopRanksData.map((season) => (
                      <tr
                        key={season.id} 
                        className={`border-b hover:bg-muted/50 ${season.isCurrentUser ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
                      >
                        <td className="py-3 px-4 font-medium">{season.season}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {(season.season === 2018) && <span className="text-lg">⭐</span>}
                            <span className="font-medium">{season.bestDrafter}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {(season.season === 2019) && <span className="text-lg">⭐</span>}
                            <span className="font-medium">{season.bestManager}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {(season.season === 2018) && <span className="text-lg">⭐</span>}
                            <span className="font-medium">{season.bestCoach}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {(season.season === 2019) && <span className="text-lg">⭐</span>}
                            <span className="font-medium">{season.hardestSchedule}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {(season.season === 2019) && <span className="text-lg">⭐</span>}
                            <span className="font-medium">{season.luckiest}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="worst-ranks" className="mt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted">
                      <th className="text-left py-3 px-4 font-medium">SEASON</th>
                      <th className="text-left py-3 px-4 font-medium">WORST DRAFTER</th>
                      <th className="text-left py-3 px-4 font-medium">WORST MANAGER</th>
                      <th className="text-left py-3 px-4 font-medium">WORST COACH</th>
                      <th className="text-left py-3 px-4 font-medium">STRENGTH OF SCHEDULE (EASIEST)</th>
                      <th className="text-left py-3 px-4 font-medium">UNLUCKIEST</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seasonWorstRanksData.map((season) => (
                      <tr
                        key={season.id} 
                        className={`border-b hover:bg-muted/50 ${season.isCurrentUser ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
                      >
                        <td className="py-3 px-4 font-medium">{season.season}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {(season.season === 2020) && <span className="text-lg">⭐</span>}
                            <span className="font-medium">{season.worstDrafter}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{season.worstManager}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {(season.season === 2020) && <span className="text-lg">⭐</span>}
                            <span className="font-medium">{season.worstCoach}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {(season.season === 2019) && <span className="text-lg">⭐</span>}
                            <span className="font-medium">{season.easiestSchedule}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {(season.season === 2019) && <span className="text-lg">⭐</span>}
                            <span className="font-medium">{season.unluckiest}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* League Ratings Chart */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{getChartInfo().title}</CardTitle>
            <CardDescription>{getChartInfo().description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={leagueRatingTab} onValueChange={setLeagueRatingTab} className="w-full">
            <TabsList className="grid w-full grid-cols-9">
              <TabsTrigger value="league-rating">LEAGUE RATING</TabsTrigger>
              <TabsTrigger value="season-score">SEASON SCORE</TabsTrigger>
              <TabsTrigger value="points-share">POINTS SHARE</TabsTrigger>
              <TabsTrigger value="final-ranks">FINAL RANKS</TabsTrigger>
              <TabsTrigger value="draft-rank">DRAFT RANK</TabsTrigger>
              <TabsTrigger value="manager-rank">MANAGER RANK</TabsTrigger>
              <TabsTrigger value="coach-rank">COACH RANK</TabsTrigger>
              <TabsTrigger value="strength-schedule">STRENGTH OF SCHEDULE</TabsTrigger>
              <TabsTrigger value="luck">LUCK</TabsTrigger>
            </TabsList>
            
            <TabsContent value={leagueRatingTab} className="mt-6">
              <div className="flex gap-6">
                {/* League Members Sidebar */}
                <div className="w-64 bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold mb-4">LEAGUE MEMBERS</h3>
                  <div className="space-y-2">
                    {Object.keys(selectedTeams).map((teamName) => (
                      <div key={teamName} className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: teamColors[teamName] }}
                        />
                        <Checkbox
                          id={teamName}
                          checked={selectedTeams[teamName]}
                          onCheckedChange={() => toggleTeam(teamName)}
                        />
                        <label 
                          htmlFor={teamName}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {teamName}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chart Area */}
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="year" 
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: '#666' }}
                      />
                      <YAxis 
                        domain={leagueRatingTab === "season-score" ? [55, 100] : 
                               leagueRatingTab === "points-share" ? [6, 12] :
                               leagueRatingTab === "final-ranks" || leagueRatingTab === "draft-rank" || 
                               leagueRatingTab === "manager-rank" || leagueRatingTab === "coach-rank" ? [1, 12] :
                               leagueRatingTab === "strength-schedule" ? [5, 10] :
                               leagueRatingTab === "luck" ? [2, 10] : [1250, 1750]}
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: '#666' }}
                        tickCount={leagueRatingTab === "season-score" ? 10 : 
                                  leagueRatingTab === "points-share" ? 7 :
                                  leagueRatingTab === "final-ranks" || leagueRatingTab === "draft-rank" || 
                                  leagueRatingTab === "manager-rank" || leagueRatingTab === "coach-rank" ? 12 :
                                  leagueRatingTab === "strength-schedule" ? 6 :
                                  leagueRatingTab === "luck" ? 9 : 11}
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          leagueRatingTab === "points-share" ? `${value}%` : 
                          leagueRatingTab === "strength-schedule" || leagueRatingTab === "luck" ? value.toFixed(1) :
                          value, 
                          name
                        ]}
                        labelFormatter={(year) => `${year} Season`}
                      />
                      {Object.keys(selectedTeams).map((teamName) => 
                        selectedTeams[teamName] && (
                          <Line
                            key={teamName}
                            type="monotone"
                            dataKey={teamName}
                            stroke={teamColors[teamName]}
                            strokeWidth={2}
                            dot={{ fill: teamColors[teamName], strokeWidth: 2, r: 4 }}
                            connectNulls={false}
                          />
                        )
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

    </div>
  );
}
