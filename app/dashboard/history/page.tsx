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

  // Fetch real data from Convex
  const allTimeStandings = useQuery(api.importAllEspnData.getAllTimeStandings);
  const allTeamsWithSeasons = useQuery(api.importAllEspnData.getAllTeamsWithSeasons);
  const importAllData = useMutation(api.importAllEspnData.importAllEspnData);

  // Initialize data if not loaded
  useEffect(() => {
    if (!isDataLoaded && allTeamsWithSeasons && allTeamsWithSeasons.length === 0) {
      importAllData().then(() => {
        setIsDataLoaded(true);
      });
    } else if (allTeamsWithSeasons && allTeamsWithSeasons.length > 0) {
      setIsDataLoaded(true);
    }
  }, [allTeamsWithSeasons, isDataLoaded, importAllData]);

  // Initialize selected teams when data loads
  useEffect(() => {
    if (allTimeStandings && Object.keys(selectedTeams).length === 0) {
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
  const allTimeStandingsData = allTimeStandings ? allTimeStandings.map((team, index) => ({
    team: team.teamName,
    avatar: "🟢", // Default avatar, could be customized per team
    seasons: `${team.seasons} seasons`,
    record: `${team.totalWins}-${team.totalLosses}`,
    winPct: (team.totalWins / (team.totalWins + team.totalLosses)).toFixed(3),
    winPctNum: team.totalWins / (team.totalWins + team.totalLosses),
    allPlayRecord: "N/A", // Would need additional calculation
    allPlayWinPct: "N/A",
    allPlayWinPctNum: 0,
    leagueRating: Math.floor(1500 + (team.totalWins - team.totalLosses) * 10), // Simple calculation
    trophies: `${team.championships > 0 ? '🏆x' + team.championships : ''} ${team.secondPlace > 0 ? '🏅x' + team.secondPlace : ''} ${team.thirdPlace > 0 ? '🥉x' + team.thirdPlace : ''}`.trim() || "---",
    isCurrentUser: team.teamName === "Mad Men" // Assuming current user is odphineguy
  })) : [];

  // Generate season champions data from real data
  const seasonChampionsData = allTeamsWithSeasons ? (() => {
    const seasons = [2018, 2019, 2020, 2021, 2022, 2023, 2024];
    return seasons.map(year => {
      const seasonTeams = allTeamsWithSeasons.filter(team => team.season?.year === year);
      const sortedTeams = seasonTeams.sort((a, b) => (a.finalStanding || 0) - (b.finalStanding || 0));
      
      return {
        season: year,
        champion: sortedTeams[0]?.name || "TBD",
        secondPlace: sortedTeams[1]?.name || "TBD", 
        thirdPlace: sortedTeams[2]?.name || "TBD",
        inSeasonChamp: sortedTeams[0]?.name || "TBD",
        pointsChamp: sortedTeams.sort((a, b) => b.pointsFor - a.pointsFor)[0]?.name || "TBD",
        allPlayChamp: "TBD", // Would need additional calculation
        isCurrentUser: sortedTeams[0]?.name === "Mad Men"
      };
    });
  })() : [];

  // Data will be loaded from database
  const seasonChumpionsData = [];

  // Season-by-season data will be loaded from database
  // const seasonChampionsData = []; // Already defined above with real data

  // Season chumpions data will be loaded from database
  // const seasonChumpionsData = []; // Already defined above

  // Season top ranks data will be loaded from database
  const seasonTopRanksData = [];

  // Season worst ranks data will be loaded from database
  const seasonWorstRanksData = [];

  // League ratings data for chart will be loaded from database
  const leagueRatingsData = [];

  // Season scores data will be loaded from database
  const seasonScoresData = [];

  // Points share data will be loaded from database
  const pointsShareData = [];

  // Final ranks data will be loaded from database
  const finalRanksData = [];

  // Draft rank data will be loaded from database
  const draftRankData = [];

  // Manager rank data will be loaded from database
  const managerRankData = [];

  // Coach rank data will be loaded from database
  const coachRankData = [];

  // Strength of schedule data (higher = harder schedule) will be loaded from database
  const strengthOfScheduleData = [];

  // Luck data (higher = luckier) will be loaded from database
  const luckData = [];

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
    switch (leagueRatingTab) {
      case "league-rating":
        return leagueRatingsData;
      case "season-score":
        return seasonScoresData;
      case "points-share":
        return pointsShareData;
      case "final-ranks":
        return finalRanksData;
      case "draft-rank":
        return draftRankData;
      case "manager-rank":
        return managerRankData;
      case "coach-rank":
        return coachRankData;
      case "strength-schedule":
        return strengthOfScheduleData;
      case "luck":
        return luckData;
      default:
        return leagueRatingsData;
    }
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

  // Advanced standings data
  const advancedStandingsData = [
    { 
      team: "DeezzNutzz3", 
      avatar: "🟢", 
      draft: "🥉", 
      manager: "4th", 
      coach: "🥈", 
      sos: "10th", 
      luck: "🥈", 
      topScorePct: "66.67%", 
      records: 52, 
      achievements: 31, 
      pointsShareAvg: "11.02%", 
      avgSeasonScore: 90.07,
      isCurrentUser: false
    },
    { 
      team: "oasoto", 
      avatar: "👽", 
      draft: "6th", 
      manager: "🥈", 
      coach: "6th", 
      sos: "12th", 
      luck: "🏆", 
      topScorePct: "64.10%", 
      records: 53, 
      achievements: 24, 
      pointsShareAvg: "10.89%", 
      avgSeasonScore: 89.56,
      isCurrentUser: false
    },
    { 
      team: "Lenz31", 
      avatar: "🟢", 
      draft: "9th", 
      manager: "🏆", 
      coach: "🏆", 
      sos: "11th", 
      luck: "4th", 
      topScorePct: "61.54%", 
      records: 39, 
      achievements: 19, 
      pointsShareAvg: "10.88%", 
      avgSeasonScore: 88.93,
      isCurrentUser: false
    },
    { 
      team: "azknighted", 
      avatar: "🟢", 
      draft: "🏆", 
      manager: "5th", 
      coach: "🥉", 
      sos: "10th", 
      luck: "🥈", 
      topScorePct: "69.23%", 
      records: 54, 
      achievements: 36, 
      pointsShareAvg: "10.90%", 
      avgSeasonScore: 85.70,
      isCurrentUser: false
    },
    { 
      team: "odphineguy", 
      avatar: "🟢", 
      draft: "4th", 
      manager: "🥈", 
      coach: "5th", 
      sos: "7th", 
      luck: "9th", 
      topScorePct: "56.41%", 
      records: 25, 
      achievements: 33, 
      pointsShareAvg: "10.31%", 
      avgSeasonScore: 83.21,
      isCurrentUser: true
    },
    { 
      team: "samakers15425", 
      avatar: "🟡", 
      draft: "🥈", 
      manager: "7th", 
      coach: "8th", 
      sos: "9th", 
      luck: "🥉", 
      topScorePct: "53.85%", 
      records: 13, 
      achievements: 11, 
      pointsShareAvg: "10.16%", 
      avgSeasonScore: 78.86,
      isCurrentUser: false
    },
    { 
      team: "CeeLos1987", 
      avatar: "🟢", 
      draft: "7th", 
      manager: "8th", 
      coach: "4th", 
      sos: "4th", 
      luck: "11th", 
      topScorePct: "66.67%", 
      records: 25, 
      achievements: 16, 
      pointsShareAvg: "10.55%", 
      avgSeasonScore: 76.21,
      isCurrentUser: false
    }
  ];

  // Playoff standings data will be loaded from database
  const playoffStandingsData = [];

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
        return b.medalScore - a.medalScore;
      case "win-pct":
        return b.winPctNum - a.winPctNum;
      case "record":
        return b.totalWins - a.totalWins;
      case "playoff-appearances":
        return b.playoffAppearancesNum - a.playoffAppearancesNum;
      case "medals":
        return b.medals - a.medals;
      default:
        return b.medalScore - a.medalScore;
    }
  });

  // Sort advanced standings based on selected criteria
  const sortedAdvancedStandings = [...advancedStandingsData].sort((a, b) => {
    switch (advancedSortBy) {
      case "avg-season-score":
        return b.avgSeasonScore - a.avgSeasonScore;
      case "records":
        return b.records - a.records;
      case "achievements":
        return b.achievements - a.achievements;
      case "top-score-pct":
        return parseFloat(b.topScorePct) - parseFloat(a.topScorePct);
      case "points-share-avg":
        return parseFloat(b.pointsShareAvg) - parseFloat(a.pointsShareAvg);
      default:
        return b.avgSeasonScore - a.avgSeasonScore;
    }
  });


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold text-sm">
              LL
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">League History</h1>
              <p className="text-sm text-muted-foreground">Playaz Only • 7 Seasons</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">2023 CHAMPIONS</div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span>oasoto</span>
            <span className="text-lg">🥈</span>
            <span>Lenz31</span>
            <span className="text-lg">🥉</span>
            <span>azknighted</span>
          </div>
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
                        key={season.season} 
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
                        key={season.season} 
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
                        key={season.season} 
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
                        key={season.season} 
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
