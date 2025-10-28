"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CreditCard, Receipt } from "lucide-react";

export default function FinancesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finances</h1>
          <p className="text-muted-foreground">League finances, payments, and transactions</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Financial
        </Badge>
      </div>

      {/* Coming Soon */}
      <Card>
        <CardHeader>
          <CardTitle>Finances Coming Soon</CardTitle>
          <CardDescription>League financial management and payment tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Financial Management</h3>
            <p className="text-muted-foreground">
              Track league dues, payments, prize distributions, and financial transactions. 
              Manage league finances with transparency and accountability.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
