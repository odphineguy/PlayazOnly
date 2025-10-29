import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import draftData2018 from "../EspnData/EspnDraft/espn_draft_2018.json";
import draftData2019 from "../EspnData/EspnDraft/espn_draft_2019.json";
import draftData2020 from "../EspnData/EspnDraft/espn_draft_2020.json";
import draftData2021 from "../EspnData/EspnDraft/espn_draft_2021.json";
import draftData2022 from "../EspnData/EspnDraft/espn_draft_2022.json";
import draftData2023 from "../EspnData/EspnDraft/espn_draft_2023.json";
import draftData2024 from "../EspnData/EspnDraft/espn_draft_2024.json";
import draftData2025 from "../EspnData/EspnDraft/espn_draft_2025.json";

// Import all draft data from ESPN JSON files
export const importAllDraftData = mutation({
  args: {},
  handler: async (ctx): Promise<{
    message: string;
    results: Array<{
      year: string;
      message?: string;
      picksImported?: number;
      seasonId?: string;
      leagueId?: string;
      error?: string;
    }>;
  }> => {
    // Use real ESPN draft data from imported JSON files
    const draftData = {
      "2018": draftData2018 as any,
      "2019": draftData2019 as any,
      "2020": draftData2020 as any,
      "2021": draftData2021 as any,
      "2022": draftData2022 as any,
      "2023": draftData2023 as any,
      "2024": draftData2024 as any,
      "2025": draftData2025 as any,
    };
    
    const results: Array<{
      year: string;
      message?: string;
      picksImported?: number;
      seasonId?: string;
      leagueId?: string;
      error?: string;
    }> = [];
    
    // Import each year's data
    for (const [year, data] of Object.entries(draftData)) {
      try {
        const result: any = await ctx.runMutation(api.draftData.importDraftData, {
          year: parseInt(year),
          draftPicks: data.draft_picks
        });
        results.push({ year, ...result });
      } catch (error) {
        console.error(`Error importing ${year} data:`, error);
        results.push({ year, error: (error as Error).message });
      }
    }
    
    return {
      message: "Draft data import completed",
      results
    };
  },
});
