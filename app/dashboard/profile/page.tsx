"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Settings } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
          <p className="text-muted-foreground">User profile and settings</p>
        </div>
        <Badge variant="outline" className="text-sm">Profile</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile Coming Soon</CardTitle>
          <CardDescription>User profile and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">User Profile</h3>
            <p className="text-muted-foreground">Manage your profile, preferences, and account settings.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
