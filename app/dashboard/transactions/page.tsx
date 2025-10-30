"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Legend
} from "recharts";
import { Calendar, Activity } from "lucide-react";

export default function TransactionsPage() {
  const [selectedSeason, setSelectedSeason] = useState<string>("overview");
  const [selectedMember, setSelectedMember] = useState<string>("overview");
  
  const transactions = useQuery(api.fantasyFootball.getAllTransactions);
  const seasons = useQuery(api.fantasyFootball.getAllSeasons);
  const teams = useQuery(api.fantasyFootball.getAllTeams);
  const stats = useQuery(api.fantasyFootball.getTransactionStats, {});
  const chartDataQuery = useQuery(api.fantasyFootball.getTransactionStatsByYear);
  const waiverRankings = useQuery(api.fantasyFootball.getTransactionRankings, { type: "WAIVER" });
  const tradeRankings = useQuery(api.fantasyFootball.getTransactionRankings, { type: "TRADE" });

  const teamNameById = useMemo(() => {
    const map = new Map<string, string>();
    (teams || []).forEach(t => map.set(t._id, t.name));
    return map;
  }, [teams]);

  // Get unique teams for the member dropdown
  const availableTeams = useMemo(() => {
    if (!teams) return ["Overview"];
    const uniqueTeams = [...new Set(teams.map(t => t.name))].sort();
    return ["Overview", ...uniqueTeams];
  }, [teams]);

  const recentTransactions = useMemo(() => {
    return (transactions || []).slice(0, 100).map(t => ({
      id: t._id,
      type: t.type,
      description: t.description,
      createdAt: t.createdAt,
      week: t.week,
      teams: (t.involvedTeams || []).map((id: any) => teamNameById.get(id) || "Unknown Team"),
    }));
  }, [transactions, teamNameById]);

  // Get unique years from seasons
  const availableYears = useMemo(() => {
    if (!seasons) return ["Overview"];
    const years = [...new Set(seasons.map(s => s.year))].sort((a, b) => b - a);
    return ["Overview", ...years.map(y => y.toString())];
  }, [seasons]);

  // Use real chart data from the query
  const chartData = useMemo(() => {
    if (!chartDataQuery) return [];
    return chartDataQuery.slice(-5); // Last 5 years
  }, [chartDataQuery]);

  const loading = transactions === undefined || seasons === undefined || teams === undefined || stats === undefined || chartDataQuery === undefined;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Activity className="w-12 h-12 animate-pulse text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Loading transaction data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Title and Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">League Transactions</h1>
        </div>
        <div className="flex gap-4">
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="SEASON" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toLowerCase()}>
                  {year === "Overview" ? "Overview" : year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="MEMBER" />
            </SelectTrigger>
            <SelectContent>
              {availableTeams.map(team => (
                <SelectItem key={team} value={team.toLowerCase()}>
                  {team}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards - Three Horizontal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              TOTAL WAIVER MOVES
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats?.waivers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              TOTAL TRADES
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats?.trades || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              TOTAL TRANSACTIONS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart - Combination Line and Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Trends</CardTitle>
          <CardDescription>Historical transaction activity by year</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis yAxisId="left" label={{ value: 'Total Transactions', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Trades', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="totalTransactions" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  name="Total Transactions"
                />
                <Bar 
                  yAxisId="right" 
                  dataKey="totalTrades" 
                  fill="#f59e0b"
                  radius={[8, 8, 0, 0]}
                  name="Trades"
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <div className="text-center">
                <p>No transaction data available for chart</p>
                <p className="text-sm mt-2">Transaction data needs to be imported from ESPN</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rankings Tables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Team Waiver Rankings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">TEAM WAIVER RANKINGS</CardTitle>
            <CardDescription className="text-xs">
              Members ranked by all-time waiver transaction value. (avg. per season)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {waiverRankings && waiverRankings.length > 0 ? (
              waiverRankings.map((item, idx) => (
                item.team ? (
                  <div key={item.team._id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8">#{idx + 1}</Badge>
                      <div>
                        <div className="font-medium text-sm">{item.team.name}</div>
                        <div className="text-xs text-muted-foreground">{item.count} transactions</div>
                      </div>
                    </div>
                    <div className={`font-semibold ${item.avgPerSeason >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.avgPerSeason.toFixed(2)}
                    </div>
                  </div>
                ) : null
              ))
            ) : (
              <div className="text-sm text-muted-foreground p-4 border rounded text-center">
                No waiver transactions available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Trade Rankings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">TEAM TRADE RANKINGS</CardTitle>
            <CardDescription className="text-xs">
              Members ranked by all-time trade transaction value. (avg. per season)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {tradeRankings && tradeRankings.length > 0 ? (
              tradeRankings.map((item, idx) => (
                item.team ? (
                  <div key={item.team._id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8">#{idx + 1}</Badge>
                      <div>
                        <div className="font-medium text-sm">{item.team.name}</div>
                        <div className="text-xs text-muted-foreground">{item.count} transactions</div>
                      </div>
                    </div>
                    <div className={`font-semibold ${item.avgPerSeason >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.avgPerSeason.toFixed(2)}
                    </div>
                  </div>
                ) : null
              ))
            ) : (
              <div className="text-sm text-muted-foreground p-4 border rounded text-center">
                No trade transactions available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Manager Rankings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">TEAM MANAGER RANKINGS</CardTitle>
            <CardDescription className="text-xs">
              Members ranked by all-time manager transaction value. (avg. per season)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats && stats.total > 0 ? (
              <div className="text-sm text-muted-foreground p-4 border rounded text-center">
                Manager rankings will be available when transaction data is imported
              </div>
            ) : (
              <div className="text-sm text-muted-foreground p-4 border rounded text-center">
                No manager transaction data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest league activity</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions && recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div key={tx.id as any} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary">{tx.type}</Badge>
                    <div>
                      <div className="font-medium">{tx.description}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(tx.createdAt).toLocaleDateString()}
                        </span>
                        {tx.week ? <span>• W{tx.week}</span> : null}
                        {tx.teams.length ? <span>• {tx.teams.join(" • ")}</span> : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground p-4 border rounded text-center">
              No transactions found in database. Transaction data needs to be imported from ESPN.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
