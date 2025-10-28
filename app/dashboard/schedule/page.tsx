"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground">Season schedule and matchups</p>
        </div>
        <Badge variant="outline" className="text-sm">Schedule</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Schedule Coming Soon</CardTitle>
          <CardDescription>Season schedule and matchups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Season Schedule</h3>
            <p className="text-muted-foreground">View the complete season schedule, matchups, and important dates.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
