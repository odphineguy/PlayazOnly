"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Line
} from "recharts";
import { Trophy, Users, TrendingUp, Calendar, Target, Zap } from "lucide-react";

export default function StandingsPage() {
  // Mock standings data
  const currentStandings = [
    { rank: 1, name: "Dynasty Kings", wins: 9, losses: 4, pointsFor: 1523.9, pointsAgainst: 1398.2, streak: "W3", playoffOdds: 95 },
    { rank: 2, name: "Mad Men", wins: 8, losses: 5, pointsFor: 1456.7, pointsAgainst: 1423.4, streak: "W2", playoffOdds: 78 },
    { rank: 3, name: "Fantasy Legends", wins: 8, losses: 5, pointsFor: 1467.2, pointsAgainst: 1412.9, streak: "W1", playoffOdds: 72 },
    { rank: 4, name: "Victory Lane", wins: 8, losses: 5, pointsFor: 1478.9, pointsAgainst: 1401.4, streak: "W2", playoffOdds: 68 },
    { rank: 5, name: "Team Alpha", wins: 7, losses: 6, pointsFor: 1432.1, pointsAgainst: 1445.8, streak: "L1", playoffOdds: 45 },
    { rank: 6, name: "Elite Squad", wins: 7, losses: 6, pointsFor: 1423.5, pointsAgainst: 1434.7, streak: "W1", playoffOdds: 42 },
    { rank: 7, name: "Power Players", wins: 6, losses: 7, pointsFor: 1398.6, pointsAgainst: 1456.2, streak: "L1", playoffOdds: 28 },
    { rank: 8, name: "Gridiron Gods", wins: 6, losses: 7, pointsFor: 1389.4, pointsAgainst: 1456.7, streak: "L2", playoffOdds: 25 },
    { rank: 9, name: "Champions United", wins: 5, losses: 8, pointsFor: 1356.8, pointsAgainst: 1489.3, streak: "L3", playoffOdds: 12 },
    { rank: 10, name: "Thunder Bolts", wins: 4, losses: 9, pointsFor: 1323.7, pointsAgainst: 1523.8, streak: "L4", playoffOdds: 3 },
  ];

  const weeklyStandings = [
    { week: 1, leader: "Dynasty Kings", record: "1-0", points: 145.2 },
    { week: 2, leader: "Mad Men", record: "2-0", points: 298.4 },
    { week: 3, leader: "Fantasy Legends", record: "3-0", points: 456.7 },
    { week: 4, leader: "Victory Lane", record: "3-1", points: 589.3 },
    { week: 5, leader: "Dynasty Kings", record: "4-1", points: 734.8 },
    { week: 6, leader: "Dynasty Kings", record: "5-1", points: 879.2 },
    { week: 7, leader: "Dynasty Kings", record: "6-1", points: 1023.6 },
    { week: 8, leader: "Dynasty Kings", record: "7-1", points: 1168.4 },
    { week: 9, leader: "Dynasty Kings", record: "7-2", points: 1289.7 },
    { week: 10, leader: "Dynasty Kings", record: "8-2", points: 1434.1 },
    { week: 11, leader: "Dynasty Kings", record: "8-3", points: 1556.8 },
    { week: 12, leader: "Dynasty Kings", record: "9-3", points: 1701.2 },
    { week: 13, leader: "Dynasty Kings", record: "9-4", points: 1823.9 },
  ];

  const playoffPicture = [
    { seed: 1, team: "Dynasty Kings", record: "9-4", bye: true, matchup: "BYE" },
    { seed: 2, team: "Mad Men", record: "8-5", bye: true, matchup: "BYE" },
    { seed: 3, team: "Fantasy Legends", record: "8-5", bye: false, matchup: "vs Victory Lane" },
    { seed: 4, team: "Victory Lane", record: "8-5", bye: false, matchup: "vs Fantasy Legends" },
    { seed: 5, team: "Team Alpha", record: "7-6", bye: false, matchup: "vs Elite Squad" },
    { seed: 6, team: "Elite Squad", record: "7-6", bye: false, matchup: "vs Team Alpha" },
  ];

  const teamStats = [
    { team: "Dynasty Kings", avgPoints: 117.2, consistency: 94, luck: 2.1 },
    { team: "Mad Men", avgPoints: 112.1, consistency: 89, luck: -1.3 },
    { team: "Fantasy Legends", avgPoints: 112.9, consistency: 87, luck: 0.8 },
    { team: "Victory Lane", avgPoints: 113.8, consistency: 91, luck: 1.2 },
    { team: "Team Alpha", avgPoints: 110.2, consistency: 85, luck: -2.1 },
    { team: "Elite Squad", avgPoints: 109.5, consistency: 83, luck: -0.7 },
    { team: "Power Players", avgPoints: 107.6, consistency: 79, luck: -3.2 },
    { team: "Gridiron Gods", avgPoints: 106.9, consistency: 81, luck: -2.8 },
    { team: "Champions United", avgPoints: 104.4, consistency: 76, luck: -4.1 },
    { team: "Thunder Bolts", avgPoints: 101.8, consistency: 72, luck: -5.3 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Standings</h1>
          <p className="text-muted-foreground">2024 Season Current Standings and Playoff Picture</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Week 13
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">League Leader</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Dynasty Kings</div>
            <p className="text-xs text-muted-foreground">9-4 record</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Playoff Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Top 6 qualify</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Scorer</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Victory Lane</div>
            <p className="text-xs text-muted-foreground">1478.9 points</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Record</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9-4</div>
            <p className="text-xs text-muted-foreground">Dynasty Kings</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Standings */}
      <Card>
        <CardHeader>
          <CardTitle>Current Standings</CardTitle>
          <CardDescription>2024 Season - Week 13</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {currentStandings.map((team) => (
                <div key={team.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      team.rank <= 6 ? 'bg-primary text-primary-foreground' : 
                      team.rank <= 8 ? 'bg-secondary text-secondary-foreground' : 
                      'bg-muted text-muted-foreground'
                    }`}>
                      {team.rank}
                    </div>
                    <div>
                      <div className="font-medium">{team.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {team.wins}-{team.losses} • {team.pointsFor.toFixed(1)} PF • {team.pointsAgainst.toFixed(1)} PA
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={team.streak.startsWith('W') ? 'default' : 'destructive'}
                    >
                      {team.streak}
                    </Badge>
                    <div className="text-right">
                      <div className="text-sm font-medium">{team.playoffOdds}%</div>
                      <div className="text-xs text-muted-foreground">Playoff Odds</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Playoff Picture */}
      <Card>
        <CardHeader>
          <CardTitle>Playoff Picture</CardTitle>
          <CardDescription>Current playoff seeding and matchups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">First Round Byes</h4>
              {playoffPicture.filter(team => team.bye).map((team) => (
                <div key={team.seed} className="flex items-center justify-between p-3 border rounded-lg bg-primary/5">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {team.seed}
                    </div>
                    <div>
                      <div className="font-medium">{team.team}</div>
                      <div className="text-sm text-muted-foreground">{team.record}</div>
                    </div>
                  </div>
                  <Badge variant="outline">BYE</Badge>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">Wild Card Round</h4>
              {playoffPicture.filter(team => !team.bye).map((team) => (
                <div key={team.seed} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground text-sm font-bold">
                      {team.seed}
                    </div>
                    <div>
                      <div className="font-medium">{team.team}</div>
                      <div className="text-sm text-muted-foreground">{team.record}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{team.matchup}</div>
                    <div className="text-xs text-muted-foreground">Matchup</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Standings Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Standings Trend</CardTitle>
          <CardDescription>League leader progression throughout the season</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyStandings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [value.toFixed(1), 'Points']}
                labelFormatter={(week) => `Week ${week}`}
              />
              <Line 
                type="monotone" 
                dataKey="points" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Team Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Team Statistics</CardTitle>
          <CardDescription>Advanced metrics and team performance analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {teamStats.map((team, index) => (
                <div key={team.team} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{team.team}</div>
                      <div className="text-sm text-muted-foreground">
                        {team.avgPoints.toFixed(1)} avg pts • {team.consistency}% consistency
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${team.luck > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {team.luck > 0 ? '+' : ''}{team.luck.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">Luck Rating</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Standings Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Standings Insights</CardTitle>
          <CardDescription>Key observations about the current season</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Playoff Race</h4>
                <p className="text-sm text-muted-foreground">
                  Dynasty Kings and Mad Men have secured first-round byes with 95% and 78% playoff odds respectively. 
                  The 6th seed is still up for grabs between Elite Squad and Power Players.
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Scoring Leaders</h4>
                <p className="text-sm text-muted-foreground">
                  Victory Lane leads in total points (1478.9) but sits 4th in standings, showing the importance 
                  of schedule luck in fantasy football.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Consistency Factor</h4>
                <p className="text-sm text-muted-foreground">
                  Dynasty Kings leads in consistency (94%) and has the best luck rating (+2.1), 
                  while Thunder Bolts struggles with consistency (72%) and poor luck (-5.3).
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Streak Watch</h4>
                <p className="text-sm text-muted-foreground">
                  Dynasty Kings is on a 3-game winning streak, while Thunder Bolts has lost 4 straight. 
                  These streaks often determine playoff positioning in tight races.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
