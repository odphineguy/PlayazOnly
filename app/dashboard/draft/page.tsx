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
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Target, Users, TrendingUp, Calendar, Zap, Award, FileText } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function DraftPage() {
  // Mock draft data
  const draftResults = [
    { pick: 1, team: "Mad Men", player: "Josh Allen", position: "QB", points: 312.4 },
    { pick: 2, team: "Team Alpha", player: "Lamar Jackson", position: "QB", points: 298.7 },
    { pick: 3, team: "Dynasty Kings", player: "Christian McCaffrey", position: "RB", points: 285.3 },
    { pick: 4, team: "Gridiron Gods", player: "Tyreek Hill", position: "WR", points: 267.8 },
    { pick: 5, team: "Fantasy Legends", player: "Austin Ekeler", position: "RB", points: 254.2 },
    { pick: 6, team: "Champions United", player: "Davante Adams", position: "WR", points: 241.6 },
    { pick: 7, team: "Elite Squad", player: "Derrick Henry", position: "RB", points: 228.9 },
    { pick: 8, team: "Power Players", player: "Stefon Diggs", position: "WR", points: 216.3 },
    { pick: 9, team: "Victory Lane", player: "Saquon Barkley", position: "RB", points: 203.7 },
    { pick: 10, team: "Thunder Bolts", player: "Cooper Kupp", position: "WR", points: 191.1 },
  ];

  const positionDistribution = [
    { position: "QB", count: 3, color: "#0088FE" },
    { position: "RB", count: 4, color: "#00C49F" },
    { position: "WR", count: 3, color: "#FFBB28" },
  ];

  const teamDraftGrades = [
    { team: "Mad Men", grade: "A+", picks: 8, avgValue: 89.2, bestPick: "Josh Allen (1.01)" },
    { team: "Team Alpha", grade: "A", picks: 8, avgValue: 87.4, bestPick: "Lamar Jackson (1.02)" },
    { team: "Dynasty Kings", grade: "A-", picks: 8, avgValue: 85.6, bestPick: "Christian McCaffrey (1.03)" },
    { team: "Gridiron Gods", grade: "B+", picks: 8, avgValue: 82.3, bestPick: "Tyreek Hill (1.04)" },
    { team: "Fantasy Legends", grade: "B", picks: 8, avgValue: 79.8, bestPick: "Austin Ekeler (1.05)" },
    { team: "Champions United", grade: "B-", picks: 8, avgValue: 77.1, bestPick: "Davante Adams (1.06)" },
    { team: "Elite Squad", grade: "C+", picks: 8, avgValue: 74.5, bestPick: "Derrick Henry (1.07)" },
    { team: "Power Players", grade: "C", picks: 8, avgValue: 71.9, bestPick: "Stefon Diggs (1.08)" },
    { team: "Victory Lane", grade: "C-", picks: 8, avgValue: 69.2, bestPick: "Saquon Barkley (1.09)" },
    { team: "Thunder Bolts", grade: "D+", picks: 8, avgValue: 66.7, bestPick: "Cooper Kupp (1.10)" },
  ];

  const draftTrends = [
    { round: 1, avgPoints: 258.3, qbCount: 2, rbCount: 3, wrCount: 5 },
    { round: 2, avgPoints: 198.7, qbCount: 1, rbCount: 4, wrCount: 5 },
    { round: 3, avgPoints: 156.2, qbCount: 0, rbCount: 3, wrCount: 7 },
    { round: 4, avgPoints: 124.8, qbCount: 0, rbCount: 2, wrCount: 8 },
    { round: 5, avgPoints: 98.4, qbCount: 0, rbCount: 1, wrCount: 9 },
  ];

  const positionalValue = [
    { position: "QB", avgPoints: 305.5, topPick: 1, totalPicks: 3 },
    { position: "RB", avgPoints: 242.8, topPick: 3, totalPicks: 13 },
    { position: "WR", avgPoints: 225.1, topPick: 4, totalPicks: 34 },
    { position: "TE", avgPoints: 156.7, topPick: 11, totalPicks: 8 },
    { position: "K", avgPoints: 98.3, topPick: 15, totalPicks: 10 },
    { position: "DEF", avgPoints: 87.2, topPick: 16, totalPicks: 10 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">The Draft</h1>
          <p className="text-muted-foreground">2024 Draft Analysis and Results</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Draft Analysis
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Picks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">80</div>
            <p className="text-xs text-muted-foreground">8 rounds × 10 teams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Pick</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Josh Allen</div>
            <p className="text-xs text-muted-foreground">Mad Men (1.01)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">A+</div>
            <p className="text-xs text-muted-foreground">Mad Men draft grade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Points</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">187.3</div>
            <p className="text-xs text-muted-foreground">Per drafted player</p>
          </CardContent>
        </Card>
      </div>

      {/* First Round Results */}
      <Card>
        <CardHeader>
          <CardTitle>First Round Results</CardTitle>
          <CardDescription>Top 10 picks of the 2024 draft</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {draftResults.map((pick) => (
                <div key={pick.pick} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {pick.pick}
                    </div>
                    <div>
                      <div className="font-medium">{pick.player}</div>
                      <div className="text-sm text-muted-foreground">
                        {pick.position} • {pick.team}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{pick.position}</Badge>
                    <div className="text-right">
                      <div className="text-sm font-medium">{pick.points.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">Points</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Draft Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Position Distribution</CardTitle>
            <CardDescription>First round positional breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={positionDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ position, count }) => `${position}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {positionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Draft Trends by Round</CardTitle>
            <CardDescription>Average points and positional trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={draftTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="round" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [value.toFixed(1), 'Avg Points']}
                  labelFormatter={(round) => `Round ${round}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="avgPoints" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Team Draft Grades */}
      <Card>
        <CardHeader>
          <CardTitle>Team Draft Grades</CardTitle>
          <CardDescription>Analysis of each team's draft performance</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {teamDraftGrades.map((team, index) => (
                <div key={team.team} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{team.team}</div>
                      <div className="text-sm text-muted-foreground">
                        {team.picks} picks • {team.avgValue.toFixed(1)} avg value
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={team.grade.startsWith('A') ? 'default' : team.grade.startsWith('B') ? 'secondary' : 'outline'}
                    >
                      {team.grade}
                    </Badge>
                    <div className="text-right">
                      <div className="text-sm font-medium">{team.bestPick}</div>
                      <div className="text-xs text-muted-foreground">Best Pick</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Positional Value Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Positional Value Analysis</CardTitle>
          <CardDescription>Average points and draft position by position</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={positionalValue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="position" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [value.toFixed(1), 'Avg Points']}
                labelFormatter={(position) => `${position} Position`}
              />
              <Bar dataKey="avgPoints" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Draft Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Draft Insights</CardTitle>
          <CardDescription>Key takeaways from the 2024 draft</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">QB Strategy</h4>
                <p className="text-sm text-muted-foreground">
                  Teams prioritized elite QBs early, with 3 QBs going in the first 2 rounds. 
                  Josh Allen and Lamar Jackson were the clear top choices.
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">RB Depth</h4>
                <p className="text-sm text-muted-foreground">
                  Running backs dominated the early rounds, with 7 RBs selected in the first 2 rounds. 
                  Christian McCaffrey was the first non-QB selected.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">WR Value</h4>
                <p className="text-sm text-muted-foreground">
                  Wide receivers provided excellent value in the middle rounds, with several 
                  top-tier WRs falling to the 3rd and 4th rounds.
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Draft Grades</h4>
                <p className="text-sm text-muted-foreground">
                  Mad Men earned the highest grade (A+) for securing Josh Allen at 1.01, 
                  while Thunder Bolts struggled with late-round value picks.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
