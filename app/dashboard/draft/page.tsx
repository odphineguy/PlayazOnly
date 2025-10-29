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
  Legend
} from "recharts";
import { AlertCircle } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

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


  // Pt2: position-focused queries
  const positionAverages = useQuery(api.draftData.getPositionAverages, { position: selectedPosition });
  const positionTopPicks = useQuery(api.draftData.getTopPicksAllTime, { limit: 5, position: selectedPosition });
  const positionWorstPicks = useQuery(api.draftData.getWorstPicksAllTime, { limit: 5, position: selectedPosition });
  const positionRankings = useQuery(api.draftData.getAllTimeDraftRankings, { limit: 10, position: selectedPosition });

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
              {memberOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
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

      

      {/* All-Time Draft Analysis */}
      <div className="space-y-4">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">ALL-TIME DRAFT ANALYSIS</CardTitle>
            <CardDescription>Comprehensive analysis of draft performance across all seasons.</CardDescription>
          </CardHeader>
        </Card>

        {/* Three Vertical Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Picks All-Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">TOP PICKS ALL-TIME</CardTitle>
              <CardDescription>Best value picks by position.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTopPicks && filteredTopPicks.length > 0 ? (
                  filteredTopPicks.slice(0, 10).map((pick, idx) => (
                    <div key={pick._id} className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{pick.player.name}</div>
                        <div className="text-sm text-muted-foreground">{pick.season.year} · #{pick.overallPick} · {pick.team.name}</div>
                      </div>
                      <Badge className={`${
                        idx <= 4 ? 'text-white' : 'text-gray-800' // White text for dark greens, dark text for light greens
                      } ${
                        idx === 0 ? 'bg-green-900' : // Best - darkest green
                        idx === 1 ? 'bg-green-800' : // #2 - very dark green
                        idx === 2 ? 'bg-green-700' : // #3 - dark green
                        idx === 3 ? 'bg-green-600' : // #4 - green
                        idx === 4 ? 'bg-green-500' : // #5 - medium green
                        idx === 5 ? 'bg-green-400' : // #6 - light green
                        idx === 6 ? 'bg-green-300' : // #7 - lighter green
                        idx === 7 ? 'bg-green-200' : // #8 - even lighter green
                        idx === 8 ? 'bg-green-100' : // #9 - very light green
                        'bg-gray-200' // #10+ - light gray
                      }`}>{pick.value}</Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No data</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Worst Picks All-Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">WORST PICKS ALL-TIME</CardTitle>
              <CardDescription>Lowest value picks by position.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredWorstPicks && filteredWorstPicks.length > 0 ? (
                  filteredWorstPicks.slice(0, 10).map((pick, idx) => (
                    <div key={pick._id} className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{pick.player.name}</div>
                        <div className="text-sm text-muted-foreground">{pick.season.year} · #{pick.overallPick} · {pick.team.name}</div>
                      </div>
                      <Badge className={`${
                        idx <= 4 ? 'text-white' : 'text-gray-800' // White text for dark reds, dark text for light reds
                      } ${
                        idx === 0 ? 'bg-red-900' : // Worst - darkest red
                        idx === 1 ? 'bg-red-800' : // #2 - very dark red
                        idx === 2 ? 'bg-red-700' : // #3 - dark red
                        idx === 3 ? 'bg-red-600' : // #4 - red
                        idx === 4 ? 'bg-red-500' : // #5 - medium red
                        idx === 5 ? 'bg-red-400' : // #6 - light red
                        idx === 6 ? 'bg-red-300' : // #7 - lighter red
                        idx === 7 ? 'bg-red-200' : // #8 - even lighter red
                        idx === 8 ? 'bg-red-100' : // #9 - very light red
                        'bg-gray-200' // #10+ - light gray
                      }`}>{pick.value}</Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No data</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* All-Time Draft Rankings */}
          <Card>
            <CardHeader>
            <CardTitle className="text-lg">ALL-TIME DRAFT RANKINGS</CardTitle>
            <CardDescription>Teams ranked by avg value at this position.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredRankings && filteredRankings.length > 0 ? (
                filteredRankings.slice(0, 10).map((ranking, idx) => (
                  <div key={ranking.team._id} className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground">#{idx+1}</div>
                      <div>
                        <div className="font-semibold">{ranking.team.ownerDisplayName || ranking.team.name}</div>
                        <div className="text-sm text-muted-foreground">{ranking.totalSeasons ?? '-'} seasons</div>
                      </div>
                    </div>
                    <Badge variant="secondary" className={`text-white ${
                      idx === 0 ? 'bg-green-600' : // #1 - dark green
                      idx === 1 ? 'bg-green-500' : // #2 - medium green
                      idx === 2 ? 'bg-green-400' : // #3 - light green
                      idx === 3 ? 'bg-yellow-400' : // #4 - yellow
                      idx === 4 ? 'bg-yellow-300' : // #5 - light yellow
                      idx === 5 ? 'bg-orange-400' : // #6 - orange
                      idx === 6 ? 'bg-orange-500' : // #7 - dark orange
                      idx === 7 ? 'bg-pink-400' : // #8 - pink
                      idx === 8 ? 'bg-red-400' : // #9 - light red
                      'bg-red-500' // #10+ - red
                    }`}>{ranking.avgValue}</Badge>
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

      {/* Pt2: Position Drilldown (moved below existing sections) */}
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {['QB','RB','WR','TE','K','DST'].map(pos => (
            <button
              key={pos}
              onClick={() => setSelectedPosition(pos)}
              className={`px-3 py-1 rounded-md border text-sm ${selectedPosition===pos ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              {pos}
            </button>
          ))}
        </div>

        {/* Position Header & Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{selectedPosition}</CardTitle>
            <CardDescription>Position drilldown across all drafts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <div className="text-sm text-muted-foreground">AVG. DRAFT VALUE</div>
                <div className="mt-1 text-3xl font-bold text-primary">{positionAverages?.avgDraftValue ?? '-'}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <div className="text-sm text-muted-foreground">AVG. DRAFT ROUND</div>
                <div className="mt-1 text-3xl font-bold text-primary">{positionAverages?.avgDraftRound ?? '-'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Position Top/Worst/Rankings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Picks by Position */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">TOP PICKS - {selectedPosition}</CardTitle>
              <CardDescription>Best value picks by position.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {positionTopPicks && positionTopPicks.length > 0 ? (
                  positionTopPicks.map((pick) => (
                    <div key={pick._id} className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{pick.player.name}</div>
                        <div className="text-sm text-muted-foreground">{pick.season.year} · #{pick.overallPick} · {pick.team.name}</div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">{pick.value}</Badge>
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
              <CardDescription>Lowest value picks by position.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {positionWorstPicks && positionWorstPicks.length > 0 ? (
                  positionWorstPicks.map((pick) => (
                    <div key={pick._id} className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{pick.player.name}</div>
                        <div className="text-sm text-muted-foreground">{pick.season.year} · #{pick.overallPick} · {pick.team.name}</div>
                      </div>
                      <Badge variant="destructive" className="bg-red-100 text-red-800">{pick.value}</Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No data</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Draft Best - Rankings by Position */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">DRAFT BEST - {selectedPosition}</CardTitle>
              <CardDescription>Teams ranked by avg value at this position.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {positionRankings && positionRankings.length > 0 ? (
                  positionRankings.map((ranking, idx) => (
                    <div key={ranking.team._id} className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground">#{idx+1}</div>
                        <div>
                          <div className="font-semibold">{ranking.team.ownerDisplayName || ranking.team.name}</div>
                          <div className="text-sm text-muted-foreground">{ranking.totalPicks} picks</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">{ranking.avgValue}</Badge>
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