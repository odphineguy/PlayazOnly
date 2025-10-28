"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Newspaper } from "lucide-react";

export default function NewsletterPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Newsletter</h1>
          <p className="text-muted-foreground">League newsletter and updates</p>
        </div>
        <Badge variant="outline" className="text-sm">Newsletter</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Newsletter Coming Soon</CardTitle>
          <CardDescription>League newsletter and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">League Newsletter</h3>
            <p className="text-muted-foreground">Subscribe to league updates, weekly recaps, and important announcements.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
