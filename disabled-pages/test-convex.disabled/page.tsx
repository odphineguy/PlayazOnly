"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TestConvexPage() {
  const createSampleData = useMutation(api.fantasyFootball.createSampleData);
  const getAllLeagues = useQuery(api.fantasyFootball.getAllLeagues);
  const getAllSeasons = useQuery(api.fantasyFootball.getAllSeasons);
  const getAllTeams = useQuery(api.fantasyFootball.getAllTeams);

  const handleCreateSampleData = async () => {
    try {
      const result = await createSampleData({});
      console.log("Sample data created:", result);
      alert("Sample data created successfully!");
    } catch (error) {
      console.error("Error creating sample data:", error);
      alert("Error creating sample data. Check console for details.");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Convex Test Page</h1>
        <p className="text-muted-foreground">Test your Convex database functions and data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Sample Data */}
        <Card>
          <CardHeader>
            <CardTitle>Create Sample Data</CardTitle>
            <CardDescription>Populate your database with sample fantasy football data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreateSampleData} className="w-full">
              Create Sample Data
            </Button>
          </CardContent>
        </Card>

        {/* Database Status */}
        <Card>
          <CardHeader>
            <CardTitle>Database Status</CardTitle>
            <CardDescription>Current data in your Convex database</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Leagues:</span>
              <Badge variant="outline">
                {getAllLeagues ? getAllLeagues.length : "Loading..."}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Seasons:</span>
              <Badge variant="outline">
                {getAllSeasons ? getAllSeasons.length : "Loading..."}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Teams:</span>
              <Badge variant="outline">
                {getAllTeams ? getAllTeams.length : "Loading..."}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Display */}
      {getAllLeagues && getAllLeagues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Leagues</CardTitle>
            <CardDescription>All leagues in your database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getAllLeagues.map((league) => (
                <div key={league._id} className="p-3 border rounded-lg">
                  <div className="font-semibold">{league.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Platform: {league.platform} • Commissioner: {league.commissionerId}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {getAllSeasons && getAllSeasons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Seasons</CardTitle>
            <CardDescription>All seasons in your database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {getAllSeasons.map((season) => (
                <div key={season._id} className="p-2 border rounded text-center">
                  <div className="font-semibold">{season.year}</div>
                  <div className="text-xs text-muted-foreground">
                    {season.isActive ? "Active" : "Inactive"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {getAllTeams && getAllTeams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Teams</CardTitle>
            <CardDescription>All teams in your database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {getAllTeams.map((team) => (
                <div key={team._id} className="p-3 border rounded">
                  <div className="font-semibold">{team.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Record: {team.wins}-{team.losses} • Points: {team.pointsFor}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
          <CardDescription>How to test your Convex setup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>1. Click "Create Sample Data" to populate your database</p>
          <p>2. Check the Database Status to see if data was created</p>
          <p>3. View the data in the sections below</p>
          <p>4. Check your Convex dashboard to see the data there too</p>
          <p>5. Once you see data here, your Convex setup is working!</p>
        </CardContent>
      </Card>
    </div>
  );
}
