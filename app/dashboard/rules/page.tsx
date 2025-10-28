"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Scale } from "lucide-react";

export default function RulesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rules</h1>
          <p className="text-muted-foreground">League rules and settings</p>
        </div>
        <Badge variant="outline" className="text-sm">Rules</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Rules Coming Soon</CardTitle>
          <CardDescription>League rules and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">League Rules</h3>
            <p className="text-muted-foreground">View and manage league rules, scoring settings, and regulations.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
