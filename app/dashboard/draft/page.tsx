"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
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
import { Target, Users, TrendingUp, Calendar, Zap, Award, FileText, AlertCircle } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function DraftPage() {
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Get all seasons and leagues
  const leagues = useQuery(api.fantasyFootball.getAllLeagues);
  const seasonsRaw = useQuery(api.fantasyFootball.getAllSeasons);
  const teamsRaw = useQuery(api.fantasyFootball.getAllTeams);

  // Deduplicate seasons by year (keep most recent)
  const seasons = (() => {
    if (!seasonsRaw) return null;
    const seasonsByYear = new Map();
    seasonsRaw.forEach(season => {
      const existing = seasonsByYear.get(season.year);
      if (!existing || season.createdAt > existing.createdAt) {
        seasonsByYear.set(season.year, season);
      }
    });
    return Array.from(seasonsByYear.values()).sort((a, b) => b.year - a.year);
  })();

  // Deduplicate teams by seasonId + name (keep most recent)
  const teams = (() => {
    if (!teamsRaw) return null;
    const teamsBySeasonAndName = new Map();
    teamsRaw.forEach(team => {
      const key = `${team.seasonId}-${team.name}`;
      const existing = teamsBySeasonAndName.get(key);
      if (!existing || team.createdAt > existing.createdAt) {
        teamsBySeasonAndName.set(key, team);
      }
    });
    return Array.from(teamsBySeasonAndName.values());
  })();

  // Get draft picks for selected season
  const draftPicks = useQuery(
    api.fantasyFootball.getDraftPicksBySeason,
    selectedSeason ? { seasonId: selectedSeason as any } : "skip"
  );

  // Auto-select first available season
  useEffect(() => {
    if (seasons && seasons.length > 0 && !selectedSeason) {
      setSelectedSeason(seasons[0]._id);
      setIsDataLoaded(true);
    }
  }, [seasons, selectedSeason]);

  // Get current league (assuming first one for now)
  const currentLeague = leagues?.[0];

  // Get seasons for the current league
  const leagueSeasons = seasons?.filter(season =>
    currentLeague && season.leagueId === currentLeague._id
  ) || [];

  // Check if there's any draft data available
  const hasDraftData = draftPicks && draftPicks.length > 0;

  // Calculate position distribution from real draft data
  const positionDistribution = (() => {
    if (!hasDraftData || !draftPicks) return [];
    
    const positionCounts = new Map();
    draftPicks.forEach(pick => {
      // We'll need to get player data to determine position
      // For now, return empty array since we don't have position data
    });
    
    return [];
  })();

  // Calculate team draft grades from real data
  const teamDraftGrades = (() => {
    if (!hasDraftData || !draftPicks || !teams) return [];
    
    // Group picks by team
    const teamPicks = new Map();
    draftPicks.forEach(pick => {
      if (!teamPicks.has(pick.teamId)) {
        teamPicks.set(pick.teamId, []);
      }
      teamPicks.get(pick.teamId).push(pick);
    });
    
    // Calculate grades for each team
    const grades = [];
    teamPicks.forEach((picks, teamId) => {
      const team = teams.find(t => t._id === teamId);
      if (team) {
        grades.push({
          team: team.name,
          grade: "N/A", // No real grading system available
          picks: picks.length,
          avgValue: "N/A",
          bestPick: "N/A"
        });
      }
    });
    
    return grades;
  })();

  // Calculate draft trends from real data
  const draftTrends = (() => {
    if (!hasDraftData || !draftPicks) return [];
    
    // Group picks by round
    const roundData = new Map();
    draftPicks.forEach(pick => {
      if (!roundData.has(pick.round)) {
        roundData.set(pick.round, []);
      }
      roundData.get(pick.round).push(pick);
    });
    
    // Calculate trends for each round
    const trends = [];
    roundData.forEach((picks, round) => {
      trends.push({
        round,
        avgPoints: "N/A", // No points data available
        qbCount: "N/A",
        rbCount: "N/A", 
        wrCount: "N/A"
      });
    });
    
    return trends.sort((a, b) => a.round - b.round);
  })();

  // Calculate positional value from real data
  const positionalValue = (() => {
    if (!hasDraftData || !draftPicks) return [];
    
    // Group picks by position (would need player data)
    // For now, return empty array since we don't have position data
    return [];
  })();

  // Show loading state
  if (!isDataLoaded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">The Draft</h1>
            <p className="text-muted-foreground">Loading draft data...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show no data available if no draft data
  if (!hasDraftData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">The Draft</h1>
            <p className="text-muted-foreground">Draft Analysis and Results</p>
          </div>
          <Badge variant="outline">No Data Available</Badge>
        </div>

        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">No Draft Data Available</h3>
              <p className="text-muted-foreground">
                Draft data is not available for the selected season. This could be because:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• The season doesn't have draft information</li>
                <li>• Draft data hasn't been imported yet</li>
                <li>• The league doesn't track draft picks</li>
              </ul>
            </div>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Data
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">The Draft</h1>
          <p className="text-muted-foreground">
            {leagueSeasons.find(s => s._id === selectedSeason)?.year || 'Unknown'} Draft Analysis and Results
          </p>
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
            <div className="text-2xl font-bold">{draftPicks?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {draftPicks?.length ? 'Draft picks available' : 'No picks available'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Pick</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N/A</div>
            <p className="text-xs text-muted-foreground">No player data available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N/A</div>
            <p className="text-xs text-muted-foreground">No grading data available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Points</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N/A</div>
            <p className="text-xs text-muted-foreground">No points data available</p>
          </CardContent>
        </Card>
      </div>

      {/* Draft Results */}
      <Card>
        <CardHeader>
          <CardTitle>Draft Results</CardTitle>
          <CardDescription>
            {draftPicks?.length ? `${draftPicks.length} draft picks available` : 'No draft picks available'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {draftPicks?.length ? (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {draftPicks.map((pick, index) => (
                  <div key={pick._id || index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {pick.overallPick}
                      </div>
                      <div>
                        <div className="font-medium">Player {pick.overallPick}</div>
                        <div className="text-sm text-muted-foreground">
                          Round {pick.round}, Pick {pick.pick}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">N/A</Badge>
                      <div className="text-right">
                        <div className="text-sm font-medium">N/A</div>
                        <div className="text-xs text-muted-foreground">No data</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center h-32">
              <div className="text-center space-y-2">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">No draft picks available</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Draft Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Position Distribution</CardTitle>
            <CardDescription>Positional breakdown of draft picks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-2">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">No position data available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Draft Trends by Round</CardTitle>
            <CardDescription>Draft trends and statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-2">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">No trend data available</p>
              </div>
            </div>
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
          {teamDraftGrades.length > 0 ? (
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
                          {team.picks} picks • {team.avgValue} avg value
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
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
          ) : (
            <div className="flex items-center justify-center h-32">
              <div className="text-center space-y-2">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">No team draft data available</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Positional Value Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Positional Value Analysis</CardTitle>
          <CardDescription>Average points and draft position by position</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">No positional value data available</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Draft Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Draft Insights</CardTitle>
          <CardDescription>Key takeaways from the draft</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">No draft insights available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
