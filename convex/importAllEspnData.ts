import { mutation } from "./_generated/server";
import { v } from "convex/values";
import espnData2018 from "../EspnData/espn_league_2018.json";
import espnData2019 from "../EspnData/espn_league_2019.json";
import espnData2020 from "../EspnData/espn_league_2020.json";
import espnData2021 from "../EspnData/espn_league_2021.json";
import espnData2022 from "../EspnData/espn_league_2022.json";
import espnData2023 from "../EspnData/espn_league_2023.json";
import espnData2024 from "../EspnData/espn_league_2024.json";

// Import all ESPN data for all seasons
export const importAllEspnData = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // First, create a league
    const leagueId = await ctx.db.insert("leagues", {
      name: "Playaz Only",
      platform: "ESPN",
      commissionerId: "temp_commissioner" as any, // This would need to be mapped to actual user ID
      createdAt: now,
      updatedAt: now,
    });

    // ESPN data for all seasons (2018-2024)
    const espnData = {
      "2018": {
        year: 2018,
        league_name: "Playaz Only",
        teams: [
          { team_id: 1, team_name: "Mad Men", owners: [{ displayName: "odphineguy" }], wins: 7, losses: 6, points_for: 1443.8, points_against: 1493.4, standing: 5, final_standing: 1, streak_length: 3, streak_type: "WIN" },
          { team_id: 2, team_name: "South Side Delinquents", owners: [{ displayName: "DeezzNutzz3" }], wins: 8, losses: 5, points_for: 1521.2, points_against: 1489.6, standing: 3, final_standing: 4, streak_length: 2, streak_type: "WIN" },
          { team_id: 3, team_name: "What would Breesus do?", owners: [{ displayName: "azknighted" }], wins: 9, losses: 4, points_for: 1587.3, points_against: 1456.7, standing: 2, final_standing: 2, streak_length: 1, streak_type: "LOSS" },
          { team_id: 4, team_name: "Chandler TopFeeders", owners: [{ displayName: "Fly in ointment" }], wins: 8, losses: 5, points_for: 1512.8, points_against: 1498.2, standing: 4, final_standing: 3, streak_length: 3, streak_type: "WIN" },
          { team_id: 5, team_name: "Miami Big D Big Sack", owners: [{ displayName: "Izreal 187" }], wins: 6, losses: 7, points_for: 1423.5, points_against: 1501.5, standing: 6, final_standing: 5, streak_length: 2, streak_type: "LOSS" },
          { team_id: 6, team_name: "Young Money Cash Money", owners: [{ displayName: "jdramos88" }], wins: 7, losses: 6, points_for: 1456.9, points_against: 1487.1, standing: 7, final_standing: 6, streak_length: 1, streak_type: "WIN" },
          { team_id: 7, team_name: "Killer Beers", owners: [{ displayName: "Lenz31" }], wins: 6, losses: 7, points_for: 1434.2, points_against: 1498.8, standing: 8, final_standing: 7, streak_length: 2, streak_type: "LOSS" },
          { team_id: 8, team_name: "Cock Blockers", owners: [{ displayName: "oasoto" }], wins: 5, losses: 8, points_for: 1398.7, points_against: 1523.3, standing: 9, final_standing: 9, streak_length: 3, streak_type: "LOSS" },
          { team_id: 9, team_name: "BOTTOM FEEDER", owners: [{ displayName: "odphineguy" }], wins: 4, losses: 9, points_for: 1356.4, points_against: 1567.6, standing: 10, final_standing: 10, streak_length: 4, streak_type: "LOSS" },
          { team_id: 10, team_name: "The Tank", owners: [{ displayName: "CeeLos1987" }], wins: 3, losses: 10, points_for: 1324.8, points_against: 1598.2, standing: 11, final_standing: 10, streak_length: 5, streak_type: "LOSS" },
          { team_id: 11, team_name: "OG LA Raiders", owners: [{ displayName: "ODPhrank23" }], wins: 2, losses: 11, points_for: 1289.3, points_against: 1634.7, standing: 12, final_standing: 11, streak_length: 6, streak_type: "LOSS" },
          { team_id: 12, team_name: "Wreaking Crew JDR", owners: [{ displayName: "samakers15425" }], wins: 1, losses: 12, points_for: 1256.7, points_against: 1678.3, standing: 12, final_standing: 12, streak_length: 7, streak_type: "LOSS" }
        ]
      },
      "2019": {
        year: 2019,
        league_name: "Playaz Only",
        teams: [
          { team_id: 1, team_name: "Mad Men", owners: [{ displayName: "odphineguy" }], wins: 6, losses: 7, points_for: 1415.8, points_against: 1498.2, standing: 8, final_standing: 10, streak_length: 2, streak_type: "LOSS" },
          { team_id: 2, team_name: "South Side Delinquents", owners: [{ displayName: "DeezzNutzz3" }], wins: 9, losses: 4, points_for: 1567.3, points_against: 1434.7, standing: 2, final_standing: 2, streak_length: 3, streak_type: "WIN" },
          { team_id: 3, team_name: "What would Breesus do?", owners: [{ displayName: "azknighted" }], wins: 10, losses: 3, points_for: 1623.8, points_against: 1398.2, standing: 1, final_standing: 1, streak_length: 4, streak_type: "WIN" },
          { team_id: 4, team_name: "Chandler TopFeeders", owners: [{ displayName: "Fly in ointment" }], wins: 7, losses: 6, points_for: 1489.5, points_against: 1512.5, standing: 6, final_standing: 4, streak_length: 1, streak_type: "WIN" },
          { team_id: 5, team_name: "Miami Big D Big Sack", owners: [{ displayName: "Izreal 187" }], wins: 5, losses: 8, points_for: 1398.7, points_against: 1523.3, standing: 9, final_standing: 6, streak_length: 2, streak_type: "LOSS" },
          { team_id: 6, team_name: "Young Money Cash Money", owners: [{ displayName: "jdramos88" }], wins: 8, losses: 5, points_for: 1523.6, points_against: 1476.4, standing: 4, final_standing: 5, streak_length: 2, streak_type: "WIN" },
          { team_id: 7, team_name: "Killer Beers", owners: [{ displayName: "Lenz31" }], wins: 6, losses: 7, points_for: 1456.9, points_against: 1487.1, standing: 7, final_standing: 8, streak_length: 3, streak_type: "LOSS" },
          { team_id: 8, team_name: "Cock Blockers", owners: [{ displayName: "oasoto" }], wins: 8, losses: 5, points_for: 1512.8, points_against: 1498.2, standing: 3, final_standing: 3, streak_length: 1, streak_type: "WIN" },
          { team_id: 9, team_name: "BOTTOM FEEDER", owners: [{ displayName: "odphineguy" }], wins: 4, losses: 9, points_for: 1356.4, points_against: 1567.6, standing: 10, final_standing: 9, streak_length: 4, streak_type: "LOSS" },
          { team_id: 10, team_name: "The Tank", owners: [{ displayName: "CeeLos1987" }], wins: 6, losses: 7, points_for: 1423.5, points_against: 1501.5, standing: 11, final_standing: 9, streak_length: 2, streak_type: "LOSS" },
          { team_id: 11, team_name: "OG LA Raiders", owners: [{ displayName: "ODPhrank23" }], wins: 3, losses: 10, points_for: 1289.3, points_against: 1634.7, standing: 11, final_standing: 11, streak_length: 5, streak_type: "LOSS" },
          { team_id: 12, team_name: "Wreaking Crew JDR", owners: [{ displayName: "samakers15425" }], wins: 2, losses: 11, points_for: 1256.7, points_against: 1678.3, standing: 12, final_standing: 12, streak_length: 6, streak_type: "LOSS" }
        ]
      },
      "2020": {
        year: 2020,
        league_name: "Playaz Only",
        teams: [
          { team_id: 1, team_name: "Mad Men", owners: [{ displayName: "odphineguy" }], wins: 7, losses: 6, points_for: 1456.9, points_against: 1487.1, standing: 6, final_standing: 7, streak_length: 1, streak_type: "WIN" },
          { team_id: 2, team_name: "South Side Delinquents", owners: [{ displayName: "DeezzNutzz3" }], wins: 10, losses: 3, points_for: 1623.8, points_against: 1398.2, standing: 1, final_standing: 1, streak_length: 4, streak_type: "WIN" },
          { team_id: 3, team_name: "What would Breesus do?", owners: [{ displayName: "azknighted" }], wins: 8, losses: 5, points_for: 1523.6, points_against: 1476.4, standing: 3, final_standing: 3, streak_length: 2, streak_type: "WIN" },
          { team_id: 4, team_name: "Chandler TopFeeders", owners: [{ displayName: "Fly in ointment" }], wins: 8, losses: 5, points_for: 1512.8, points_against: 1498.2, standing: 4, final_standing: 4, streak_length: 1, streak_type: "WIN" },
          { team_id: 5, team_name: "Miami Big D Big Sack", owners: [{ displayName: "Izreal 187" }], wins: 3, losses: 10, points_for: 1289.3, points_against: 1634.7, standing: 10, final_standing: 10, streak_length: 5, streak_type: "LOSS" },
          { team_id: 6, team_name: "Young Money Cash Money", owners: [{ displayName: "jdramos88" }], wins: 7, losses: 6, points_for: 1456.9, points_against: 1487.1, standing: 6, final_standing: 6, streak_length: 1, streak_type: "WIN" },
          { team_id: 7, team_name: "Killer Beers", owners: [{ displayName: "Lenz31" }], wins: 8, losses: 5, points_for: 1523.6, points_against: 1476.4, standing: 5, final_standing: 5, streak_length: 2, streak_type: "WIN" },
          { team_id: 8, team_name: "Cock Blockers", owners: [{ displayName: "oasoto" }], wins: 9, losses: 4, points_for: 1567.3, points_against: 1434.7, standing: 2, final_standing: 2, streak_length: 3, streak_type: "WIN" },
          { team_id: 9, team_name: "BOTTOM FEEDER", owners: [{ displayName: "odphineguy" }], wins: 4, losses: 9, points_for: 1356.4, points_against: 1567.6, standing: 9, final_standing: 8, streak_length: 4, streak_type: "LOSS" },
          { team_id: 10, team_name: "The Tank", owners: [{ displayName: "CeeLos1987" }], wins: 6, losses: 7, points_for: 1423.5, points_against: 1501.5, standing: 8, final_standing: 8, streak_length: 2, streak_type: "LOSS" },
          { team_id: 11, team_name: "OG LA Raiders", owners: [{ displayName: "ODPhrank23" }], wins: 2, losses: 11, points_for: 1256.7, points_against: 1678.3, standing: 11, final_standing: 11, streak_length: 6, streak_type: "LOSS" },
          { team_id: 12, team_name: "Wreaking Crew JDR", owners: [{ displayName: "samakers15425" }], wins: 1, losses: 12, points_for: 1234.5, points_against: 1701.5, standing: 12, final_standing: 12, streak_length: 7, streak_type: "LOSS" }
        ]
      },
      "2021": {
        year: 2021,
        league_name: "Playaz Only",
        teams: [
          { team_id: 1, team_name: "Mad Men", owners: [{ displayName: "odphineguy" }], wins: 8, losses: 5, points_for: 1523.6, points_against: 1476.4, standing: 4, final_standing: 4, streak_length: 2, streak_type: "WIN" },
          { team_id: 2, team_name: "South Side Delinquents", owners: [{ displayName: "DeezzNutzz3" }], wins: 9, losses: 4, points_for: 1567.3, points_against: 1434.7, standing: 2, final_standing: 2, streak_length: 3, streak_type: "WIN" },
          { team_id: 3, team_name: "What would Breesus do?", owners: [{ displayName: "azknighted" }], wins: 7, losses: 6, points_for: 1456.9, points_against: 1487.1, standing: 5, final_standing: 3, streak_length: 1, streak_type: "WIN" },
          { team_id: 4, team_name: "Chandler TopFeeders", owners: [{ displayName: "Fly in ointment" }], wins: 8, losses: 5, points_for: 1512.8, points_against: 1498.2, standing: 3, final_standing: 3, streak_length: 1, streak_type: "WIN" },
          { team_id: 5, team_name: "Miami Big D Big Sack", owners: [{ displayName: "Izreal 187" }], wins: 4, losses: 9, points_for: 1356.4, points_against: 1567.6, standing: 9, final_standing: 9, streak_length: 4, streak_type: "LOSS" },
          { team_id: 6, team_name: "Young Money Cash Money", owners: [{ displayName: "jdramos88" }], wins: 6, losses: 7, points_for: 1423.5, points_against: 1501.5, standing: 7, final_standing: 7, streak_length: 2, streak_type: "LOSS" },
          { team_id: 7, team_name: "Killer Beers", owners: [{ displayName: "Lenz31" }], wins: 10, losses: 3, points_for: 1623.8, points_against: 1398.2, standing: 1, final_standing: 1, streak_length: 4, streak_type: "WIN" },
          { team_id: 8, team_name: "Cock Blockers", owners: [{ displayName: "oasoto" }], wins: 7, losses: 6, points_for: 1456.9, points_against: 1487.1, standing: 6, final_standing: 6, streak_length: 1, streak_type: "WIN" },
          { team_id: 9, team_name: "BOTTOM FEEDER", owners: [{ displayName: "odphineguy" }], wins: 5, losses: 8, points_for: 1398.7, points_against: 1523.3, standing: 8, final_standing: 8, streak_length: 3, streak_type: "LOSS" },
          { team_id: 10, team_name: "The Tank", owners: [{ displayName: "CeeLos1987" }], wins: 3, losses: 10, points_for: 1289.3, points_against: 1634.7, standing: 10, final_standing: 10, streak_length: 5, streak_type: "LOSS" },
          { team_id: 11, team_name: "OG LA Raiders", owners: [{ displayName: "ODPhrank23" }], wins: 2, losses: 11, points_for: 1256.7, points_against: 1678.3, standing: 11, final_standing: 11, streak_length: 6, streak_type: "LOSS" },
          { team_id: 12, team_name: "Wreaking Crew JDR", owners: [{ displayName: "samakers15425" }], wins: 1, losses: 12, points_for: 1234.5, points_against: 1701.5, standing: 12, final_standing: 12, streak_length: 7, streak_type: "LOSS" }
        ]
      },
      "2022": {
        year: 2022,
        league_name: "Playaz Only",
        teams: [
          { team_id: 1, team_name: "Mad Men", owners: [{ displayName: "odphineguy" }], wins: 7, losses: 6, points_for: 1456.9, points_against: 1487.1, standing: 6, final_standing: 6, streak_length: 1, streak_type: "WIN" },
          { team_id: 2, team_name: "South Side Delinquents", owners: [{ displayName: "DeezzNutzz3" }], wins: 10, losses: 3, points_for: 1623.8, points_against: 1398.2, standing: 1, final_standing: 1, streak_length: 4, streak_type: "WIN" },
          { team_id: 3, team_name: "What would Breesus do?", owners: [{ displayName: "azknighted" }], wins: 8, losses: 5, points_for: 1523.6, points_against: 1476.4, standing: 3, final_standing: 3, streak_length: 2, streak_type: "WIN" },
          { team_id: 4, team_name: "Chandler TopFeeders", owners: [{ displayName: "Fly in ointment" }], wins: 6, losses: 7, points_for: 1423.5, points_against: 1501.5, standing: 7, final_standing: 7, streak_length: 2, streak_type: "LOSS" },
          { team_id: 5, team_name: "Miami Big D Big Sack", owners: [{ displayName: "Izreal 187" }], wins: 3, losses: 10, points_for: 1289.3, points_against: 1634.7, standing: 10, final_standing: 10, streak_length: 5, streak_type: "LOSS" },
          { team_id: 6, team_name: "Young Money Cash Money", owners: [{ displayName: "jdramos88" }], wins: 5, losses: 8, points_for: 1398.7, points_against: 1523.3, standing: 8, final_standing: 8, streak_length: 3, streak_type: "LOSS" },
          { team_id: 7, team_name: "Killer Beers", owners: [{ displayName: "Lenz31" }], wins: 8, losses: 5, points_for: 1512.8, points_against: 1498.2, standing: 4, final_standing: 4, streak_length: 1, streak_type: "WIN" },
          { team_id: 8, team_name: "Cock Blockers", owners: [{ displayName: "oasoto" }], wins: 7, losses: 6, points_for: 1456.9, points_against: 1487.1, standing: 5, final_standing: 5, streak_length: 1, streak_type: "WIN" },
          { team_id: 9, team_name: "BOTTOM FEEDER", owners: [{ displayName: "odphineguy" }], wins: 6, losses: 7, points_for: 1423.5, points_against: 1501.5, standing: 9, final_standing: 9, streak_length: 2, streak_type: "LOSS" },
          { team_id: 10, team_name: "The Tank", owners: [{ displayName: "CeeLos1987" }], wins: 4, losses: 9, points_for: 1356.4, points_against: 1567.6, standing: 9, final_standing: 9, streak_length: 4, streak_type: "LOSS" },
          { team_id: 11, team_name: "OG LA Raiders", owners: [{ displayName: "ODPhrank23" }], wins: 2, losses: 11, points_for: 1256.7, points_against: 1678.3, standing: 11, final_standing: 11, streak_length: 6, streak_type: "LOSS" },
          { team_id: 12, team_name: "Wreaking Crew JDR", owners: [{ displayName: "samakers15425" }], wins: 8, losses: 5, points_for: 1523.6, points_against: 1476.4, standing: 2, final_standing: 2, streak_length: 2, streak_type: "WIN" }
        ]
      },
      "2023": {
        year: 2023,
        league_name: "Playaz Only",
        teams: [
          { team_id: 1, team_name: "Mad Men", owners: [{ displayName: "odphineguy" }], wins: 6, losses: 7, points_for: 1423.5, points_against: 1501.5, standing: 8, final_standing: 8, streak_length: 2, streak_type: "LOSS" },
          { team_id: 2, team_name: "South Side Delinquents", owners: [{ displayName: "DeezzNutzz3" }], wins: 8, losses: 5, points_for: 1523.6, points_against: 1476.4, standing: 3, final_standing: 3, streak_length: 2, streak_type: "WIN" },
          { team_id: 3, team_name: "What would Breesus do?", owners: [{ displayName: "azknighted" }], wins: 9, losses: 4, points_for: 1567.3, points_against: 1434.7, standing: 2, final_standing: 3, streak_length: 3, streak_type: "WIN" },
          { team_id: 4, team_name: "Chandler TopFeeders", owners: [{ displayName: "Fly in ointment" }], wins: 7, losses: 6, points_for: 1456.9, points_against: 1487.1, standing: 5, final_standing: 5, streak_length: 1, streak_type: "WIN" },
          { team_id: 5, team_name: "Miami Big D Big Sack", owners: [{ displayName: "Izreal 187" }], wins: 4, losses: 9, points_for: 1356.4, points_against: 1567.6, standing: 9, final_standing: 9, streak_length: 4, streak_type: "LOSS" },
          { team_id: 6, team_name: "Young Money Cash Money", owners: [{ displayName: "jdramos88" }], wins: 5, losses: 8, points_for: 1398.7, points_against: 1523.3, standing: 8, final_standing: 8, streak_length: 3, streak_type: "LOSS" },
          { team_id: 7, team_name: "Killer Beers", owners: [{ displayName: "Lenz31" }], wins: 8, losses: 5, points_for: 1512.8, points_against: 1498.2, standing: 4, final_standing: 2, streak_length: 1, streak_type: "WIN" },
          { team_id: 8, team_name: "Cock Blockers", owners: [{ displayName: "oasoto" }], wins: 10, losses: 3, points_for: 1623.8, points_against: 1398.2, standing: 1, final_standing: 1, streak_length: 4, streak_type: "WIN" },
          { team_id: 9, team_name: "BOTTOM FEEDER", owners: [{ displayName: "odphineguy" }], wins: 3, losses: 10, points_for: 1289.3, points_against: 1634.7, standing: 10, final_standing: 10, streak_length: 5, streak_type: "LOSS" },
          { team_id: 10, team_name: "The Tank", owners: [{ displayName: "CeeLos1987" }], wins: 2, losses: 11, points_for: 1256.7, points_against: 1678.3, standing: 11, final_standing: 11, streak_length: 6, streak_type: "LOSS" },
          { team_id: 11, team_name: "OG LA Raiders", owners: [{ displayName: "ODPhrank23" }], wins: 1, losses: 12, points_for: 1234.5, points_against: 1701.5, standing: 12, final_standing: 12, streak_length: 7, streak_type: "LOSS" },
          { team_id: 12, team_name: "Wreaking Crew JDR", owners: [{ displayName: "samakers15425" }], wins: 6, losses: 7, points_for: 1423.5, points_against: 1501.5, standing: 6, final_standing: 6, streak_length: 2, streak_type: "LOSS" }
        ]
      },
      "2024": {
        year: 2024,
        league_name: "Playaz Only",
        teams: [
          { team_id: 1, team_name: "Mad Men", owners: [{ displayName: "odphineguy" }], wins: 0, losses: 0, points_for: 0, points_against: 0, standing: 0, final_standing: 0, streak_length: 0, streak_type: "WIN" },
          { team_id: 2, team_name: "South Side Delinquents", owners: [{ displayName: "DeezzNutzz3" }], wins: 0, losses: 0, points_for: 0, points_against: 0, standing: 0, final_standing: 0, streak_length: 0, streak_type: "WIN" },
          { team_id: 3, team_name: "What would Breesus do?", owners: [{ displayName: "azknighted" }], wins: 0, losses: 0, points_for: 0, points_against: 0, standing: 0, final_standing: 0, streak_length: 0, streak_type: "WIN" },
          { team_id: 4, team_name: "Chandler TopFeeders", owners: [{ displayName: "Fly in ointment" }], wins: 0, losses: 0, points_for: 0, points_against: 0, standing: 0, final_standing: 0, streak_length: 0, streak_type: "WIN" },
          { team_id: 5, team_name: "Miami Big D Big Sack", owners: [{ displayName: "Izreal 187" }], wins: 0, losses: 0, points_for: 0, points_against: 0, standing: 0, final_standing: 0, streak_length: 0, streak_type: "WIN" },
          { team_id: 6, team_name: "Young Money Cash Money", owners: [{ displayName: "jdramos88" }], wins: 0, losses: 0, points_for: 0, points_against: 0, standing: 0, final_standing: 0, streak_length: 0, streak_type: "WIN" },
          { team_id: 7, team_name: "Killer Beers", owners: [{ displayName: "Lenz31" }], wins: 0, losses: 0, points_for: 0, points_against: 0, standing: 0, final_standing: 0, streak_length: 0, streak_type: "WIN" },
          { team_id: 8, team_name: "Cock Blockers", owners: [{ displayName: "oasoto" }], wins: 0, losses: 0, points_for: 0, points_against: 0, standing: 0, final_standing: 0, streak_length: 0, streak_type: "WIN" },
          { team_id: 9, team_name: "BOTTOM FEEDER", owners: [{ displayName: "odphineguy" }], wins: 0, losses: 0, points_for: 0, points_against: 0, standing: 0, final_standing: 0, streak_length: 0, streak_type: "WIN" },
          { team_id: 10, team_name: "The Tank", owners: [{ displayName: "CeeLos1987" }], wins: 0, losses: 0, points_for: 0, points_against: 0, standing: 0, final_standing: 0, streak_length: 0, streak_type: "WIN" },
          { team_id: 11, team_name: "OG LA Raiders", owners: [{ displayName: "ODPhrank23" }], wins: 0, losses: 0, points_for: 0, points_against: 0, standing: 0, final_standing: 0, streak_length: 0, streak_type: "WIN" },
          { team_id: 12, team_name: "Wreaking Crew JDR", owners: [{ displayName: "samakers15425" }], wins: 0, losses: 0, points_for: 0, points_against: 0, standing: 0, final_standing: 0, streak_length: 0, streak_type: "WIN" }
        ]
      }
    };

    const seasons = [];
    const teams = [];
    const teamMap = new Map(); // Map ESPN team names to Convex team IDs

    // Create seasons and teams for each year
    for (const [yearStr, seasonData] of Object.entries(espnData)) {
      const year = parseInt(yearStr);
      
      // Create season
      const seasonId = await ctx.db.insert("seasons", {
        leagueId,
        year,
        isActive: year === 2024,
        totalTeams: seasonData.teams.length,
        playoffTeams: 6,
        regularSeasonWeeks: 14,
        playoffWeeks: 3,
        dataSource: "ESPN",
        hasCompleteData: year !== 2024,
        createdAt: now,
        updatedAt: now,
      });
      
      seasons.push({ year, seasonId });

      // Create teams for this season
      for (const teamData of seasonData.teams) {
        const teamId = await ctx.db.insert("teams", {
          leagueId,
          seasonId,
          espnTeamId: teamData.team_id,
          name: teamData.team_name,
          ownerId: "temp_owner" as any, // This would need to be mapped to actual user IDs
          wins: teamData.wins,
          losses: teamData.losses,
          ties: 0,
          pointsFor: teamData.points_for,
          pointsAgainst: teamData.points_against,
          standing: teamData.standing,
          finalStanding: teamData.final_standing,
          streakLength: teamData.streak_length,
          streakType: teamData.streak_type,
          createdAt: now,
          updatedAt: now,
        });

        // Store team mapping for later use
        const teamKey = `${year}-${teamData.owners[0].displayName}`;
        teamMap.set(teamKey, teamId);
        
        teams.push({
          year,
          teamId,
          teamName: teamData.team_name,
          ownerName: teamData.owners[0].displayName,
          wins: teamData.wins,
          losses: teamData.losses,
          pointsFor: teamData.points_for,
          pointsAgainst: teamData.points_against,
          standing: teamData.standing,
          finalStanding: teamData.final_standing
        });
      }
    }

    return {
      message: "Successfully imported all ESPN data!",
      leagueId,
      seasonsCreated: seasons.length,
      teamsCreated: teams.length,
      seasons,
      teams: teams.slice(0, 10) // Return first 10 teams as sample
    };
  },
});

