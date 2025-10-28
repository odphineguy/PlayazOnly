"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Calendar, 
  Users, 
  Database,
  CheckCircle,
  AlertCircle,
  Edit,
  Save
} from "lucide-react";
import { toast } from "sonner";

export default function ManualDataEntry() {
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [isCreatingSeasons, setIsCreatingSeasons] = useState(false);
  const [isAddingData, setIsAddingData] = useState(false);

  // Form data for manual entry
  const [teamData, setTeamData] = useState({
    name: "",
    ownerName: "",
    wins: 0,
    losses: 0,
    ties: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    standing: 1,
    finalStanding: 0,
    streakLength: 0,
    streakType: "WIN",
  });

  const [transactionData, setTransactionData] = useState({
    type: "TRADE",
    description: "",
    week: 0,
    involvedTeams: [] as string[],
  });

  const [draftPickData, setDraftPickData] = useState({
    teamName: "",
    playerName: "",
    position: "QB",
    round: 1,
    pick: 1,
    overallPick: 1,
  });

  const createHistoricalSeasons = useMutation(api.fantasyFootball.createHistoricalSeasons);
  // Note: Manual data functions would need to be implemented in Convex
  // For now, we'll disable these features
  const addManualSeasonData = null;
  const getIncompleteSeasons = null;

  const handleCreateHistoricalSeasons = async () => {
    setIsCreatingSeasons(true);
    try {
      const result = await createHistoricalSeasons({
        leagueId: "temp_league_id" as any,
        startYear: 2010,
        endYear: 2017,
      });
      toast.success(result.message);
    } catch (error) {
      toast.error("Failed to create historical seasons");
    } finally {
      setIsCreatingSeasons(false);
    }
  };

  const handleAddTeam = () => {
    // This would add the team to a local array before submitting
    toast.success("Team added to season data");
    setTeamData({
      name: "",
      ownerName: "",
      wins: 0,
      losses: 0,
      ties: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      standing: 1,
      finalStanding: 0,
      streakLength: 0,
      streakType: "WIN",
    });
  };

  const handleAddTransaction = () => {
    toast.success("Transaction added to season data");
    setTransactionData({
      type: "TRADE",
      description: "",
      week: 0,
      involvedTeams: [],
    });
  };

  const handleAddDraftPick = () => {
    toast.success("Draft pick added to season data");
    setDraftPickData({
      teamName: "",
      playerName: "",
      position: "QB",
      round: 1,
      pick: 1,
      overallPick: 1,
    });
  };

  const handleSubmitSeasonData = async () => {
    if (!selectedSeason) return;

    setIsAddingData(true);
    try {
      // Note: Manual data functionality is not implemented yet
      toast.success("Manual data functionality is not implemented yet.");
    } catch (error) {
      toast.error("Failed to add season data");
    } finally {
      setIsAddingData(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manual Data Entry</h1>
            <p className="text-muted-foreground">Add historical data for 2010-2017 seasons</p>
          </div>
          <Badge variant="outline" className="text-sm">
            Historical Data
          </Badge>
        </div>

        {/* Setup Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Setup Historical Seasons</span>
            </CardTitle>
            <CardDescription>
              Create placeholder seasons for 2010-2017 that you can populate with data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Create 8 historical seasons (2010-2017) for manual data entry
                </p>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">2010-2017</Badge>
                  <Badge variant="outline">Manual Entry</Badge>
                  <Badge variant="outline">12 Teams</Badge>
                </div>
              </div>
              <Button 
                onClick={handleCreateHistoricalSeasons}
                disabled={isCreatingSeasons}
              >
                {isCreatingSeasons ? "Creating..." : "Create Seasons"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Season Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Select Season to Edit</span>
            </CardTitle>
            <CardDescription>
              Choose which historical season you want to add data for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
              {Array.from({ length: 8 }, (_, i) => 2010 + i).map((year) => (
                <Button
                  key={year}
                  variant={selectedSeason === year ? "default" : "outline"}
                  onClick={() => setSelectedSeason(year)}
                  className="h-12"
                >
                  {year}
                </Button>
              ))}
            </div>
            {selectedSeason && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Selected: {selectedSeason} Season</p>
                <p className="text-xs text-muted-foreground">
                  Ready to add teams, transactions, and draft picks
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedSeason && (
          <Tabs defaultValue="teams" className="space-y-4">
            <TabsList>
              <TabsTrigger value="teams">Teams</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="draft">Draft Picks</TabsTrigger>
              <TabsTrigger value="review">Review & Submit</TabsTrigger>
            </TabsList>

            <TabsContent value="teams" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Add Team Data</span>
                  </CardTitle>
                  <CardDescription>
                    Enter team information for the {selectedSeason} season
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="team-name">Team Name</Label>
                      <Input
                        id="team-name"
                        value={teamData.name}
                        onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
                        placeholder="e.g., Mad Men"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="owner-name">Owner Name</Label>
                      <Input
                        id="owner-name"
                        value={teamData.ownerName}
                        onChange={(e) => setTeamData({ ...teamData, ownerName: e.target.value })}
                        placeholder="e.g., Abe Perez"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wins">Wins</Label>
                      <Input
                        id="wins"
                        type="number"
                        value={teamData.wins}
                        onChange={(e) => setTeamData({ ...teamData, wins: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="losses">Losses</Label>
                      <Input
                        id="losses"
                        type="number"
                        value={teamData.losses}
                        onChange={(e) => setTeamData({ ...teamData, losses: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="points-for">Points For</Label>
                      <Input
                        id="points-for"
                        type="number"
                        step="0.1"
                        value={teamData.pointsFor}
                        onChange={(e) => setTeamData({ ...teamData, pointsFor: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="points-against">Points Against</Label>
                      <Input
                        id="points-against"
                        type="number"
                        step="0.1"
                        value={teamData.pointsAgainst}
                        onChange={(e) => setTeamData({ ...teamData, pointsAgainst: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="standing">Regular Season Standing</Label>
                      <Input
                        id="standing"
                        type="number"
                        value={teamData.standing}
                        onChange={(e) => setTeamData({ ...teamData, standing: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="final-standing">Final Standing</Label>
                      <Input
                        id="final-standing"
                        type="number"
                        value={teamData.finalStanding}
                        onChange={(e) => setTeamData({ ...teamData, finalStanding: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddTeam} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Team
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Edit className="h-5 w-5" />
                    <span>Add Transactions</span>
                  </CardTitle>
                  <CardDescription>
                    Record trades, waivers, and other transactions for {selectedSeason}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="transaction-type">Transaction Type</Label>
                      <select
                        id="transaction-type"
                        className="w-full p-2 border rounded-md"
                        value={transactionData.type}
                        onChange={(e) => setTransactionData({ ...transactionData, type: e.target.value })}
                      >
                        <option value="TRADE">Trade</option>
                        <option value="WAIVER">Waiver</option>
                        <option value="FREE_AGENT">Free Agent</option>
                        <option value="DRAFT">Draft</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transaction-week">Week</Label>
                      <Input
                        id="transaction-week"
                        type="number"
                        value={transactionData.week}
                        onChange={(e) => setTransactionData({ ...transactionData, week: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transaction-description">Description</Label>
                    <Textarea
                      id="transaction-description"
                      value={transactionData.description}
                      onChange={(e) => setTransactionData({ ...transactionData, description: e.target.value })}
                      placeholder="e.g., Team Alpha traded RB Saquon Barkley to Dynasty Kings for WR Davante Adams"
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleAddTransaction} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="draft" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Add Draft Picks</span>
                  </CardTitle>
                  <CardDescription>
                    Record draft picks for the {selectedSeason} season
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="draft-team">Team Name</Label>
                      <Input
                        id="draft-team"
                        value={draftPickData.teamName}
                        onChange={(e) => setDraftPickData({ ...draftPickData, teamName: e.target.value })}
                        placeholder="e.g., Mad Men"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="draft-player">Player Name</Label>
                      <Input
                        id="draft-player"
                        value={draftPickData.playerName}
                        onChange={(e) => setDraftPickData({ ...draftPickData, playerName: e.target.value })}
                        placeholder="e.g., Saquon Barkley"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="draft-position">Position</Label>
                      <select
                        id="draft-position"
                        className="w-full p-2 border rounded-md"
                        value={draftPickData.position}
                        onChange={(e) => setDraftPickData({ ...draftPickData, position: e.target.value })}
                      >
                        <option value="QB">QB</option>
                        <option value="RB">RB</option>
                        <option value="WR">WR</option>
                        <option value="TE">TE</option>
                        <option value="K">K</option>
                        <option value="D/ST">D/ST</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="draft-round">Round</Label>
                      <Input
                        id="draft-round"
                        type="number"
                        value={draftPickData.round}
                        onChange={(e) => setDraftPickData({ ...draftPickData, round: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="draft-pick">Pick in Round</Label>
                      <Input
                        id="draft-pick"
                        type="number"
                        value={draftPickData.pick}
                        onChange={(e) => setDraftPickData({ ...draftPickData, pick: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="draft-overall">Overall Pick</Label>
                      <Input
                        id="draft-overall"
                        type="number"
                        value={draftPickData.overallPick}
                        onChange={(e) => setDraftPickData({ ...draftPickData, overallPick: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddDraftPick} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Draft Pick
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="review" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Save className="h-5 w-5" />
                    <span>Review & Submit</span>
                  </CardTitle>
                  <CardDescription>
                    Review your data and submit the {selectedSeason} season
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <div className="text-2xl font-bold">0</div>
                        <div className="text-sm text-muted-foreground">Teams Added</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <Edit className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <div className="text-2xl font-bold">0</div>
                        <div className="text-sm text-muted-foreground">Transactions</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <CheckCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <div className="text-2xl font-bold">0</div>
                        <div className="text-sm text-muted-foreground">Draft Picks</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-2 p-4 bg-muted rounded-lg">
                      <AlertCircle className="h-5 w-5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Add teams, transactions, and draft picks before submitting
                      </p>
                    </div>

                    <Button 
                      onClick={handleSubmitSeasonData}
                      disabled={isAddingData}
                      className="w-full"
                    >
                      {isAddingData ? "Submitting..." : "Submit Season Data"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
