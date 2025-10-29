"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Trophy, Users, TrendingUp, Calendar, Target, Zap, Clock } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function LeagueHome() {
  const [selectedYear, setSelectedYear] = useState<string>("all");

  // Fetch all data from Convex
  const leagues = useQuery(api.fantasyFootball.getAllLeagues);
  const seasons = useQuery(api.fantasyFootball.getAllSeasons);
  const teams = useQuery(api.fantasyFootball.getAllTeams);
  const matchups = useQuery(api.fantasyFootball.getAllMatchups);
  const transactions = useQuery(api.fantasyFootball.getAllTransactions);

  // Loading state - only check required queries, transactions is optional
  if (!leagues || !seasons || !teams || !matchups) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Clock className="w-12 h-12 animate-spin text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">Loading league data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Process data
  const processedSeasons = useMemo(() => {
    if (!seasons || !teams || !matchups) return [];

    return seasons.map(season => {
      const seasonTeams = teams.filter(t => t.seasonId === season._id);
      const seasonMatchups = matchups.filter(m => m.seasonId === season._id);
      
      // Calculate total points for the season
      let totalPoints = 0;
      seasonMatchups.forEach(matchup => {
        totalPoints += matchup.homeScore + matchup.awayScore;
      });
      
      const avgPoints = seasonTeams.length > 0 ? totalPoints / (seasonTeams.length * seasonMatchups.length) : 0;

      // Find champion (team with finalStanding === 1 or highest standing)
      const champion = seasonTeams.find(t => t.finalStanding === 1) || 
                      seasonTeams.sort((a, b) => a.standing - b.standing)[0];

      // Find championship matchup
      const championshipMatchup = seasonMatchups.find(m => m.gameType === "CHAMPIONSHIP");

      return {
        ...season,
        champion: champion?.name || "TBD",
        totalPoints,
        avgPoints,
        championshipMatchup
      };
    }).sort((a, b) => b.year - a.year);
  }, [seasons, teams, matchups]);

  // Get available years for sorting
  const availableYears = useMemo(() => {
    const years = processedSeasons.map(s => s.year);
    return ["all", ...years.map(y => y.toString())];
  }, [processedSeasons]);

  // Filter data based on selected year
  const filteredData = useMemo(() => {
    if (selectedYear === "all") return processedSeasons;
    return processedSeasons.filter(s => s.year.toString() === selectedYear);
  }, [processedSeasons, selectedYear]);

  // Get current/most recent season
  const currentSeason = processedSeasons[0];

  // Calculate league stats
  const leagueStats = useMemo(() => {
    const totalSeasons = seasons.length;
    const uniqueTeams = new Set(teams.map(t => t.name)).size;
    const totalTransactions = transactions.length;
    
    return {
      totalSeasons,
      activeTeams: uniqueTeams,
      totalTransactions,
      currentSeason: currentSeason?.year || 2024
    };
  }, [seasons, teams, transactions, currentSeason]);

  // Transaction types distribution
  const transactionTypes = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    
    const typeCounts = new Map<string, number>();
    transactions.forEach(t => {
      typeCounts.set(t.type, (typeCounts.get(t.type) || 0) + 1);
    });

    return Array.from(typeCounts.entries()).map(([name, value]) => ({
      name: name.replace('_', ' '),
      value,
      color: COLORS[typeCounts.size % COLORS.length]
    }));
  }, [transactions]);

  // Get standings for selected year
  const standings = useMemo(() => {
    if (selectedYear === "all") {
      // Show current season
      const season = processedSeasons[0];
      if (!season) return [];
      return teams
        .filter(t => t.seasonId === season._id)
        .sort((a, b) => a.standing - b.standing);
    }
    
    const season = processedSeasons.find(s => s.year.toString() === selectedYear);
    if (!season) return [];
    
    return teams
      .filter(t => t.seasonId === season._id)
      .sort((a, b) => a.standing - b.standing);
  }, [selectedYear, processedSeasons, teams]);

  // Recent transactions
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 10).map(t => {
      const season = seasons.find(s => s._id === t.seasonId);
      return {
        ...t,
        year: season?.year || "Unknown"
      };
    });
  }, [transactions, seasons]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Playaz Only Fantasy League</h1>
            <p className="text-muted-foreground">League Legacy Dashboard</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year}>
                    {year === "all" ? "All Years" : year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-sm">
              Season {leagueStats.currentSeason}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Seasons</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leagueStats.totalSeasons}</div>
              <p className="text-xs text-muted-foreground">
                Since {processedSeasons[processedSeasons.length - 1]?.year || 2018}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leagueStats.activeTeams}</div>
              <p className="text-xs text-muted-foreground">
                Current season
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leagueStats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">League Activity</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">High</div>
              <p className="text-xs text-muted-foreground">
                Very active league
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="standings">Standings</TabsTrigger>
            <TabsTrigger value="history">League History</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="draft">Draft Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Season Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Season Performance Trends</CardTitle>
                  <CardDescription>Average points per season</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={filteredData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="avgPoints" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Transaction Types */}
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Types</CardTitle>
                  <CardDescription>Distribution of league activity</CardDescription>
                </CardHeader>
                <CardContent>
                  {transactionTypes.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={transactionTypes}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {transactionTypes.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      No transaction data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="standings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedYear === "all" ? "Current" : selectedYear} Season Standings
                </CardTitle>
                <CardDescription>
                  {selectedYear === "all" ? currentSeason?.year : selectedYear} Season Performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {standings.length > 0 ? (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {standings.map((team, index) => {
                        const streak = team.streakType === "WIN" ? `W${team.streakLength}` : `L${team.streakLength}`;
                        return (
                          <div key={team._id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                                {team.standing}
                              </div>
                              <div>
                                <div className="font-medium">{team.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {team.wins}-{team.losses} • {team.pointsFor.toFixed(1)} PF
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={team.streakType === "WIN" ? 'default' : 'destructive'}>
                                {streak}
                              </Badge>
                              <div className="text-right">
                                <div className="text-sm font-medium">{team.pointsFor.toFixed(1)}</div>
                                <div className="text-xs text-muted-foreground">Points For</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No standings data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Championship History */}
              <Card>
                <CardHeader>
                  <CardTitle>Championship History</CardTitle>
                  <CardDescription>Past champions and their seasons</CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredData.length > 0 ? (
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3">
                        {filteredData.map((season) => (
                          <div key={season._id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Trophy className="h-5 w-5 text-yellow-500" />
                              <div>
                                <div className="font-medium">{season.champion}</div>
                                <div className="text-sm text-muted-foreground">{season.year} Season</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{season.totalPoints.toFixed(1)}</div>
                              <div className="text-xs text-muted-foreground">Total Points</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No championship data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Season Points Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Season Points Distribution</CardTitle>
                  <CardDescription>Average points by season</CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={filteredData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="avgPoints" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest league activity</CardDescription>
              </CardHeader>
              <CardContent>
                {recentTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">{transaction.type}</Badge>
                          <div>
                            <div className="font-medium">{transaction.description}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(transaction.createdAt).toLocaleDateString()} • {transaction.year}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="draft" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Draft Analysis</CardTitle>
                <CardDescription>Visit The Draft page for comprehensive analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Draft Analysis Available</h3>
                  <p className="text-muted-foreground">
                    Visit The Draft page to see detailed analysis of draft picks, 
                    positional trends, and team strategies.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
