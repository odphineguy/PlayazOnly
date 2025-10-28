"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sword, Users, TrendingUp } from "lucide-react";

export default function VersusPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Versus</h1>
          <p className="text-muted-foreground">Head-to-head matchups and team comparisons</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Matchups
        </Badge>
      </div>

      {/* Coming Soon */}
      <Card>
        <CardHeader>
          <CardTitle>Versus Coming Soon</CardTitle>
          <CardDescription>Head-to-head analysis and team comparisons</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Sword className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Team Matchups</h3>
            <p className="text-muted-foreground">
              Compare teams head-to-head, analyze historical matchups, and see detailed 
              breakdowns of team performance against specific opponents.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
