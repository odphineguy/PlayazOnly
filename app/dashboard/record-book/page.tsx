"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookMarked, Archive } from "lucide-react";

export default function RecordBookPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Record Book</h1>
          <p className="text-muted-foreground">League records and milestones</p>
        </div>
        <Badge variant="outline" className="text-sm">Records</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Record Book Coming Soon</CardTitle>
          <CardDescription>League records and milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookMarked className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">League Records</h3>
            <p className="text-muted-foreground">View all-time league records, milestones, and historical achievements.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
