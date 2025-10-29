"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ComposedChart,
  Legend
} from "recharts";
import { AlertCircle } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const COLORS = ['#ef4444', '#3b82f6', '#8b5cf6', '#f59e0b', '#6b7280', '#10b981'];

export default function DraftPage() {
  const [selectedSeason, setSelectedSeason] = useState<string>("Overview");
  const [selectedMember, setSelectedMember] = useState<string>("Overview");

  // Get all-time draft statistics
  const allTimeStats = useQuery(api.draftData.getAllTimeDraftStats);
  const draftValueByPosition = useQuery(api.draftData.getDraftValueByPosition);
  const topPicks = useQuery(api.draftData.getTopPicksAllTime, { limit: 5 });
  const worstPicks = useQuery(api.draftData.getWorstPicksAllTime, { limit: 5 });
  const draftRankings = useQuery(api.draftData.getAllTimeDraftRankings, { limit: 10 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground">LL</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">The Draft</h1>
            <p className="text-muted-foreground flex items-center">
              Playaz Only <span className="ml-2">🏈</span>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">SEASON</span>
            <select 
              value={selectedSeason} 
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="Overview">Overview</option>
              <option value="2018">2018</option>
              <option value="2019">2019</option>
              <option value="2020">2020</option>
              <option value="2021">2021</option>
              <option value="2022">2022</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">MEMBER</span>
            <select 
              value={selectedMember} 
              onChange={(e) => setSelectedMember(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="Overview">Overview</option>
            </select>
          </div>
        </div>
      </div>

      {/* All-Time Draft Stats & Records */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">ALL-TIME DRAFT STATS & RECORDS</CardTitle>
          <CardDescription>View stats and records from all drafts throughout the history of the league.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Stats Cards */}
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-primary">{allTimeStats?.avgPickValue ?? "-"}</div>
                <div className="text-sm text-muted-foreground mt-1">AVG. PICK VALUE</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-primary">{allTimeStats?.avgTeamValue ?? "-"}</div>
                <div className="text-sm text-muted-foreground mt-1">AVG. TEAM VALUE</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-primary">{allTimeStats?.avgSeasonValue ?? "-"}</div>
                <div className="text-sm text-muted-foreground mt-1">AVG. SEASON VALUE</div>
              </div>
            </div>
            
            {/* Chart */}
            <div className="md:col-span-3">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={draftValueByPosition || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="QB_total" stackId="a" fill="#ef4444" name="QB" />
                    <Bar yAxisId="left" dataKey="RB_total" stackId="a" fill="#3b82f6" name="RB" />
                    <Bar yAxisId="left" dataKey="WR_total" stackId="a" fill="#8b5cf6" name="WR" />
                    <Bar yAxisId="left" dataKey="TE_total" stackId="a" fill="#f59e0b" name="TE" />
                    <Bar yAxisId="left" dataKey="K_total" stackId="a" fill="#6b7280" name="K" />
                    <Bar yAxisId="left" dataKey="DST_total" stackId="a" fill="#10b981" name="DST" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Picks All-Time */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">TOP PICKS ALL-TIME</CardTitle>
          <CardDescription>Top draft picks by value all-time.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topPicks && topPicks.length > 0 ? (
              topPicks.map((pick, index) => (
                <div key={pick._id} className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{pick.player.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {pick.player.position} ({pick.player.team || 'N/A'}) / {pick.season.year} · {pick.overallPick}
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Value: {pick.value}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center py-8">
                <div className="text-center space-y-2">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">No draft data available</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Worst Picks All-Time */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">WORST PICKS ALL-TIME</CardTitle>
          <CardDescription>Worst draft picks by value all-time.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {worstPicks && worstPicks.length > 0 ? (
              worstPicks.map((pick, index) => (
                <div key={pick._id} className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{pick.player.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {pick.player.position} ({pick.player.team || 'N/A'}) / {pick.season.year} · {pick.overallPick}
                      </div>
                    </div>
                    <Badge variant="destructive" className="bg-red-100 text-red-800">
                      Value: {pick.value}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center py-8">
                <div className="text-center space-y-2">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">No draft data available</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* All-Time Draft Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">ALL-TIME DRAFT RANKINGS</CardTitle>
          <CardDescription>Members ranked by all-time avg. draft pick value.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {draftRankings && draftRankings.length > 0 ? (
              draftRankings.map((ranking, index) => (
                <div key={ranking.team._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{ranking.team.ownerDisplayName || ranking.team.name}</div>
                      <div className="text-sm text-muted-foreground">{ranking.totalPicks} picks</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Value: {ranking.avgValue}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-2">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">No draft data available</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}