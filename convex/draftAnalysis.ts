import { query } from "./_generated/server";
import { v } from "convex/values";

// Analyze actual fantasy points by draft position
export const analyzePickPerformance = query({
  args: {},
  handler: async (ctx) => {
    const allDraftPicks = await ctx.db.query("draftPicks").collect();
    const rosterEntries = await ctx.db.query("rosterEntries").collect();

    // Create a map: playerId+seasonId -> total points
    const playerSeasonPoints = new Map<string, number>();
    rosterEntries.forEach(entry => {
      const key = `${entry.playerId}_${entry.seasonId}`;
      const currentPoints = playerSeasonPoints.get(key) || 0;
      playerSeasonPoints.set(key, currentPoints + entry.points);
    });

    // Group picks by overall pick position ranges
    const pickRanges = [
      { label: "Pick 1-10", min: 1, max: 10, picks: [] as number[] },
      { label: "Pick 11-20", min: 11, max: 20, picks: [] as number[] },
      { label: "Pick 21-30", min: 21, max: 30, picks: [] as number[] },
      { label: "Pick 31-50", min: 31, max: 50, picks: [] as number[] },
      { label: "Pick 51-75", min: 51, max: 75, picks: [] as number[] },
      { label: "Pick 76-100", min: 76, max: 100, picks: [] as number[] },
      { label: "Pick 101-150", min: 101, max: 150, picks: [] as number[] },
      { label: "Pick 151+", min: 151, max: 999, picks: [] as number[] },
    ];

    // Collect all #1 picks specifically
    const firstPicks: number[] = [];
    const lastPicks: number[] = []; // picks 150+

    allDraftPicks.forEach(pick => {
      const key = `${pick.playerId}_${pick.seasonId}`;
      const actualPoints = playerSeasonPoints.get(key) || 0;

      // Track #1 picks
      if (pick.overallPick === 1) {
        firstPicks.push(actualPoints);
      }

      // Track very late picks (150+)
      if (pick.overallPick >= 150) {
        lastPicks.push(actualPoints);
      }

      // Group by ranges
      for (const range of pickRanges) {
        if (pick.overallPick >= range.min && pick.overallPick <= range.max) {
          range.picks.push(actualPoints);
          break;
        }
      }
    });

    // Calculate stats for each range
    const rangeStats = pickRanges.map(range => {
      if (range.picks.length === 0) {
        return {
          label: range.label,
          avgPoints: 0,
          minPoints: 0,
          maxPoints: 0,
          count: 0
        };
      }

      const sum = range.picks.reduce((a, b) => a + b, 0);
      const avg = sum / range.picks.length;
      const min = Math.min(...range.picks);
      const max = Math.max(...range.picks);

      return {
        label: range.label,
        avgPoints: parseFloat(avg.toFixed(2)),
        minPoints: parseFloat(min.toFixed(2)),
        maxPoints: parseFloat(max.toFixed(2)),
        count: range.picks.length
      };
    });

    // Stats for #1 picks
    const firstPickAvg = firstPicks.length > 0
      ? firstPicks.reduce((a, b) => a + b, 0) / firstPicks.length
      : 0;

    // Stats for last picks (150+)
    const lastPickAvg = lastPicks.length > 0
      ? lastPicks.reduce((a, b) => a + b, 0) / lastPicks.length
      : 0;

    return {
      rangeStats,
      firstPickStats: {
        avgPoints: parseFloat(firstPickAvg.toFixed(2)),
        count: firstPicks.length,
        allScores: firstPicks.map(p => parseFloat(p.toFixed(2)))
      },
      lastPickStats: {
        avgPoints: parseFloat(lastPickAvg.toFixed(2)),
        count: lastPicks.length,
        allScores: lastPicks.slice(0, 20).map(p => parseFloat(p.toFixed(2))) // First 20 only
      },
      recommendation: {
        suggestedFirstPickValue: parseFloat(firstPickAvg.toFixed(2)),
        suggestedLastPickValue: parseFloat(lastPickAvg.toFixed(2)),
        suggestedTotalPicks: 150
      }
    };
  },
});
