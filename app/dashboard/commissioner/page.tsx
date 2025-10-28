"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Settings } from "lucide-react";

export default function CommissionerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commissioner Tools</h1>
          <p className="text-muted-foreground">Commissioner administration tools</p>
        </div>
        <Badge variant="outline" className="text-sm">Admin</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Commissioner Tools Coming Soon</CardTitle>
          <CardDescription>Commissioner administration tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Commissioner Tools</h3>
            <p className="text-muted-foreground">Access commissioner tools for league management, settings, and administration.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
