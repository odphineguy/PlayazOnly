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
import { BarChart3, Users, TrendingUp, Calendar, Zap, ArrowUpDown, DollarSign } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function TransactionsPage() {
  // Mock transaction data
  const recentTransactions = [
    { 
      id: 1, 
      type: "Trade", 
      description: "Team Alpha traded RB Saquon Barkley to Dynasty Kings for WR Davante Adams", 
      date: "2024-10-27", 
      teams: ["Team Alpha", "Dynasty Kings"],
      impact: "High"
    },
    { 
      id: 2, 
      type: "Waiver", 
      description: "Mad Men added RB Gus Edwards from waivers", 
      date: "2024-10-26", 
      teams: ["Mad Men"],
      impact: "Medium"
    },
    { 
      id: 3, 
      type: "Free Agent", 
      description: "Gridiron Gods dropped QB Russell Wilson", 
      date: "2024-10-25", 
      teams: ["Gridiron Gods"],
      impact: "Low"
    },
    { 
      id: 4, 
      type: "Trade", 
      description: "Fantasy Legends traded WR Tyreek Hill to Champions United for RB Derrick Henry", 
      date: "2024-10-24", 
      teams: ["Fantasy Legends", "Champions United"],
      impact: "High"
    },
    { 
      id: 5, 
      type: "Waiver", 
      description: "Elite Squad added WR Amari Cooper from waivers", 
      date: "2024-10-23", 
      teams: ["Elite Squad"],
      impact: "Medium"
    },
    { 
      id: 6, 
      type: "Trade", 
      description: "Power Players traded QB Dak Prescott to Victory Lane for WR Mike Evans", 
      date: "2024-10-22", 
      teams: ["Power Players", "Victory Lane"],
      impact: "High"
    },
    { 
      id: 7, 
      type: "Free Agent", 
      description: "Thunder Bolts added TE Travis Kelce from free agency", 
      date: "2024-10-21", 
      teams: ["Thunder Bolts"],
      impact: "High"
    },
    { 
      id: 8, 
      type: "Waiver", 
      description: "Mad Men dropped WR DeAndre Hopkins", 
      date: "2024-10-20", 
      teams: ["Mad Men"],
      impact: "Low"
    },
  ];

  const transactionTypes = [
    { name: "Trades", value: 45, color: "#0088FE" },
    { name: "Waivers", value: 67, color: "#00C49F" },
    { name: "Free Agents", value: 32, color: "#FFBB28" },
    { name: "Drops", value: 28, color: "#FF8042" },
  ];

  const teamActivity = [
    { team: "Mad Men", trades: 8, waivers: 12, freeAgents: 5, total: 25 },
    { team: "Team Alpha", trades: 6, waivers: 10, freeAgents: 4, total: 20 },
    { team: "Dynasty Kings", trades: 7, waivers: 8, freeAgents: 6, total: 21 },
    { team: "Gridiron Gods", trades: 5, waivers: 9, freeAgents: 3, total: 17 },
    { team: "Fantasy Legends", trades: 9, waivers: 11, freeAgents: 7, total: 27 },
    { team: "Champions United", trades: 4, waivers: 7, freeAgents: 2, total: 13 },
    { team: "Elite Squad", trades: 6, waivers: 10, freeAgents: 4, total: 20 },
    { team: "Power Players", trades: 8, waivers: 9, freeAgents: 5, total: 22 },
    { team: "Victory Lane", trades: 5, waivers: 8, freeAgents: 3, total: 16 },
    { team: "Thunder Bolts", trades: 3, waivers: 6, freeAgents: 1, total: 10 },
  ];

  const weeklyActivity = [
    { week: 1, trades: 12, waivers: 18, freeAgents: 8 },
    { week: 2, trades: 8, waivers: 15, freeAgents: 6 },
    { week: 3, trades: 15, waivers: 22, freeAgents: 10 },
    { week: 4, trades: 10, waivers: 20, freeAgents: 7 },
    { week: 5, trades: 18, waivers: 25, freeAgents: 12 },
    { week: 6, trades: 14, waivers: 19, freeAgents: 9 },
    { week: 7, trades: 16, waivers: 21, freeAgents: 11 },
    { week: 8, trades: 12, waivers: 17, freeAgents: 8 },
  ];

  const tradeAnalysis = [
    { position: "QB", trades: 8, avgValue: 89.2, mostTraded: "Dak Prescott" },
    { position: "RB", trades: 15, avgValue: 76.4, mostTraded: "Saquon Barkley" },
    { position: "WR", trades: 18, avgValue: 82.1, mostTraded: "Davante Adams" },
    { position: "TE", trades: 4, avgValue: 68.7, mostTraded: "Travis Kelce" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">League activity, trades, waivers, and free agent moves</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Live Activity
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">172</div>
            <p className="text-xs text-muted-foreground">This season</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trades</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Player exchanges</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waivers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67</div>
            <p className="text-xs text-muted-foreground">Waiver claims</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Free Agents</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">Free agent adds</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest league activity and moves</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant={
                        transaction.type === "Trade" ? "default" : 
                        transaction.type === "Waiver" ? "secondary" : "outline"
                      }
                    >
                      {transaction.type}
                    </Badge>
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.date} • {transaction.teams.join(" • ")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={
                        transaction.impact === "High" ? "destructive" : 
                        transaction.impact === "Medium" ? "secondary" : "outline"
                      }
                    >
                      {transaction.impact} Impact
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Transaction Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Types</CardTitle>
            <CardDescription>Distribution of league activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={transactionTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {transactionTypes.map((entry, index) => (
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
            <CardTitle>Weekly Activity Trends</CardTitle>
            <CardDescription>Transaction volume by week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="trades" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="waivers" stroke="#00C49F" strokeWidth={2} />
                <Line type="monotone" dataKey="freeAgents" stroke="#FFBB28" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Team Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Team Activity</CardTitle>
          <CardDescription>Transaction activity by team</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {teamActivity.map((team, index) => (
                <div key={team.team} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{team.team}</div>
                      <div className="text-sm text-muted-foreground">
                        {team.trades} trades • {team.waivers} waivers • {team.freeAgents} FA
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{team.total}</div>
                    <div className="text-xs text-muted-foreground">Total Moves</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Trade Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Trade Analysis</CardTitle>
          <CardDescription>Positional trade breakdown and value analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tradeAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="position" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [value, 'Trades']}
                labelFormatter={(position) => `${position} Position`}
              />
              <Bar dataKey="trades" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Transaction Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Insights</CardTitle>
          <CardDescription>Key patterns and trends in league activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Most Active Teams</h4>
                <p className="text-sm text-muted-foreground">
                  Fantasy Legends leads with 27 total transactions, followed by Power Players (22) 
                  and Dynasty Kings (21). These teams are constantly optimizing their rosters.
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Trade Patterns</h4>
                <p className="text-sm text-muted-foreground">
                  WRs are the most traded position (18 trades), followed by RBs (15). 
                  QBs have the highest average trade value at 89.2 points.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Waiver Wire Activity</h4>
                <p className="text-sm text-muted-foreground">
                  Waivers account for 39% of all transactions, showing active roster management. 
                  Week 5 had the highest waiver activity with 25 claims.
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">Impact Transactions</h4>
                <p className="text-sm text-muted-foreground">
                  High-impact trades often involve elite players like Saquon Barkley and Davante Adams. 
                  These moves significantly shift team dynamics and playoff chances.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
