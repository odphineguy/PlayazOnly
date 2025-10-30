"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "lucide-react";

export default function TransactionsPage() {
  const transactions = useQuery(api.fantasyFootball.getAllTransactions);
  const teams = useQuery(api.fantasyFootball.getAllTeams);

  const teamNameById = useMemo(() => {
    const map = new Map<string, string>();
    (teams || []).forEach(t => map.set(t._id, t.name));
    return map;
  }, [teams]);

  const recentTransactions = useMemo(() => {
    return (transactions || []).slice(0, 100).map(t => ({
      id: t._id,
      type: t.type,
      description: t.description,
      createdAt: t.createdAt,
      week: t.week,
      teams: (t.involvedTeams || []).map((id: any) => teamNameById.get(id) || "Unknown Team"),
    }));
  }, [transactions, teamNameById]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">League activity, trades, waivers, and free agent moves</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest league activity from the database</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-2">
            <div className="space-y-3">
              {(recentTransactions || []).length > 0 ? recentTransactions.map((tx) => (
                <div key={tx.id as any} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary">{tx.type}</Badge>
                    <div>
                      <div className="font-medium">{tx.description}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(tx.createdAt).toLocaleDateString()}</span>
                        {tx.week ? <span>• W{tx.week}</span> : null}
                        {tx.teams.length ? <span>• {tx.teams.join(" • ")}</span> : null}
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-sm text-muted-foreground">No transactions found.</div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
