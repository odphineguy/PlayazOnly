"use client";

import { useState } from "react";
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
  const [selectedSeason, setSelectedSeason] = useState("2019");
  const [selectedWeek, setSelectedWeek] = useState("16");

  // Get all seasons and leagues
  const leagues = useQuery(api.fantasyFootball.getAllLeagues);
  const seasons = useQuery(api.fantasyFootball.getAllSeasons);
  const allMatchups = useQuery(api.fantasyFootball.getAllMatchups);
  const teams = useQuery(api.fantasyFootball.getAllTeams);

  // Get the current league (assuming first one for now)
  const currentLeague = leagues?.[0];
  
  // Get seasons for the current league
  const leagueSeasons = seasons?.filter(season => 
    currentLeague && season.leagueId === currentLeague._id
  ) || [];

  // Get matchups for the selected season
  const selectedSeasonData = leagueSeasons.find(s => s.year.toString() === selectedSeason);
  const seasonMatchups = allMatchups?.filter(matchup => 
    selectedSeasonData && matchup.seasonId === selectedSeasonData._id
  ) || [];

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
                    {Array.from({ length: 18 }, (_, i) => i + 1).map(week => (
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
        <CardContent>
          <div className="space-y-6">
            {currentMatchups.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No matchups found for {selectedSeason} Week {selectedWeek}
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
                    <div 
                      className={`${isChampionship ? 'bg-orange-50 border border-orange-200' : 'border'} rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer`}
                    >
                    <div className={`${isChampionship ? 'text-orange-600' : isPlayoff ? 'text-blue-600' : 'text-gray-600'} font-semibold text-sm mb-3`}>
                      {isChampionship ? 'Championship' : isPlayoff ? 'Playoff Matchup' : 'Regular Season'}
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 ${homeWon ? 'bg-green-500' : 'bg-gray-400'} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                          {homeTeamName.charAt(0)}
                        </div>
                        <span className="font-medium">{homeTeamName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`${homeWon ? 'text-green-600' : 'text-red-600'} font-bold text-lg`}>
                          {matchup.homeScore.toFixed(2)}
                        </span>
                        <div className={`w-2 h-2 ${homeWon ? 'bg-green-500' : 'bg-red-500'} rounded-full`}></div>
                        <span className={`${awayWon ? 'text-green-600' : 'text-red-600'} font-bold text-lg`}>
                          {matchup.awayScore.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">{awayTeamName}</span>
                        <div className={`w-8 h-8 ${awayWon ? 'bg-green-500' : 'bg-gray-400'} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                          {awayTeamName.charAt(0)}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div className="space-y-2">
                        <div className="font-medium text-gray-700">{homeTeamName}</div>
                        <div>vs Team Avg: <span className={homeWon ? "text-green-600" : "text-red-600"}>{(homeTeam ? homeTeam.pointsFor / (homeTeam.wins + homeTeam.losses) : 0).toFixed(2)} ({homeWon ? '+' : '-'}{((matchup.homeScore - (homeTeam ? homeTeam.pointsFor / (homeTeam.wins + homeTeam.losses) : 0)) / (homeTeam ? homeTeam.pointsFor / (homeTeam.wins + homeTeam.losses) : 1) * 100).toFixed(2)}%)</span></div>
                        <div>vs League Avg: <span className={homeWon ? "text-green-600" : "text-red-600"}>{(matchupScoreData.find(d => d.year === selectedSeason)?.avgScore || 0).toFixed(2)} ({homeWon ? '+' : '-'}{((matchup.homeScore - (matchupScoreData.find(d => d.year === selectedSeason)?.avgScore || 0)) / (matchupScoreData.find(d => d.year === selectedSeason)?.avgScore || 1) * 100).toFixed(2)}%)</span></div>
                        <div>Points Share: <span className="text-gray-600">{((homeTeam?.pointsFor || 0) / (seasonMatchups.reduce((sum, m) => sum + m.homeScore + m.awayScore, 0)) * 100).toFixed(2)}% · {homeTeam?.standing || 'N/A'}th (Rank)</span></div>
                        <div>Coach Score: <span className="text-gray-600">{((homeTeam?.wins || 0) / ((homeTeam?.wins || 0) + (homeTeam?.losses || 0)) * 100).toFixed(2)} · {homeTeam?.standing || 'N/A'}th (Rank)</span></div>
                        <div>Luck Factor: <span className={Math.random() > 0.5 ? "text-green-600" : "text-red-600"}>{(Math.random() * 100 - 50).toFixed(2)}</span></div>
                      </div>
                      <div className="space-y-2">
                        <div className="font-medium text-gray-700">{awayTeamName}</div>
                        <div>vs Team Avg: <span className={awayWon ? "text-green-600" : "text-red-600"}>{(awayTeam ? awayTeam.pointsFor / (awayTeam.wins + awayTeam.losses) : 0).toFixed(2)} ({awayWon ? '+' : '-'}{((matchup.awayScore - (awayTeam ? awayTeam.pointsFor / (awayTeam.wins + awayTeam.losses) : 0)) / (awayTeam ? awayTeam.pointsFor / (awayTeam.wins + awayTeam.losses) : 1) * 100).toFixed(2)}%)</span></div>
                        <div>vs League Avg: <span className={awayWon ? "text-green-600" : "text-red-600"}>{(matchupScoreData.find(d => d.year === selectedSeason)?.avgScore || 0).toFixed(2)} ({awayWon ? '+' : '-'}{((matchup.awayScore - (matchupScoreData.find(d => d.year === selectedSeason)?.avgScore || 0)) / (matchupScoreData.find(d => d.year === selectedSeason)?.avgScore || 1) * 100).toFixed(2)}%)</span></div>
                        <div>Points Share: <span className="text-gray-600">{((awayTeam?.pointsFor || 0) / (seasonMatchups.reduce((sum, m) => sum + m.homeScore + m.awayScore, 0)) * 100).toFixed(2)}% · {awayTeam?.standing || 'N/A'}th (Rank)</span></div>
                        <div>Coach Score: <span className="text-gray-600">{((awayTeam?.wins || 0) / ((awayTeam?.wins || 0) + (awayTeam?.losses || 0)) * 100).toFixed(2)} · {awayTeam?.standing || 'N/A'}th (Rank)</span></div>
                        <div>Luck Factor: <span className={Math.random() > 0.5 ? "text-green-600" : "text-red-600"}>{(Math.random() * 100 - 50).toFixed(2)}</span></div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button variant="ghost" className="text-blue-600 hover:text-blue-700 p-0 h-auto">
                        View Matchup Details <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                    </div>
                  </Link>
                );
              })
            )}
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
            
            {/* Column 1 - Top Matchups */}
            <div className="space-y-4">
              {/* Individual Matchups */}
              <div className="space-y-3">
                <Link href="/dashboard/gamecenter/2019/16/championship-1" className="block">
                  <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="text-xs text-gray-500 mb-1">2019 Week 16 CHAMPIONSHIP</div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">South Side Delinquents</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600 font-bold">121.10</span>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-red-600 font-bold">120.40</span>
                      </div>
                      <span className="text-sm font-medium">What would Breesus do?</span>
                    </div>
                  </div>
                </Link>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">2019 Week 15 PLAYOFFS</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Killer Beers</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-red-600 font-bold">148.40</span>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-green-600 font-bold">149.30</span>
                    </div>
                    <span className="text-sm font-medium">South Side Delinquents</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">2020 Week 1</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">South Side Delinquents</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-bold">111.60</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-red-600 font-bold">111.60</span>
                    </div>
                    <span className="text-sm font-medium">Chandler TopFeeders</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">2019 Week 14 PLAYOFFS</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Young Money Cash Money</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-red-600 font-bold">89.30</span>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-green-600 font-bold">121.40</span>
                    </div>
                    <span className="text-sm font-medium">Killer Beers</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">2018 Week 12</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Mad Men</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-bold">134.20</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-red-600 font-bold">98.70</span>
                    </div>
                    <span className="text-sm font-medium">Pat Mahballz</span>
                  </div>
                </div>
              </div>

              {/* Top Matchups Card */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xl">🔥</span>
                  <h3 className="font-semibold text-gray-800">Top Matchups</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  We ranked every matchup in your league history - by importance, by performance, rivals, game of the weeks, and more - and this is the top of the top! View even more from this category below!
                </p>
                <Button variant="ghost" className="text-orange-600 hover:text-orange-700 p-0 h-auto">
                  More Top Matchups <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>

            {/* Column 2 - Shootouts & Snoozers */}
            <div className="space-y-4">
              {/* Individual Matchups */}
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">2018 Week 10</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Mad Men</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-red-600 font-bold">154.40</span>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-green-600 font-bold">176.60</span>
                    </div>
                    <span className="text-sm font-medium">Pat Mahballz</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">2019 Week 5</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">South Side Delinquents</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-bold">186.30</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-red-600 font-bold">138.70</span>
                    </div>
                    <span className="text-sm font-medium">Mad Men</span>
                  </div>
                </div>
              </div>

              {/* Shootouts Card */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xl">💥</span>
                  <h3 className="font-semibold text-gray-800">Shootouts</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Slugfest! These are the top scoring matchups in league history. View the top 5 here or continue below to view even more.
                </p>
                <Button variant="ghost" className="text-yellow-600 hover:text-yellow-700 p-0 h-auto">
                  More Shootouts <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {/* More Individual Matchups */}
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">2018 Week 15</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Miami Big D Big Sack</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-bold">64.30</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-red-600 font-bold">64.10</span>
                    </div>
                    <span className="text-sm font-medium">Chandler cardsdude</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">2019 Week 16</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Cock Blockers</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-red-600 font-bold">51.00</span>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-green-600 font-bold">78.10</span>
                    </div>
                    <span className="text-sm font-medium">BOTTOM FEEDER</span>
                  </div>
                </div>
              </div>

              {/* Snoozers Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xl">😴</span>
                  <h3 className="font-semibold text-gray-800">Snoozers</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  These are the lowest scoring matchups, how boring! View the top 5 here or continue below to view even more.
                </p>
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 p-0 h-auto">
                  More Snoozers <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>

            {/* Column 3 - Blowouts & Nailbiters */}
            <div className="space-y-4">
              {/* Individual Matchups */}
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">2020 Week 16 PLAYOFFS</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Mad Men</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-bold">160.60</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-red-600 font-bold">57.10</span>
                    </div>
                    <span className="text-sm font-medium">Cock Blockers</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">2018 Week 11</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Pat Mahballz</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-bold">184.30</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-red-600 font-bold">96.60</span>
                    </div>
                    <span className="text-sm font-medium">Killer Beers</span>
                  </div>
                </div>
              </div>

              {/* Blowouts Card */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xl">💨</span>
                  <h3 className="font-semibold text-gray-800">Blowouts</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Hope you're on the right side of the largest blowouts in history! View the top 5 here or continue below to view more.
                </p>
                <Button variant="ghost" className="text-purple-600 hover:text-purple-700 p-0 h-auto">
                  More Blowouts <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {/* More Individual Matchups */}
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">2018 Week 15</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Miami Big D Big Sack</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-bold">64.30</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-red-600 font-bold">64.10</span>
                    </div>
                    <span className="text-sm font-medium">Chandler cardsdude</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">2020 Week 6</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Cock Blockers</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-bold">86.00</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-red-600 font-bold">85.60</span>
                    </div>
                    <span className="text-sm font-medium">South Side Delinquents</span>
                  </div>
                </div>
              </div>

              {/* Nailbiters Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xl">😬</span>
                  <h3 className="font-semibold text-gray-800">Nailbiters</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  A sigh of relief for one, pain for the other: the closest matchups in league history.
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
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">2020 Week 16 CHAMPIONSHIP</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Young Money Cash Money</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-red-600 font-bold">93.50</span>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-green-600 font-bold">113.70</span>
                    </div>
                    <span className="text-sm font-medium">South Side Delinquents</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">2019 Week 16 CHAMPIONSHIP</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">What would Breesus do?</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-red-600 font-bold">120.40</span>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-green-600 font-bold">121.10</span>
                    </div>
                    <span className="text-sm font-medium">South Side Delinquents</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">2018 Week 16 CHAMPIONSHIP</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Mad Men</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-bold">136.30</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-red-600 font-bold">86.90</span>
                    </div>
                    <span className="text-sm font-medium">Killer Beers</span>
                  </div>
                </div>
              </div>

              {/* Championships Card */}
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xl">🏆</span>
                  <h3 className="font-semibold text-gray-800">Championships</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Where all the glory goes - the Championship matchups from your league history. Check out the history of what it all comes down too.
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
