"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  Database,
  Calendar,
  Users
} from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function DataImport() {
  const [importStep, setImportStep] = useState(1);
  const [leagueData, setLeagueData] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const importEspnData = useMutation(api.importAllEspnData.importAllEspnData);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setLeagueData(data);
        setImportStep(2);
        toast.success("File uploaded successfully!");
      } catch (error) {
        toast.error("Invalid JSON file. Please check the format.");
      }
    };
    reader.readAsText(file);
  };

  const handleImportData = async () => {
    if (!leagueData) return;

    setIsImporting(true);
    setImportProgress(0);

    try {
      // Simulate import progress
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Simulate import process
      await new Promise(resolve => setTimeout(resolve, 2000));

      setImportProgress(100);
      clearInterval(progressInterval);
      
      toast.success("Data import simulation completed! (Convex integration coming soon)");
      setImportStep(3);
    } catch (error) {
      toast.error("Import failed. Please try again.");
      console.error("Import error:", error);
    } finally {
      setIsImporting(false);
    }
  };

  const sampleData = {
    "year": 2024,
    "league_name": "Playaz Only",
    "teams": [
      {
        "team_id": 1,
        "team_name": "Mad Men",
        "wins": 8,
        "losses": 5,
        "points_for": 1456.7,
        "points_against": 1423.4,
        "standing": 1,
        "final_standing": null,
        "streak_length": 2,
        "streak_type": "WIN"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Data Import</h1>
            <p className="text-muted-foreground">Import your ESPN Fantasy Football data</p>
          </div>
          <Badge variant="outline" className="text-sm">
            ESPN Integration
          </Badge>
        </div>

        {/* Import Steps */}
        <div className="flex items-center space-x-4 mb-6">
          <div className={`flex items-center space-x-2 ${importStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${importStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {importStep > 1 ? <CheckCircle className="h-4 w-4" /> : '1'}
            </div>
            <span className="text-sm font-medium">Upload Data</span>
          </div>
          <div className="flex-1 h-px bg-border"></div>
          <div className={`flex items-center space-x-2 ${importStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${importStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {importStep > 2 ? <CheckCircle className="h-4 w-4" /> : '2'}
            </div>
            <span className="text-sm font-medium">Review & Import</span>
          </div>
          <div className="flex-1 h-px bg-border"></div>
          <div className={`flex items-center space-x-2 ${importStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${importStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {importStep > 3 ? <CheckCircle className="h-4 w-4" /> : '3'}
            </div>
            <span className="text-sm font-medium">Complete</span>
          </div>
        </div>

        <Tabs defaultValue="upload" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upload">Upload Data</TabsTrigger>
            <TabsTrigger value="quick-import">Quick Import ESPN Data</TabsTrigger>
            <TabsTrigger value="preview" disabled={importStep < 2}>Preview</TabsTrigger>
            <TabsTrigger value="sample">Sample Data</TabsTrigger>
          </TabsList>

          <TabsContent value="quick-import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Import ESPN Data</span>
                </CardTitle>
                <CardDescription>
                  Import all ESPN league data from 2018-2025 with one click
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    This will import all available ESPN data including:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>League settings and configuration</li>
                    <li>Team data for all seasons (2018-2025)</li>
                    <li>Weekly matchups and scores</li>
                    <li>Player statistics and records</li>
                  </ul>
                </div>

                {isImporting && (
                  <div className="space-y-2">
                    <Progress value={importProgress} className="w-full" />
                    <p className="text-sm text-center text-muted-foreground">
                      Importing data... {importProgress}%
                    </p>
                  </div>
                )}

                <Button
                  onClick={async () => {
                    setIsImporting(true);
                    setImportProgress(0);

                    try {
                      const progressInterval = setInterval(() => {
                        setImportProgress(prev => {
                          if (prev >= 90) {
                            clearInterval(progressInterval);
                            return 90;
                          }
                          return prev + 10;
                        });
                      }, 500);

                      const result = await importEspnData();

                      setImportProgress(100);
                      clearInterval(progressInterval);

                      toast.success(result.message || "Data imported successfully!");
                      console.log("Import result:", result);
                    } catch (error) {
                      toast.error("Import failed: " + (error as Error).message);
                      console.error("Import error:", error);
                    } finally {
                      setIsImporting(false);
                    }
                  }}
                  disabled={isImporting}
                  className="w-full"
                >
                  {isImporting ? "Importing..." : "Import All ESPN Data"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="h-5 w-5" />
                    <span>Upload ESPN Data</span>
                  </CardTitle>
                  <CardDescription>
                    Upload your ESPN Fantasy Football league data JSON file
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <div className="space-y-2">
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <Button variant="outline" asChild>
                          <span>Choose File</span>
                        </Button>
                      </Label>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <p className="text-sm text-muted-foreground">
                        or drag and drop your JSON file here
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Supported Data Types:</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">League Settings</Badge>
                      <Badge variant="secondary">Team Rosters</Badge>
                      <Badge variant="secondary">Season Stats</Badge>
                      <Badge variant="secondary">Draft Results</Badge>
                      <Badge variant="secondary">Transactions</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>How to Export ESPN Data</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="text-sm font-medium">Run the ESPN Fetcher Script</p>
                        <p className="text-xs text-muted-foreground">
                          Use the Python script in EspnData/espn_ff_fetcher.py
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="text-sm font-medium">Configure Your Credentials</p>
                        <p className="text-xs text-muted-foreground">
                          Add your ESPN S2 and SWID tokens
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="text-sm font-medium">Export League Data</p>
                        <p className="text-xs text-muted-foreground">
                          Run the script to generate JSON files for each season
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <p className="text-sm font-medium">Upload Here</p>
                        <p className="text-xs text-muted-foreground">
                          Select the JSON file and import your data
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {leagueData && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Database className="h-5 w-5" />
                      <span>Data Preview</span>
                    </CardTitle>
                    <CardDescription>
                      Review your data before importing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">{leagueData.year}</div>
                          <div className="text-xs text-muted-foreground">Season</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">{leagueData.teams?.length || 0}</div>
                          <div className="text-xs text-muted-foreground">Teams</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">{leagueData.league_name}</div>
                          <div className="text-xs text-muted-foreground">League Name</div>
                        </div>
                      </div>
                    </div>

                    <ScrollArea className="h-[300px] border rounded-lg p-4">
                      <pre className="text-xs text-muted-foreground">
                        {JSON.stringify(leagueData, null, 2)}
                      </pre>
                    </ScrollArea>

                    <div className="mt-4 flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setImportStep(1)}>
                        Back
                      </Button>
                      <Button 
                        onClick={handleImportData} 
                        disabled={isImporting}
                        className="min-w-[120px]"
                      >
                        {isImporting ? (
                          <>
                            <Progress value={importProgress} className="w-full h-2 mb-2" />
                            Importing...
                          </>
                        ) : (
                          "Import Data"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sample" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>Sample Data Format</span>
                </CardTitle>
                <CardDescription>
                  Download this sample to understand the expected JSON structure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'sample-league-data.json';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Sample
                  </Button>

                  <ScrollArea className="h-[400px] border rounded-lg p-4">
                    <pre className="text-xs text-muted-foreground">
                      {JSON.stringify(sampleData, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}