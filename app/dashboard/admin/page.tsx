"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AdminPage() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const clearAllData = useMutation(api.fantasyFootball.clearAllData);
  const importEspnData = useMutation(api.importAllEspnData.importAllEspnData);

  const handleClearAndImport = async () => {
    setLoading(true);
    setStatus("Clearing all data...");

    try {
      // Step 1: Clear
      const cleared = await clearAllData();
      setStatus(`Cleared: ${cleared.teamsDeleted} teams, ${cleared.seasonsDeleted} seasons. Now importing...`);

      // Step 2: Import
      const imported = await importEspnData();
      setStatus(`✅ Success! Imported ${imported.seasonsCreated} seasons with ${imported.teamsCreated} teams. Refresh the History page to see all data.`);
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearOnly = async () => {
    setLoading(true);
    setStatus("Clearing all data...");

    try {
      const cleared = await clearAllData();
      setStatus(`✅ Cleared: ${cleared.teamsDeleted} teams, ${cleared.seasonsDeleted} seasons, ${cleared.leaguesDeleted} leagues`);
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImportOnly = async () => {
    setLoading(true);
    setStatus("Importing ESPN data...");

    try {
      const imported = await importEspnData();
      setStatus(`✅ Imported ${imported.seasonsCreated} seasons with ${imported.teamsCreated} teams`);
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Tools</h1>
        <p className="text-muted-foreground">Manage your fantasy football data</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Clear and re-import your ESPN data. Use this to fix data issues or start fresh.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
              onClick={handleClearAndImport}
              disabled={loading}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              🔄 Clear & Re-Import All Data
            </Button>

            <Button
              onClick={handleClearOnly}
              disabled={loading}
              variant="destructive"
              size="lg"
            >
              🗑️ Clear All Data
            </Button>

            <Button
              onClick={handleImportOnly}
              disabled={loading}
              variant="outline"
              size="lg"
            >
              📥 Import Data Only
            </Button>
          </div>

          {status && (
            <div className={`p-4 rounded-lg ${
              status.includes('❌') ? 'bg-red-50 text-red-800' :
              status.includes('✅') ? 'bg-green-50 text-green-800' :
              'bg-blue-50 text-blue-800'
            }`}>
              {status}
            </div>
          )}

          <div className="text-sm text-muted-foreground space-y-2 pt-4 border-t">
            <p><strong>Clear & Re-Import All Data:</strong> Removes all existing data and imports fresh from ESPN JSON files. Use this to fix aggregation issues.</p>
            <p><strong>Clear All Data:</strong> Deletes everything from the database. Useful for testing.</p>
            <p><strong>Import Data Only:</strong> Imports ESPN data without clearing. Will skip if data already exists.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
