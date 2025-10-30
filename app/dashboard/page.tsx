"use client";

import { useState } from "react";
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
import { Trophy, Users, TrendingUp, Calendar, Target, Zap } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function LeagueHome() {
  const [selectedYear, setSelectedYear] = useState<string>("2024");

  // Mock data
  const mockLeagueStats = {
    totalSeasons: 7,
    totalTeams: 10,
    totalTransactions: 156,
    currentSeason: 2024,
    activeTeams: 10,
  };

  const mockSeasonData = [
    { year: 2018, champion: "Mad Men", totalPoints: 1443.8, avgPoints: 144.38 },
    { year: 2019, champion: "Team Alpha", totalPoints: 1521.2, avgPoints: 152.12 },
    { year: 2020, champion: "Dynasty Kings", totalPoints: 1489.6, avgPoints: 148.96 },
    { year: 2021, champion: "Gridiron Gods", totalPoints: 1567.4, avgPoints: 156.74 },
    { year: 2022, champion: "Fantasy Legends", totalPoints: 1534.8, avgPoints: 153.48 },
    { year: 2023, champion: "Champions United", totalPoints: 1598.2, avgPoints: 159.82 },
    { year: 2024, champion: "TBD", totalPoints: 1456.7, avgPoints: 145.67 },
  ];

  const mockTeamStandings = [
    { name: "Mad Men", wins: 8, losses: 5, pointsFor: 1456.7, pointsAgainst: 1423.4, streak: "W2" },
    { name: "Team Alpha", wins: 7, losses: 6, pointsFor: 1432.1, pointsAgainst: 1445.8, streak: "L1" },
    { name: "Dynasty Kings", wins: 9, losses: 4, pointsFor: 1523.9, pointsAgainst: 1398.2, streak: "W3" },
    { name: "Gridiron Gods", wins: 6, losses: 7, pointsFor: 1389.4, pointsAgainst: 1456.7, streak: "L2" },
    { name: "Fantasy Legends", wins: 8, losses: 5, pointsFor: 1467.2, pointsAgainst: 1412.9, streak: "W1" },
    { name: "Champions United", wins: 5, losses: 8, pointsFor: 1356.8, pointsAgainst: 1489.3, streak: "L3" },
    { name: "Elite Squad", wins: 7, losses: 6, pointsFor: 1423.5, pointsAgainst: 1434.7, streak: "W1" },
    { name: "Power Players", wins: 6, losses: 7, pointsFor: 1398.6, pointsAgainst: 1456.2, streak: "L1" },
    { name: "Victory Lane", wins: 8, losses: 5, pointsFor: 1478.9, pointsAgainst: 1401.4, streak: "W2" },
    { name: "Thunder Bolts", wins: 4, losses: 9, pointsFor: 1323.7, pointsAgainst: 1523.8, streak: "L4" },
  ];

  const mockTransactionTypes = [
    { name: "Trades", value: 45, color: "#0088FE" },
    { name: "Waivers", value: 67, color: "#00C49F" },
    { name: "Free Agents", value: 32, color: "#FFBB28" },
    { name: "Draft", value: 12, color: "#FF8042" },
  ];

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
                {mockSeasonData.map(season => (
                  <SelectItem key={season.year} value={season.year.toString()}>
                    {season.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-sm">
              Season {mockLeagueStats.currentSeason}
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
              <div className="text-2xl font-bold">{mockLeagueStats.totalSeasons}</div>
              <p className="text-xs text-muted-foreground">
                Since {mockSeasonData[mockSeasonData.length - 1].year}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockLeagueStats.activeTeams}</div>
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
              <div className="text-2xl font-bold">{mockLeagueStats.totalTransactions}</div>
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
                    <LineChart data={mockSeasonData}>
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
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockTransactionTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {mockTransactionTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="standings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Season Standings</CardTitle>
                <CardDescription>2024 Season Performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {mockTeamStandings.map((team, index) => (
                      <div key={team.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{team.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {team.wins}-{team.losses} • {team.pointsFor.toFixed(1)} PF
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={team.streak.startsWith('W') ? 'default' : 'destructive'}>
                            {team.streak}
                          </Badge>
                          <div className="text-right">
                            <div className="text-sm font-medium">{team.pointsFor.toFixed(1)}</div>
                            <div className="text-xs text-muted-foreground">Points For</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
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
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {mockSeasonData.map((season) => (
                        <div key={season.year} className="flex items-center justify-between p-3 border rounded-lg">
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
                </CardContent>
              </Card>

              {/* Season Points Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Season Points Distribution</CardTitle>
                  <CardDescription>Average points by season</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockSeasonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="avgPoints" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
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
                <div className="space-y-3">
                  {[
                    { type: "Trade", description: "Team Alpha traded RB Saquon Barkley to Dynasty Kings for WR Davante Adams", date: "2024-10-27" },
                    { type: "Waiver", description: "Mad Men added RB Gus Edwards from waivers", date: "2024-10-26" },
                    { type: "Free Agent", description: "Gridiron Gods dropped QB Russell Wilson", date: "2024-10-25" },
                    { type: "Trade", description: "Fantasy Legends traded WR Tyreek Hill to Champions United for RB Derrick Henry", date: "2024-10-24" },
                    { type: "Waiver", description: "Elite Squad added WR Amari Cooper from waivers", date: "2024-10-23" },
                  ].map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{transaction.type}</Badge>
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">{transaction.date}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
