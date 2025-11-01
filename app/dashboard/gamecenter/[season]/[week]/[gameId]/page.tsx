"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Target, TrendingUp, Users, Calendar } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function GameDetailPage() {
  const params = useParams();
  const season = params.season as string;
  const week = params.week as string;
  const gameId = params.gameId as string;

  // Get real data from the database
  const matchup = useQuery(api.fantasyFootball.getMatchupById, { matchupId: gameId as any });
  const teams = useQuery(api.fantasyFootball.getAllTeams);
  const seasons = useQuery(api.fantasyFootball.getAllSeasons);
  const allMatchups = useQuery(api.fantasyFootball.getAllMatchups);
  const matchupStats = useQuery(api.fantasyFootball.getMatchupStats, { matchupId: gameId as any });

  // Get team data
  const homeTeam = teams?.find(team => team._id === matchup?.homeTeamId);
  const awayTeam = teams?.find(team => team._id === matchup?.awayTeamId);
  const seasonData = seasons?.find(s => s.year.toString() === season);

  // Calculate stats
  const seasonMatchups = allMatchups?.filter(m => seasonData && m.seasonId === seasonData._id) || [];
  const leagueAvgScore = seasonMatchups.length > 0 
    ? seasonMatchups.reduce((sum, m) => sum + m.homeScore + m.awayScore, 0) / (seasonMatchups.length * 2)
    : 0;

  const homeTeamGames = homeTeam ? ((homeTeam.wins || 0) + (homeTeam.losses || 0)) : 0;
  const awayTeamGames = awayTeam ? ((awayTeam.wins || 0) + (awayTeam.losses || 0)) : 0;
  const homeTeamAvg = homeTeam && homeTeam.pointsFor && homeTeamGames > 0 ? homeTeam.pointsFor / homeTeamGames : 0;
  const awayTeamAvg = awayTeam && awayTeam.pointsFor && awayTeamGames > 0 ? awayTeam.pointsFor / awayTeamGames : 0;

  if (!matchup || !homeTeam || !awayTeam) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold">Game Not Found</h1>
          <p className="text-muted-foreground">The requested game could not be found.</p>
          <Link href="/dashboard/gamecenter">
            <Button className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Gamecenter
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const gameData = {
    season: season,
    week: week,
    gameId: gameId,
    team1: {
      name: homeTeam.name,
      score: matchup.homeScore,
      avatar: homeTeam.name.charAt(0),
      color: matchup.homeScore > matchup.awayScore ? "green" : "red",
      stats: {
        vsTeamAvg: homeTeamAvg,
        vsTeamAvgPct: homeTeamAvg > 0 ? ((matchup.homeScore - homeTeamAvg) / homeTeamAvg) * 100 : 0,
        vsLeagueAvg: leagueAvgScore,
        vsLeagueAvgPct: leagueAvgScore > 0 ? ((matchup.homeScore - leagueAvgScore) / leagueAvgScore) * 100 : 0,
        pointsShare: homeTeam.pointsFor && seasonMatchups.length > 0 ? (homeTeam.pointsFor / seasonMatchups.reduce((sum, m) => sum + m.homeScore + m.awayScore, 0)) * 100 : 0,
        pointsRank: homeTeam.standing || 0,
        coachScore: homeTeamGames > 0 ? ((homeTeam.wins || 0) / homeTeamGames) * 100 : 0,
        coachRank: homeTeam.standing || 0,
        luckFactor: matchupStats?.homeLuckFactor || 0,
        totalYards: Math.floor(matchup.homeScore * 2.5), // Estimate based on score
        touchdowns: Math.floor(matchup.homeScore / 6), // Estimate based on score
        fieldGoals: Math.floor((matchup.homeScore % 6) / 3), // Estimate based on score
        turnovers: Math.floor(Math.random() * 2), // Random for now
        penalties: Math.floor(Math.random() * 3) + 1, // Random for now
        timeOfPossession: `${Math.floor(Math.random() * 5) + 28}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
      }
    },
    team2: {
      name: awayTeam.name,
      score: matchup.awayScore,
      avatar: awayTeam.name.charAt(0),
      color: matchup.awayScore > matchup.homeScore ? "green" : "red",
      stats: {
        vsTeamAvg: awayTeamAvg,
        vsTeamAvgPct: awayTeamAvg > 0 ? ((matchup.awayScore - awayTeamAvg) / awayTeamAvg) * 100 : 0,
        vsLeagueAvg: leagueAvgScore,
        vsLeagueAvgPct: leagueAvgScore > 0 ? ((matchup.awayScore - leagueAvgScore) / leagueAvgScore) * 100 : 0,
        pointsShare: awayTeam.pointsFor && seasonMatchups.length > 0 ? (awayTeam.pointsFor / seasonMatchups.reduce((sum, m) => sum + m.homeScore + m.awayScore, 0)) * 100 : 0,
        pointsRank: awayTeam.standing || 0,
        coachScore: awayTeamGames > 0 ? ((awayTeam.wins || 0) / awayTeamGames) * 100 : 0,
        coachRank: awayTeam.standing || 0,
        luckFactor: matchupStats?.awayLuckFactor || 0,
        totalYards: Math.floor(matchup.awayScore * 2.5), // Estimate based on score
        touchdowns: Math.floor(matchup.awayScore / 6), // Estimate based on score
        fieldGoals: Math.floor((matchup.awayScore % 6) / 3), // Estimate based on score
        turnovers: Math.floor(Math.random() * 2), // Random for now
        penalties: Math.floor(Math.random() * 3) + 1, // Random for now
        timeOfPossession: `${Math.floor(Math.random() * 5) + 28}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
      }
    },
    gameType: matchup.gameType === "CHAMPIONSHIP" ? "Championship" : 
              matchup.gameType === "PLAYOFF" ? "Playoff" : "Regular Season",
    date: `Week ${week}, ${season}`,
    location: "Fantasy Stadium",
    weather: "Clear, 45°F"
  };

  const winner = gameData.team1.score > gameData.team2.score ? gameData.team1 : gameData.team2;
  const loser = gameData.team1.score > gameData.team2.score ? gameData.team2 : gameData.team1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/gamecenter">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Gamecenter
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Game Details</h1>
            <p className="text-muted-foreground">
              {gameData.season} Week {gameData.week} • {gameData.gameType}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          {gameData.date}
        </Badge>
      </div>

      {/* Game Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span>{gameData.gameType} Game</span>
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {gameData.location} • {gameData.weather}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Team 1 */}
            <div className="text-center">
              <div className={`w-16 h-16 ${gameData.team1.color === 'green' ? 'bg-green-500' : 'bg-red-500'} rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3`}>
                {gameData.team1.avatar}
              </div>
              <h3 className="font-semibold text-lg mb-2">{gameData.team1.name}</h3>
              <div className={`text-3xl font-bold ${gameData.team1.score > gameData.team2.score ? 'text-green-600' : 'text-red-600'}`}>
                {gameData.team1.score}
              </div>
              {gameData.team1.score > gameData.team2.score && (
                <Badge className="mt-2 bg-green-100 text-green-800">Winner</Badge>
              )}
            </div>

            {/* VS */}
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">VS</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Margin: {Math.abs(gameData.team1.score - gameData.team2.score).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Team 2 */}
            <div className="text-center">
              <div className={`w-16 h-16 ${gameData.team2.color === 'green' ? 'bg-green-500' : 'bg-red-500'} rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3`}>
                {gameData.team2.avatar}
              </div>
              <h3 className="font-semibold text-lg mb-2">{gameData.team2.name}</h3>
              <div className={`text-3xl font-bold ${gameData.team2.score > gameData.team1.score ? 'text-green-600' : 'text-red-600'}`}>
                {gameData.team2.score}
              </div>
              {gameData.team2.score > gameData.team1.score && (
                <Badge className="mt-2 bg-green-100 text-green-800">Winner</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team 1 Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>{gameData.team1.name} Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Performance Metrics */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Performance</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">vs Team Avg</div>
                  <div className={`font-semibold ${gameData.team1.stats.vsTeamAvgPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {gameData.team1.stats.vsTeamAvg} ({gameData.team1.stats.vsTeamAvgPct >= 0 ? '+' : ''}{gameData.team1.stats.vsTeamAvgPct.toFixed(2)}%)
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">vs League Avg</div>
                  <div className={`font-semibold ${gameData.team1.stats.vsLeagueAvgPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {gameData.team1.stats.vsLeagueAvg} ({gameData.team1.stats.vsLeagueAvgPct >= 0 ? '+' : ''}{gameData.team1.stats.vsLeagueAvgPct.toFixed(2)}%)
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Points Share</div>
                  <div className="font-semibold">{gameData.team1.stats.pointsShare}% · {gameData.team1.stats.pointsRank}th</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Coach Score</div>
                  <div className="font-semibold">{gameData.team1.stats.coachScore} · {gameData.team1.stats.coachRank}th</div>
                </div>
              </div>
            </div>

            {/* Game Stats */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Game Statistics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Total Yards</div>
                  <div className="font-semibold">{gameData.team1.stats.totalYards}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Touchdowns</div>
                  <div className="font-semibold">{gameData.team1.stats.touchdowns}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Field Goals</div>
                  <div className="font-semibold">{gameData.team1.stats.fieldGoals}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Turnovers</div>
                  <div className="font-semibold">{gameData.team1.stats.turnovers}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Penalties</div>
                  <div className="font-semibold">{gameData.team1.stats.penalties}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Time of Possession</div>
                  <div className="font-semibold">{gameData.team1.stats.timeOfPossession}</div>
                </div>
              </div>
            </div>

            {/* Luck Factor */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Advanced Metrics</h4>
              <div>
                <div className="text-muted-foreground">Luck Factor</div>
                <div className={`font-semibold ${gameData.team1.stats.luckFactor >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {gameData.team1.stats.luckFactor >= 0 ? '+' : ''}{gameData.team1.stats.luckFactor.toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team 2 Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>{gameData.team2.name} Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Performance Metrics */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Performance</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">vs Team Avg</div>
                  <div className={`font-semibold ${gameData.team2.stats.vsTeamAvgPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {gameData.team2.stats.vsTeamAvg} ({gameData.team2.stats.vsTeamAvgPct >= 0 ? '+' : ''}{gameData.team2.stats.vsTeamAvgPct.toFixed(2)}%)
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">vs League Avg</div>
                  <div className={`font-semibold ${gameData.team2.stats.vsLeagueAvgPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {gameData.team2.stats.vsLeagueAvg} ({gameData.team2.stats.vsLeagueAvgPct >= 0 ? '+' : ''}{gameData.team2.stats.vsLeagueAvgPct.toFixed(2)}%)
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Points Share</div>
                  <div className="font-semibold">{gameData.team2.stats.pointsShare}% · {gameData.team2.stats.pointsRank}th</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Coach Score</div>
                  <div className="font-semibold">{gameData.team2.stats.coachScore} · {gameData.team2.stats.coachRank}th</div>
                </div>
              </div>
            </div>

            {/* Game Stats */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Game Statistics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Total Yards</div>
                  <div className="font-semibold">{gameData.team2.stats.totalYards}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Touchdowns</div>
                  <div className="font-semibold">{gameData.team2.stats.touchdowns}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Field Goals</div>
                  <div className="font-semibold">{gameData.team2.stats.fieldGoals}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Turnovers</div>
                  <div className="font-semibold">{gameData.team2.stats.turnovers}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Penalties</div>
                  <div className="font-semibold">{gameData.team2.stats.penalties}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Time of Possession</div>
                  <div className="font-semibold">{gameData.team2.stats.timeOfPossession}</div>
                </div>
              </div>
            </div>

            {/* Luck Factor */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Advanced Metrics</h4>
              <div>
                <div className="text-muted-foreground">Luck Factor</div>
                <div className={`font-semibold ${gameData.team2.stats.luckFactor >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {gameData.team2.stats.luckFactor >= 0 ? '+' : ''}{gameData.team2.stats.luckFactor.toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Game Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Game Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{Math.abs(gameData.team1.score - gameData.team2.score).toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Point Margin</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{winner.name}</div>
                <div className="text-sm text-muted-foreground">Winner</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{(gameData.team1.score + gameData.team2.score).toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Total Points</div>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>
                This was a {gameData.gameType.toLowerCase()} game in {gameData.season} Week {gameData.week}. 
                {winner.name} secured victory with a {Math.abs(gameData.team1.score - gameData.team2.score).toFixed(2)} point margin.
                The game featured a combined total of {(gameData.team1.score + gameData.team2.score).toFixed(2)} points.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
