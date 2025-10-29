import { query } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

// Analyze actual fantasy points by position and draft position
export const analyzePositionPerformance = query({
  args: {},
  handler: async (ctx) => {
    const allDraftPicks = await ctx.db.query("draftPicks").collect();
    const players = await ctx.db.query("players").collect();
    const rosterEntries = await ctx.db.query("rosterEntries").collect();

    const playerMap = new Map(players.map(p => [p._id, p]));

    // Create a map: playerId+seasonId -> total points
    const playerSeasonPoints = new Map<string, number>();
    rosterEntries.forEach(entry => {
      const key = `${entry.playerId}_${entry.seasonId}`;
      const currentPoints = playerSeasonPoints.get(key) || 0;
      playerSeasonPoints.set(key, currentPoints + entry.points);
    });

    // Group by position
    const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'D/ST'];
    const positionData: any = {};

    positions.forEach(position => {
      const pickRanges = [
        { label: "1-10", min: 1, max: 10, picks: [] as number[] },
        { label: "11-20", min: 11, max: 20, picks: [] as number[] },
        { label: "21-30", min: 21, max: 30, picks: [] as number[] },
        { label: "31-50", min: 31, max: 50, picks: [] as number[] },
        { label: "51-75", min: 51, max: 75, picks: [] as number[] },
        { label: "76-100", min: 76, max: 100, picks: [] as number[] },
        { label: "101-150", min: 101, max: 150, picks: [] as number[] },
        { label: "151+", min: 151, max: 999, picks: [] as number[] },
      ];

      // Collect picks for this position
      allDraftPicks.forEach(pick => {
        const player = playerMap.get(pick.playerId);
        if (!player || (player.position !== position &&
                       !(position === 'D/ST' && player.position === 'DST'))) {
          return;
        }

        const key = `${pick.playerId}_${pick.seasonId}`;
        const actualPoints = playerSeasonPoints.get(key) || 0;

        for (const range of pickRanges) {
          if (pick.overallPick >= range.min && pick.overallPick <= range.max) {
            range.picks.push(actualPoints);
            break;
          }
        }
      });

      // Calculate stats
      const rangeStats = pickRanges.map(range => {
        if (range.picks.length === 0) {
          return {
            label: range.label,
            avgPoints: 0,
            maxPoints: 0,
            count: 0
          };
        }

        const sum = range.picks.reduce((a, b) => a + b, 0);
        const avg = sum / range.picks.length;
        const max = Math.max(...range.picks);

        return {
          label: range.label,
          avgPoints: parseFloat(avg.toFixed(2)),
          maxPoints: parseFloat(max.toFixed(2)),
          count: range.picks.length
        };
      }).filter(r => r.count > 0); // Only include ranges with picks

      // Find typical draft start (first range with 5+ picks)
      const draftStart = pickRanges.findIndex(r => r.picks.length >= 5);
      const typicalStartPick = draftStart >= 0 ? (draftStart * 10 + 1) : 1;

      // Find best performing range
      const bestRange = rangeStats.reduce((best, curr) =>
        curr.avgPoints > best.avgPoints ? curr : best,
        rangeStats[0] || { avgPoints: 0 }
      );

      positionData[position] = {
        rangeStats,
        typicalDraftStart: typicalStartPick,
        peakPerformance: bestRange.avgPoints,
        totalPicks: pickRanges.reduce((sum, r) => sum + r.picks.length, 0)
      };
    });

    return positionData;
  },
});

// Derive position-specific expected value curve parameters from analysis
// Returns for each position: { base, decay, draftStart }
export const getPositionCurves = query({
  args: { fallback: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    // Reuse analysis to calibrate curves
    const analysis: Record<string, any> = await ctx.runQuery(
      api.positionAnalysis.analyzePositionPerformance,
      {}
    );

    // Helper to parse numeric from range label like "101-150" or "151+"
    const parseRangeMax = (label: string): number => {
      if (label.includes("+")) return 200; // treat as very late
      const parts = label.split("-");
      return Number(parts[1]) || 150;
    };

    const positions = ["QB", "RB", "WR", "TE", "K", "DST"] as const;
    const defaults: Record<string, { base: number; decay: number; draftStart: number }> = {
      QB: { base: 180, decay: 0.012, draftStart: 40 },
      RB: { base: 140, decay: 0.018, draftStart: 5 },
      WR: { base: 135, decay: 0.016, draftStart: 8 },
      TE: { base: 100, decay: 0.015, draftStart: 30 },
      K: { base: 80, decay: 0.010, draftStart: 120 },
      DST: { base: 85, decay: 0.010, draftStart: 110 },
    };

    const curves: Record<string, { base: number; decay: number; draftStart: number }> = {};

    for (const pos of positions) {
      const keyInAnalysis = pos === "DST" ? "D/ST" : pos;
      const data = analysis[keyInAnalysis];
      if (!data || !data.rangeStats || data.rangeStats.length === 0) {
        curves[pos] = defaults[pos];
        continue;
      }

      // Base: use peakPerformance if present else max avgPoints across ranges
      const base = typeof data.peakPerformance === "number" && data.peakPerformance > 0
        ? data.peakPerformance
        : Math.max(...data.rangeStats.map((r: any) => r.avgPoints || 0), defaults[pos].base);

      // Draft start: typicalDraftStart or default
      const draftStart = typeof data.typicalDraftStart === "number" && data.typicalDraftStart > 0
        ? data.typicalDraftStart
        : defaults[pos].draftStart;

      // Low point: use latest non-empty range average as the tail value
      const sortedRanges = [...data.rangeStats].sort((a: any, b: any) => parseRangeMax(a.label) - parseRangeMax(b.label));
      const tail = sortedRanges[sortedRanges.length - 1];
      const tailAvg = (tail && tail.avgPoints) ? tail.avgPoints : (defaults[pos].base * Math.exp(-defaults[pos].decay * 120));

      // Fit decay so that value at adjusted pick ~150 maps to tailAvg
      const targetPick = Math.max(1, 150 - draftStart + 1);
      const safeBase = Math.max(1, base);
      const safeTail = Math.max(1, tailAvg);
      const decay = targetPick > 1 ? Math.log(safeBase / safeTail) / (targetPick - 1) : defaults[pos].decay;

      curves[pos] = {
        base: Number(safeBase.toFixed(2)),
        decay: Number(decay.toFixed(5)),
        draftStart: Math.max(1, Math.floor(draftStart)),
      };
    }

    return curves;
  },
});
