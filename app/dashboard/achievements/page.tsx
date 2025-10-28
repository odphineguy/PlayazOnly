"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Trophy } from "lucide-react";

export default function AchievementsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
          <p className="text-muted-foreground">League achievements and awards</p>
        </div>
        <Badge variant="outline" className="text-sm">Achievements</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Achievements Coming Soon</CardTitle>
          <CardDescription>League achievements and awards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">League Achievements</h3>
            <p className="text-muted-foreground">Track achievements, milestones, and special awards earned throughout the season.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
