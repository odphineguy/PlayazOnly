"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StickyNote, MessageSquare } from "lucide-react";

export default function NotesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground">League notes and announcements</p>
        </div>
        <Badge variant="outline" className="text-sm">Notes</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Notes Coming Soon</CardTitle>
          <CardDescription>League announcements and notes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <StickyNote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">League Notes</h3>
            <p className="text-muted-foreground">Share announcements, updates, and important league information.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