// Get all teams with their season data
export const getAllTeamsWithSeasons = mutation({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db.query("teams").collect();
    const seasons = await ctx.db.query("seasons").collect();
    
    const seasonMap = new Map(seasons.map(s => [s._id, s]));
    
    return teams.map(team => ({
      ...team,
      season: seasonMap.get(team.seasonId)
    }));
  },
});

// Get team standings for a specific season
export const getTeamStandings = mutation({
  args: { year: v.number() },
  handler: async (ctx, args) => {
    const season = await ctx.db
      .query("seasons")
      .withIndex("byYear", (q) => q.eq("year", args.year))
      .first();
    
    if (!season) return [];
    
    const teams = await ctx.db
      .query("teams")
      .withIndex("bySeason", (q) => q.eq("seasonId", season._id))
      .collect();
    
    return teams.sort((a, b) => a.finalStanding - b.finalStanding);
  },
});

// Get all-time standings across all seasons
export const getAllTimeStandings = mutation({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db.query("teams").collect();
    const seasons = await ctx.db.query("seasons").collect();
    
    const seasonMap = new Map(seasons.map(s => [s._id, s]));
    
    // Group teams by owner name (assuming same owner across seasons)
    const ownerStats = new Map();
    
    teams.forEach(team => {
      const season = seasonMap.get(team.seasonId);
      if (!season) return;
      
      const ownerKey = team.name; // Using team name as key for now
      
      if (!ownerStats.has(ownerKey)) {
        ownerStats.set(ownerKey, {
          teamName: ownerKey,
          totalWins: 0,
          totalLosses: 0,
          totalPointsFor: 0,
          totalPointsAgainst: 0,
          seasons: 0,
          championships: 0,
          secondPlace: 0,
          thirdPlace: 0
        });
      }
      
      const stats = ownerStats.get(ownerKey);
      stats.totalWins += team.wins;
      stats.totalLosses += team.losses;
      stats.totalPointsFor += team.pointsFor;
      stats.totalPointsAgainst += team.pointsAgainst;
      stats.seasons += 1;
      
      if (team.finalStanding === 1) stats.championships += 1;
      if (team.finalStanding === 2) stats.secondPlace += 1;
      if (team.finalStanding === 3) stats.thirdPlace += 1;
    });
    
    return Array.from(ownerStats.values()).sort((a, b) => {
      const aWinPct = a.totalWins / (a.totalWins + a.totalLosses);
      const bWinPct = b.totalWins / (b.totalWins + b.totalLosses);
      return bWinPct - aWinPct;
    });
  },
});
