"use client";

import { useMemo, useState } from "react";
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
  Legend,
  Line
} from "recharts";
import { AlertCircle } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const COLORS = ['#ef4444', '#3b82f6', '#8b5cf6', '#f59e0b', '#6b7280', '#10b981'];

export default function DraftPage() {
  const [selectedSeason, setSelectedSeason] = useState<string>("Overview");
  const [selectedMember, setSelectedMember] = useState<string>("Overview");
  const [selectedPosition, setSelectedPosition] = useState<string>("QB");

  // Get all-time draft statistics
  const allTimeStats = useQuery(api.draftData.getAllTimeDraftStats);
  const draftValueByPosition = useQuery(api.draftData.getDraftValueByPosition);
  const topPicks = useQuery(api.draftData.getTopPicksAllTime, { limit: 50 });
  const worstPicks = useQuery(api.draftData.getWorstPicksAllTime, { limit: 50 });
  const draftRankings = useQuery(api.draftData.getAllTimeDraftRankings, { limit: 100, minPicks: 128 });
  
  // Part 2: Player and Team Stats
  const mostDraftedPlayer = useQuery(api.draftData.getMostDraftedPlayer);
  const mostValuablePlayer = useQuery(api.draftData.getMostValuablePlayer);
  const mostDraftedTeam = useQuery(api.draftData.getMostDraftedTeam);
  const mostValuableTeam = useQuery(api.draftData.getMostValuableTeam);

  // Part 3: Position-scoped queries
  const positionAverages = useQuery(api.draftData.getPositionAverages, { position: selectedPosition });
  const positionTopPicks = useQuery(api.draftData.getTopPicksAllTime, { limit: 8, position: selectedPosition });
  const positionWorstPicks = useQuery(api.draftData.getWorstPicksAllTime, { limit: 8, position: selectedPosition });
  const positionRankings = useQuery(api.draftData.getAllTimeDraftRankings, { limit: 8, position: selectedPosition });

  // Derive member list from rankings data
  const memberOptions = useMemo(() => {
    const owners = new Set<string>();
    (draftRankings || []).forEach(r => {
      const name = r.team.ownerDisplayName || r.team.name;
      if (name) owners.add(name);
    });
    return Array.from(owners).sort((a, b) => a.localeCompare(b));
  }, [draftRankings]);

  // Filter helpers based on selected member
  const filteredRankings = useMemo(() => {
    if (!draftRankings) return [];
    if (selectedMember === "Overview") return draftRankings;
    return draftRankings.filter(r => (r.team.ownerDisplayName || r.team.name) === selectedMember);
  }, [draftRankings, selectedMember]);

  const filteredTopPicks = useMemo(() => {
    if (!topPicks) return [];
    if (selectedMember === "Overview") return topPicks;
    return topPicks.filter(p => (p.team.ownerDisplayName || p.team.name) === selectedMember);
  }, [topPicks, selectedMember]);

  const filteredWorstPicks = useMemo(() => {
    if (!worstPicks) return [];
    if (selectedMember === "Overview") return worstPicks;
    return worstPicks.filter(p => (p.team.ownerDisplayName || p.team.name) === selectedMember);
  }, [worstPicks, selectedMember]);

  // Show loading state while queries are fetching
  if (allTimeStats === undefined || draftValueByPosition === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading draft data...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no draft data exists
  if (allTimeStats.totalPicks === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No Draft Data Available</h3>
          <p className="text-muted-foreground max-w-md">
            Draft data hasn't been imported yet. Please use the Import Data page to load your league data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-6xl font-bold text-primary">LL</div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">The Draft</h1>
            <p className="text-sm text-muted-foreground mt-1">Playaz Only</p>
          </div>
        </div>
        
        {/* Season and Member Dropdowns */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-muted-foreground">SEASON</span>
            <select 
              value={selectedSeason} 
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm font-medium"
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
            <span className="text-sm font-semibold text-muted-foreground">MEMBER</span>
            <select 
              value={selectedMember} 
              onChange={(e) => setSelectedMember(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm font-medium"
            >
              <option value="Overview">Overview</option>
              {memberOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* All-Time Draft Stats & Records Section */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">ALL-TIME DRAFT STATS & RECORDS</CardTitle>
            <CardDescription>View stats and records from all drafts throughout the history of the league.</CardDescription>
          </CardHeader>
        </Card>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{allTimeStats?.avgPickValue ?? "-"}</div>
                <div className="text-sm text-muted-foreground mt-2">AVG. PICK VALUE</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{allTimeStats?.avgTeamValue ?? "-"}</div>
                <div className="text-sm text-muted-foreground mt-2">AVG. TEAM VALUE</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{allTimeStats?.avgSeasonValue ?? "-"}</div>
                <div className="text-sm text-muted-foreground mt-2">AVG. SEASON VALUE</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">League Total & Avg Draft Value by Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={draftValueByPosition || []} margin={{ top: 20, right: 80, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis yAxisId="left" label={{ value: 'Total Value', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Avg Value', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="QB_total" stackId="a" fill="#ef4444" name="QB" />
                  <Bar yAxisId="left" dataKey="RB_total" stackId="a" fill="#3b82f6" name="RB" />
                  <Bar yAxisId="left" dataKey="WR_total" stackId="a" fill="#8b5cf6" name="WR" />
                  <Bar yAxisId="left" dataKey="TE_total" stackId="a" fill="#f59e0b" name="TE" />
                  <Bar yAxisId="left" dataKey="K_total" stackId="a" fill="#6b7280" name="K" />
                  <Bar yAxisId="left" dataKey="DST_total" stackId="a" fill="#10b981" name="DST" />
                  <Line yAxisId="right" type="monotone" dataKey="QB_avg" stroke="#ef4444" strokeWidth={2} dot={false} name="Avg Value" />
                  <Line yAxisId="right" type="monotone" dataKey="RB_avg" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="WR_avg" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="TE_avg" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="K_avg" stroke="#6b7280" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="DST_avg" stroke="#10b981" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      

      {/* Three Column Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Picks All-Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">TOP PICKS ALL-TIME</CardTitle>
            <CardDescription>Top draft picks by value all-time.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTopPicks && filteredTopPicks.length > 0 ? (
                filteredTopPicks.slice(0, 8).map((pick, idx) => (
                  <div key={pick._id} className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{pick.player.name} {pick.player.position} ({pick.player.team || 'N/A'})</div>
                        <div className="text-xs text-muted-foreground mt-1">{pick.season.year} · {pick.value.toFixed(1)}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">{pick.team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">{pick.team.ownerDisplayName || pick.team.name}</span>
                      </div>
                      <Badge className="bg-green-500 text-white text-xs">{pick.value > 0 ? '+' : ''}{pick.value.toFixed(2)}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Worst Picks All-Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">WORST PICKS ALL-TIME</CardTitle>
            <CardDescription>Worst draft picks by value all-time.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredWorstPicks && filteredWorstPicks.length > 0 ? (
                filteredWorstPicks.slice(0, 8).map((pick, idx) => (
                  <div key={pick._id} className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{pick.player.name} · {pick.player.position} ({pick.player.team || 'N/A'})</div>
                        <div className="text-xs text-muted-foreground mt-1">{pick.season.year} · {pick.value.toFixed(1)}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">{pick.team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">{pick.team.ownerDisplayName || pick.team.name}</span>
                      </div>
                      <Badge className="bg-red-500 text-white text-xs">{pick.value.toFixed(2)}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* All-Time Draft Rankings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ALL-TIME DRAFT RANKINGS</CardTitle>
            <CardDescription>Members ranked by all-time avg. draft pick value.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredRankings && filteredRankings.length > 0 ? (
                filteredRankings.slice(0, 8).map((ranking, idx) => (
                  <div key={ranking.team._id} className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-muted-foreground">#{idx + 1}</span>
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">{(ranking.team.ownerDisplayName || ranking.team.name || 'U').substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">{ranking.team.ownerDisplayName || ranking.team.name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-500 text-white text-xs">{ranking.avgValue}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Part 3: Position Drilldown */}
      <div className="space-y-4">
        {/* Position Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: "QB PICKS", value: "QB" },
            { label: "RB PICKS", value: "RB" },
            { label: "WR PICKS", value: "WR" },
            { label: "TE PICKS", value: "TE" },
            { label: "K PICKS", value: "K" },
            { label: "DEF PICKS", value: "DST" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedPosition(tab.value)}
              className={`px-3 py-1.5 rounded-md border text-xs font-semibold tracking-wide ${
                selectedPosition === tab.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Header + Summary Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{selectedPosition} Draft Overview</CardTitle>
            <CardDescription>High-level {selectedPosition} draft statistics across all seasons.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">AVG. DRAFT VALUE</div>
                    <div className="mt-1 text-3xl font-bold text-primary">{positionAverages?.avgDraftValue ?? '-'}</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">AVG. DRAFT ROUND</div>
                    <div className="mt-1 text-3xl font-bold text-primary">{positionAverages?.avgDraftRound ?? '-'}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Three Panel lists for position */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Picks by Position */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">TOP PICKS - {selectedPosition}</CardTitle>
              <CardDescription>Best {selectedPosition} value picks all-time.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {positionTopPicks && positionTopPicks.length > 0 ? (
                  positionTopPicks.map((pick) => (
                    <div key={pick._id} className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm">{pick.player.name}</div>
                        <div className="text-xs text-muted-foreground">{pick.season.year} · #{pick.overallPick} · {pick.team.name}</div>
                      </div>
                      <Badge className="bg-green-500 text-white text-xs">{pick.value > 0 ? '+' : ''}{pick.value}</Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No data</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Worst Picks by Position */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">WORST PICKS - {selectedPosition}</CardTitle>
              <CardDescription>Lowest {selectedPosition} value picks all-time.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {positionWorstPicks && positionWorstPicks.length > 0 ? (
                  positionWorstPicks.map((pick) => (
                    <div key={pick._id} className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm">{pick.player.name}</div>
                        <div className="text-xs text-muted-foreground">{pick.season.year} · #{pick.overallPick} · {pick.team.name}</div>
                      </div>
                      <Badge className="bg-red-500 text-white text-xs">{pick.value}</Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No data</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Rankings by Position */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">DRAFT BEST - {selectedPosition}</CardTitle>
              <CardDescription>Teams ranked by average value drafting {selectedPosition}s.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {positionRankings && positionRankings.length > 0 ? (
                  positionRankings.map((ranking, idx) => (
                    <div key={ranking.team._id} className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">#{idx+1}</div>
                        <div>
                          <div className="font-semibold text-sm">{ranking.team.ownerDisplayName || ranking.team.name}</div>
                          <div className="text-xs text-muted-foreground">{ranking.totalPicks} picks</div>
                        </div>
                      </div>
                      <Badge className="bg-green-500 text-white text-xs">{ranking.avgValue}</Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No data</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}