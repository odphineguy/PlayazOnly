"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gamepad2, Clock, Trophy, Users, ArrowRight, Shield, Circle, Zap, Droplets } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function GamecenterPage() {
  const [selectedSeason, setSelectedSeason] = useState("2020");
  const [selectedWeek, setSelectedWeek] = useState("1");
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"all" | "disappointing" | "dominating" | "luckiest">("all");

  // Get all seasons and leagues
  const leagues = useQuery(api.fantasyFootball.getAllLeagues);
  const seasonsRaw = useQuery(api.fantasyFootball.getAllSeasons);
  const allMatchupsRaw = useQuery(api.fantasyFootball.getAllMatchups);
  const teamsRaw = useQuery(api.fantasyFootball.getAllTeams);

  // Deduplicate seasons by year (keep most recent)
  const seasons = (() => {
    if (!seasonsRaw) return [];

    const seasonsByYear = new Map();
    seasonsRaw.forEach(season => {
      const existing = seasonsByYear.get(season.year);
      if (!existing || season.createdAt > existing.createdAt) {
        seasonsByYear.set(season.year, season);
      }
    });

    return Array.from(seasonsByYear.values()).sort((a, b) => a.year - b.year);
  })();

  // Deduplicate teams by seasonId + name (keep most recent)
  const teams = (() => {
    if (!teamsRaw) return [];

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

  // Use processed data
  const allMatchups = allMatchupsRaw || [];

  // Get categorized matchups for the "Matchups by Category" section
  const topMatchups = useQuery(api.fantasyFootball.getTopMatchups, { limit: 5 });
  const lowestMatchups = useQuery(api.fantasyFootball.getLowestMatchups, { limit: 5 });
  const biggestBlowouts = useQuery(api.fantasyFootball.getBiggestBlowouts, { limit: 5 });
  const closestMatchups = useQuery(api.fantasyFootball.getClosestMatchups, { limit: 5 });
  const championshipMatchups = useQuery(api.fantasyFootball.getChampionshipMatchups, { limit: 5 });

  // Get the current league (assuming first one for now)
  const currentLeague = leagues?.[0];

  // Get seasons for the current league
  const leagueSeasons = seasons.filter(season =>
    currentLeague && season.leagueId === currentLeague._id
  );

  // Get current season data for queries
  const currentSeasonData = leagueSeasons.find(s => s.year.toString() === selectedSeason);

  // Get weekly categories for sidebar - ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const weeklyChamp = useQuery(
    api.fantasyFootball.getWeeklyChamp,
    currentSeasonData ? { seasonId: currentSeasonData._id, week: parseInt(selectedWeek) } : "skip"
  );
  const mostDisappointing = useQuery(
    api.fantasyFootball.getMostDisappointing,
    currentSeasonData ? { seasonId: currentSeasonData._id, week: parseInt(selectedWeek) } : "skip"
  );
  const mostDominating = useQuery(
    api.fantasyFootball.getMostDominating,
    currentSeasonData ? { seasonId: currentSeasonData._id, week: parseInt(selectedWeek) } : "skip"
  );
  const luckiest = useQuery(
    api.fantasyFootball.getLuckiest,
    currentSeasonData ? { seasonId: currentSeasonData._id, week: parseInt(selectedWeek) } : "skip"
  );

  // NOW check loading state AFTER all hooks are defined
  const isLoading = !leagues || !seasonsRaw || !teamsRaw || !allMatchupsRaw;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gamecenter</h1>
            <p className="text-muted-foreground">Live games, scores, and real-time updates</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Clock className="w-12 h-12 animate-spin text-muted-foreground" />
              <p className="text-lg text-muted-foreground">Loading game data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Auto-select first available season and week with data (only on initial load)
  useEffect(() => {
    if (!hasAutoSelected && leagueSeasons.length > 0 && allMatchups && allMatchups.length > 0) {
      // Find the first season with matchups
      const seasonWithData = leagueSeasons.find(season => {
        const seasonMatchups = allMatchups.filter(matchup => matchup.seasonId === season._id);
        return seasonMatchups.length > 0;
      });

      if (seasonWithData) {
        setSelectedSeason(seasonWithData.year.toString());

        // Find the first week with matchups for this season
        const seasonMatchups = allMatchups.filter(matchup => matchup.seasonId === seasonWithData._id);
        const weeks = [...new Set(seasonMatchups.map(m => m.week))].sort((a, b) => a - b);
        if (weeks.length > 0) {
          setSelectedWeek(weeks[0].toString());
        }
        setHasAutoSelected(true);
      }
    }
  }, [leagueSeasons, allMatchups, hasAutoSelected]);

  // Get matchups for the selected season
  const selectedSeasonData = leagueSeasons.find(s => s.year.toString() === selectedSeason);
  const seasonMatchups = allMatchups?.filter(matchup => 
    selectedSeasonData && matchup.seasonId === selectedSeasonData._id
  ) || [];

  // Get available weeks for the selected season
  const availableWeeks = [...new Set(seasonMatchups.map(m => m.week))].sort((a, b) => a - b);

  // Get current week matchups
  const currentMatchups = seasonMatchups.filter(matchup => 
    matchup.week === parseInt(selectedWeek)
  );

  // Calculate matchup score data for the chart
  const matchupScoreData = leagueSeasons.map(season => {
    const seasonMatchups = allMatchups?.filter(matchup => matchup.seasonId === season._id) || [];
    const allScores = seasonMatchups.flatMap(m => [m.homeScore, m.awayScore]);
    
    if (allScores.length === 0) {
      return {
        year: season.year.toString(),
        avgScore: 0,
        lowScore: 0,
        highScore: 0
      };
    }

    const avgScore = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
    const lowScore = Math.min(...allScores);
    const highScore = Math.max(...allScores);

    return {
      year: season.year.toString(),
      avgScore: parseFloat(avgScore.toFixed(2)),
      lowScore: parseFloat(lowScore.toFixed(2)),
      highScore: parseFloat(highScore.toFixed(2))
    };
  }).sort((a, b) => parseInt(a.year) - parseInt(b.year));

  // Helper function to get team name by ID
  const getTeamName = (teamId: string) => {
    return teams?.find(team => team._id === teamId)?.name || "Unknown Team";
  };

  // Helper function to get team by ID
  const getTeam = (teamId: string) => {
    return teams?.find(team => team._id === teamId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gamecenter</h1>
          <p className="text-muted-foreground">Live games, scores, and real-time updates</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Live
        </Badge>
      </div>

      {/* Average Matchup Score Chart */}
      <Card>
        <CardHeader>
          <CardTitle>AVERAGE MATCHUP SCORE BY SEASON</CardTitle>
          <CardDescription>League average matchup scores overtime.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={matchupScoreData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="year" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  label={{ value: 'Avg. Score', angle: -90, position: 'insideLeft' }}
                  domain={[85, 135]}
                  tickCount={11}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'highScore' ? `${value.toFixed(2)}` : `${value}`,
                    name === 'avgScore' ? 'Average Score' : 
                    name === 'lowScore' ? 'Low Score' : 'High Score'
                  ]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="avgScore" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  name="Average Score"
                />
                <Line 
                  type="monotone" 
                  dataKey="lowScore" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  name="Low Score"
                />
                <Line 
                  type="monotone" 
                  dataKey="highScore" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                  name="High Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Season Matchups */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>SEASON MATCHUPS</CardTitle>
              <CardDescription>View matchup history for each season and week.</CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">SEASON</span>
                <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {leagueSeasons.map(season => (
                      <SelectItem key={season._id} value={season.year.toString()}>
                        {season.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">WEEK</span>
                <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableWeeks.map(week => (
                      <SelectItem key={week} value={week.toString()}>
                        {week}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex">
            {/* Left Sidebar */}
            <div className="w-64 bg-muted/50 border-r p-4 space-y-2 rounded-bl-lg">
              {/* Week Matchups */}
              <button
                onClick={() => setSelectedCategory("all")}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedCategory === "all" ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Circle className={`w-4 h-4 ${selectedCategory === "all" ? "text-primary" : ""}`} />
                  <span className="text-sm font-semibold">WEEK {selectedWeek} MATCHUPS</span>
                </div>
              </button>

              {/* Most Disappointing */}
              <div className="py-2">
                <div className="text-xs text-muted-foreground mb-1 px-3">MOST DISAPPOINTING</div>
                <button
                  onClick={() => setSelectedCategory("disappointing")}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedCategory === "disappointing" ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm">
                      {mostDisappointing && 'team' in mostDisappointing && mostDisappointing.team && 'name' in mostDisappointing.team ? mostDisappointing.team.name.charAt(0) : "?"}
                    </div>
                    <span className="text-sm">{mostDisappointing && 'team' in mostDisappointing && mostDisappointing.team && 'name' in mostDisappointing.team ? mostDisappointing.team.name : "Loading..."}</span>
                  </div>
                </button>
              </div>

              {/* Most Dominating */}
              <div className="py-2">
                <div className="text-xs text-muted-foreground mb-1 px-3 flex items-center space-x-1">
                  <Zap className="w-3 h-3" />
                  <span>MOST DOMINATING</span>
                </div>
                <button
                  onClick={() => setSelectedCategory("dominating")}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedCategory === "dominating" ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm">
                      {mostDominating && 'team' in mostDominating && mostDominating.team && 'name' in mostDominating.team ? mostDominating.team.name.charAt(0) : "?"}
                    </div>
                    <span className="text-sm">{mostDominating && 'team' in mostDominating && mostDominating.team && 'name' in mostDominating.team ? mostDominating.team.name : "Loading..."}</span>
                  </div>
                </button>
              </div>

              {/* Luckiest */}
              <div className="py-2">
                <div className="text-xs text-muted-foreground mb-1 px-3">🍀 LUCKIEST</div>
                <button
                  onClick={() => setSelectedCategory("luckiest")}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedCategory === "luckiest" ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm">
                      {luckiest && 'team' in luckiest && luckiest.team && 'name' in luckiest.team ? luckiest.team.name.charAt(0) : "?"}
                    </div>
                    <span className="text-sm">{luckiest && 'team' in luckiest && luckiest.team && 'name' in luckiest.team ? luckiest.team.name : "Loading..."}</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6">
              <div className="grid grid-cols-2 gap-4">
                {currentMatchups.length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    {availableWeeks.length === 0 ?
                      `No matchups found for ${selectedSeason}` :
                      `No matchups found for ${selectedSeason} Week ${selectedWeek}. Available weeks: ${availableWeeks.join(', ')}`
                    }
                  </div>
                ) : (
                  currentMatchups.map((matchup, index) => {
                const homeTeam = getTeam(matchup.homeTeamId);
                const awayTeam = getTeam(matchup.awayTeamId);
                const homeTeamName = getTeamName(matchup.homeTeamId);
                const awayTeamName = getTeamName(matchup.awayTeamId);
                
                const isChampionship = matchup.gameType === "CHAMPIONSHIP";
                const isPlayoff = matchup.gameType === "PLAYOFF";
                const homeWon = matchup.homeScore > matchup.awayScore;
                const awayWon = matchup.awayScore > matchup.homeScore;
                
                return (
                  <Link
                    key={matchup._id}
                    href={`/dashboard/gamecenter/${selectedSeason}/${selectedWeek}/${matchup._id}`}
                    className="block"
                  >
                    <div className="rounded-lg overflow-hidden border hover:shadow-lg transition-shadow">
                      {/* Header with team names */}
                      <div className="border-b p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center font-bold text-sm">
                            {homeTeamName.charAt(0)}
                          </div>
                          <span className="font-semibold">{homeTeamName}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">vs</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{awayTeamName}</span>
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center font-bold text-sm">
                            {awayTeamName.charAt(0)}
                          </div>
                        </div>
                      </div>

                      {/* Scores */}
                      <div className="flex items-center border-b">
                        <div className={`flex-1 ${homeWon ? 'bg-green-500/10' : 'bg-red-500/10'} p-3 text-center border-r`}>
                          <span className={`text-2xl font-bold ${homeWon ? 'text-green-600' : 'text-red-600'}`}>
                            {matchup.homeScore.toFixed(2)}
                          </span>
                          <span className="text-xs ml-1">{homeWon ? '●' : '●'}</span>
                        </div>
                        <div className={`flex-1 ${awayWon ? 'bg-green-500/10' : 'bg-red-500/10'} p-3 text-center`}>
                          <span className="text-xs mr-1">{awayWon ? '●' : '●'}</span>
                          <span className={`text-2xl font-bold ${awayWon ? 'text-green-600' : 'text-red-600'}`}>
                            {matchup.awayScore.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="p-3 space-y-2 text-xs">
                        <div className="grid grid-cols-3 gap-2 items-center text-center">
                          <div className="text-left">
                            <span className={homeWon ? "text-green-600" : "text-muted-foreground"}>
                              {(() => {
                                const games = (homeTeam?.wins || 0) + (homeTeam?.losses || 0);
                                const teamAvg = games > 0 && homeTeam ? homeTeam.pointsFor / games : 0;
                                const diffPct = teamAvg > 0 ? ((matchup.homeScore - teamAvg) / teamAvg * 100) : 0;
                                return `${teamAvg.toFixed(2)} (${diffPct.toFixed(2)}%)`;
                              })()}
                            </span>
                          </div>
                          <div className="text-muted-foreground font-semibold">vs Team Avg</div>
                          <div className="text-right">
                            <span className={awayWon ? "text-green-600" : "text-muted-foreground"}>
                              {(() => {
                                const games = (awayTeam?.wins || 0) + (awayTeam?.losses || 0);
                                const teamAvg = games > 0 && awayTeam ? awayTeam.pointsFor / games : 0;
                                const diffPct = teamAvg > 0 ? ((matchup.awayScore - teamAvg) / teamAvg * 100) : 0;
                                return `${teamAvg.toFixed(2)} (${diffPct.toFixed(2)}%)`;
                              })()}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 items-center text-center">
                          <div className="text-left">
                            <span className={homeWon ? "text-green-600" : "text-muted-foreground"}>
                              {(matchupScoreData.find(d => d.year === selectedSeason)?.avgScore || 0).toFixed(2)} ({((matchup.homeScore - (matchupScoreData.find(d => d.year === selectedSeason)?.avgScore || 0)) / (matchupScoreData.find(d => d.year === selectedSeason)?.avgScore || 1) * 100).toFixed(2)}%)
                            </span>
                          </div>
                          <div className="text-muted-foreground font-semibold">vs League Avg</div>
                          <div className="text-right">
                            <span className={awayWon ? "text-green-600" : "text-muted-foreground"}>
                              {(matchupScoreData.find(d => d.year === selectedSeason)?.avgScore || 0).toFixed(2)} ({((matchup.awayScore - (matchupScoreData.find(d => d.year === selectedSeason)?.avgScore || 0)) / (matchupScoreData.find(d => d.year === selectedSeason)?.avgScore || 1) * 100).toFixed(2)}%)
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 items-center text-center">
                          <div className="text-left text-muted-foreground">
                            {(() => {
                              const totalPoints = seasonMatchups.reduce((sum, m) => sum + m.homeScore + m.awayScore, 0);
                              const pointsShare = totalPoints > 0 ? ((homeTeam?.pointsFor || 0) / totalPoints * 100) : 0;
                              return `${pointsShare.toFixed(2)}% · ${homeTeam?.standing || 'N/A'}th (Rank)`;
                            })()}
                          </div>
                          <div className="text-muted-foreground font-semibold">Points Share</div>
                          <div className="text-right text-muted-foreground">
                            {(() => {
                              const totalPoints = seasonMatchups.reduce((sum, m) => sum + m.homeScore + m.awayScore, 0);
                              const pointsShare = totalPoints > 0 ? ((awayTeam?.pointsFor || 0) / totalPoints * 100) : 0;
                              return `${pointsShare.toFixed(2)}% · ${awayTeam?.standing || 'N/A'}th (Rank)`;
                            })()}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 items-center text-center">
                          <div className="text-left text-muted-foreground">
                            {(() => {
                              const games = (homeTeam?.wins || 0) + (homeTeam?.losses || 0);
                              const winPct = games > 0 ? ((homeTeam?.wins || 0) / games * 100) : 0;
                              return `${winPct.toFixed(2)} · ${homeTeam?.standing || 'N/A'}th (Rank)`;
                            })()}
                          </div>
                          <div className="text-muted-foreground font-semibold">Coach Score</div>
                          <div className="text-right text-muted-foreground">
                            {(() => {
                              const games = (awayTeam?.wins || 0) + (awayTeam?.losses || 0);
                              const winPct = games > 0 ? ((awayTeam?.wins || 0) / games * 100) : 0;
                              return `${winPct.toFixed(2)} · ${awayTeam?.standing || 'N/A'}th (Rank)`;
                            })()}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 items-center text-center">
                          <div className="text-left">
                            {(() => {
                              const games = (homeTeam?.wins || 0) + (homeTeam?.losses || 0);
                              const teamAvg = games > 0 && homeTeam ? homeTeam.pointsFor / games : 0;
                              const luckFactor = teamAvg > 0 ? ((matchup.homeScore - teamAvg) / teamAvg * 100) : 0;
                              return (
                                <span className={luckFactor > 0 ? "text-green-600" : "text-red-600"}>
                                  {luckFactor.toFixed(2)}
                                </span>
                              );
                            })()}
                          </div>
                          <div className="text-muted-foreground font-semibold">Luck Factor</div>
                          <div className="text-right">
                            {(() => {
                              const games = (awayTeam?.wins || 0) + (awayTeam?.losses || 0);
                              const teamAvg = games > 0 && awayTeam ? awayTeam.pointsFor / games : 0;
                              const luckFactor = teamAvg > 0 ? ((matchup.awayScore - teamAvg) / teamAvg * 100) : 0;
                              return (
                                <span className={luckFactor > 0 ? "text-green-600" : "text-red-600"}>
                                  {luckFactor.toFixed(2)}
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="border-t p-3 text-center">
                        <span className="font-medium text-sm flex items-center justify-center hover:text-primary transition-colors">
                          View Matchup Details <ArrowRight className="w-4 h-4 ml-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matchups by Category */}
      <Card>
        <CardHeader>
          <CardTitle>MATCHUPS BY CATEGORY</CardTitle>
          <CardDescription>Browse matchups throughout your league history by category.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Column 1 - Top Matchups (Shootouts) */}
            <div className="space-y-4">
              {/* Individual Matchups */}
              <div className="space-y-3">
                {!topMatchups ? (
                  <div className="text-center py-4 text-gray-500">Loading...</div>
                ) : topMatchups.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No data available</div>
                ) : (
                  topMatchups.map((matchup) => {
                  const homeTeam = getTeam(matchup.homeTeamId);
                  const awayTeam = getTeam(matchup.awayTeamId);
                  const homeTeamName = getTeamName(matchup.homeTeamId);
                  const awayTeamName = getTeamName(matchup.awayTeamId);
                  const homeWon = matchup.homeScore > matchup.awayScore;
                  const awayWon = matchup.awayScore > matchup.homeScore;
                  
                  // Get season year for display
                  const season = seasons?.find(s => s._id === matchup.seasonId);
                  
                  return (
                    <Link 
                      key={matchup._id}
                      href={`/dashboard/gamecenter/${season?.year || '2024'}/${matchup.week}/${matchup._id}`}
                      className="block"
                    >
                      <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="text-xs text-gray-500 mb-1">
                          {season?.year || '2024'} Week {matchup.week} {matchup.gameType === 'CHAMPIONSHIP' ? 'CHAMPIONSHIP' : matchup.gameType === 'PLAYOFF' ? 'PLAYOFFS' : ''}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{homeTeamName}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`${homeWon ? 'text-green-600' : 'text-red-600'} font-bold`}>
                              {matchup.homeScore.toFixed(2)}
                            </span>
                            <div className={`w-2 h-2 ${homeWon ? 'bg-green-500' : 'bg-red-500'} rounded-full`}></div>
                            <span className={`${awayWon ? 'text-green-600' : 'text-red-600'} font-bold`}>
                              {matchup.awayScore.toFixed(2)}
                            </span>
                          </div>
                          <span className="text-sm font-medium">{awayTeamName}</span>
                        </div>
                      </div>
                    </Link>
                  );
                  })
                )}
              </div>

              {/* Top Matchups Card */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xl">🔥</span>
                  <h3 className="font-semibold text-gray-800">Shootouts</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  The highest scoring matchups in league history! These are the slugfests where both teams brought their A-game.
                </p>
                <Button variant="ghost" className="text-orange-600 hover:text-orange-700 p-0 h-auto">
                  More Shootouts <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>

            {/* Column 2 - Snoozers */}
            <div className="space-y-4">
              {/* Individual Matchups */}
              <div className="space-y-3">
                {lowestMatchups?.map((matchup) => {
                  const homeTeam = getTeam(matchup.homeTeamId);
                  const awayTeam = getTeam(matchup.awayTeamId);
                  const homeTeamName = getTeamName(matchup.homeTeamId);
                  const awayTeamName = getTeamName(matchup.awayTeamId);
                  const homeWon = matchup.homeScore > matchup.awayScore;
                  const awayWon = matchup.awayScore > matchup.homeScore;
                  
                  // Get season year for display
                  const season = seasons?.find(s => s._id === matchup.seasonId);
                  
                  return (
                    <Link 
                      key={matchup._id}
                      href={`/dashboard/gamecenter/${season?.year || '2024'}/${matchup.week}/${matchup._id}`}
                      className="block"
                    >
                      <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="text-xs text-gray-500 mb-1">
                          {season?.year || '2024'} Week {matchup.week} {matchup.gameType === 'CHAMPIONSHIP' ? 'CHAMPIONSHIP' : matchup.gameType === 'PLAYOFF' ? 'PLAYOFFS' : ''}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{homeTeamName}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`${homeWon ? 'text-green-600' : 'text-red-600'} font-bold`}>
                              {matchup.homeScore.toFixed(2)}
                            </span>
                            <div className={`w-2 h-2 ${homeWon ? 'bg-green-500' : 'bg-red-500'} rounded-full`}></div>
                            <span className={`${awayWon ? 'text-green-600' : 'text-red-600'} font-bold`}>
                              {matchup.awayScore.toFixed(2)}
                            </span>
                          </div>
                          <span className="text-sm font-medium">{awayTeamName}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Snoozers Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xl">😴</span>
                  <h3 className="font-semibold text-gray-800">Snoozers</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  The lowest scoring matchups in league history. These games were... well, let's just say they weren't the most exciting.
                </p>
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 p-0 h-auto">
                  More Snoozers <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>

            {/* Column 3 - Blowouts & Nailbiters */}
            <div className="space-y-4">
              {/* Blowouts */}
              <div className="space-y-3">
                {biggestBlowouts?.slice(0, 2).map((matchup) => {
                  const homeTeam = getTeam(matchup.homeTeamId);
                  const awayTeam = getTeam(matchup.awayTeamId);
                  const homeTeamName = getTeamName(matchup.homeTeamId);
                  const awayTeamName = getTeamName(matchup.awayTeamId);
                  const homeWon = matchup.homeScore > matchup.awayScore;
                  const awayWon = matchup.awayScore > matchup.homeScore;
                  
                  // Get season year for display
                  const season = seasons?.find(s => s._id === matchup.seasonId);
                  
                  return (
                    <Link 
                      key={matchup._id}
                      href={`/dashboard/gamecenter/${season?.year || '2024'}/${matchup.week}/${matchup._id}`}
                      className="block"
                    >
                      <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="text-xs text-gray-500 mb-1">
                          {season?.year || '2024'} Week {matchup.week} {matchup.gameType === 'CHAMPIONSHIP' ? 'CHAMPIONSHIP' : matchup.gameType === 'PLAYOFF' ? 'PLAYOFFS' : ''}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{homeTeamName}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`${homeWon ? 'text-green-600' : 'text-red-600'} font-bold`}>
                              {matchup.homeScore.toFixed(2)}
                            </span>
                            <div className={`w-2 h-2 ${homeWon ? 'bg-green-500' : 'bg-red-500'} rounded-full`}></div>
                            <span className={`${awayWon ? 'text-green-600' : 'text-red-600'} font-bold`}>
                              {matchup.awayScore.toFixed(2)}
                            </span>
                          </div>
                          <span className="text-sm font-medium">{awayTeamName}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Blowouts Card */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xl">💨</span>
                  <h3 className="font-semibold text-gray-800">Blowouts</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  The biggest margins of victory in league history. Hope you were on the winning side!
                </p>
                <Button variant="ghost" className="text-purple-600 hover:text-purple-700 p-0 h-auto">
                  More Blowouts <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {/* Nailbiters */}
              <div className="space-y-3">
                {closestMatchups?.slice(0, 2).map((matchup) => {
                  const homeTeam = getTeam(matchup.homeTeamId);
                  const awayTeam = getTeam(matchup.awayTeamId);
                  const homeTeamName = getTeamName(matchup.homeTeamId);
                  const awayTeamName = getTeamName(matchup.awayTeamId);
                  const homeWon = matchup.homeScore > matchup.awayScore;
                  const awayWon = matchup.awayScore > matchup.homeScore;
                  
                  // Get season year for display
                  const season = seasons?.find(s => s._id === matchup.seasonId);
                  
                  return (
                    <Link 
                      key={matchup._id}
                      href={`/dashboard/gamecenter/${season?.year || '2024'}/${matchup.week}/${matchup._id}`}
                      className="block"
                    >
                      <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="text-xs text-gray-500 mb-1">
                          {season?.year || '2024'} Week {matchup.week} {matchup.gameType === 'CHAMPIONSHIP' ? 'CHAMPIONSHIP' : matchup.gameType === 'PLAYOFF' ? 'PLAYOFFS' : ''}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{homeTeamName}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`${homeWon ? 'text-green-600' : 'text-red-600'} font-bold`}>
                              {matchup.homeScore.toFixed(2)}
                            </span>
                            <div className={`w-2 h-2 ${homeWon ? 'bg-green-500' : 'bg-red-500'} rounded-full`}></div>
                            <span className={`${awayWon ? 'text-green-600' : 'text-red-600'} font-bold`}>
                              {matchup.awayScore.toFixed(2)}
                            </span>
                          </div>
                          <span className="text-sm font-medium">{awayTeamName}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Nailbiters Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xl">😬</span>
                  <h3 className="font-semibold text-gray-800">Nailbiters</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  The closest matchups in league history. These games came down to the wire!
                </p>
                <Button variant="ghost" className="text-green-600 hover:text-green-700 p-0 h-auto">
                  More Nailbiters <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>

            {/* Column 4 - Championships */}
            <div className="space-y-4">
              {/* Championship Matchups */}
              <div className="space-y-3">
                {championshipMatchups?.map((matchup) => {
                  const homeTeam = getTeam(matchup.homeTeamId);
                  const awayTeam = getTeam(matchup.awayTeamId);
                  const homeTeamName = getTeamName(matchup.homeTeamId);
                  const awayTeamName = getTeamName(matchup.awayTeamId);
                  const homeWon = matchup.homeScore > matchup.awayScore;
                  const awayWon = matchup.awayScore > matchup.homeScore;
                  
                  // Get season year for display
                  const season = seasons?.find(s => s._id === matchup.seasonId);
                  
                  return (
                    <Link 
                      key={matchup._id}
                      href={`/dashboard/gamecenter/${season?.year || '2024'}/${matchup.week}/${matchup._id}`}
                      className="block"
                    >
                      <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="text-xs text-gray-500 mb-1">
                          {season?.year || '2024'} Week {matchup.week} CHAMPIONSHIP
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{homeTeamName}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`${homeWon ? 'text-green-600' : 'text-red-600'} font-bold`}>
                              {matchup.homeScore.toFixed(2)}
                            </span>
                            <div className={`w-2 h-2 ${homeWon ? 'bg-green-500' : 'bg-red-500'} rounded-full`}></div>
                            <span className={`${awayWon ? 'text-green-600' : 'text-red-600'} font-bold`}>
                              {matchup.awayScore.toFixed(2)}
                            </span>
                          </div>
                          <span className="text-sm font-medium">{awayTeamName}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Championships Card */}
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xl">🏆</span>
                  <h3 className="font-semibold text-gray-800">Championships</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Where all the glory goes - the Championship matchups from your league history. These are the games that matter most!
                </p>
                <Button variant="ghost" className="text-yellow-600 hover:text-yellow-700 p-0 h-auto">
                  More Championships <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
