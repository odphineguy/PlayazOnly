/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as cleanupFields from "../cleanupFields.js";
import type * as draftAnalysis from "../draftAnalysis.js";
import type * as draftData from "../draftData.js";
import type * as espnImport from "../espnImport.js";
import type * as fantasyFootball from "../fantasyFootball.js";
import type * as http from "../http.js";
import type * as importAllEspnData from "../importAllEspnData.js";
import type * as importDraftData from "../importDraftData.js";
import type * as importPlayerStats from "../importPlayerStats.js";
import type * as migrations from "../migrations.js";
import type * as paymentAttemptTypes from "../paymentAttemptTypes.js";
import type * as paymentAttempts from "../paymentAttempts.js";
import type * as positionAnalysis from "../positionAnalysis.js";
import type * as teamStats from "../teamStats.js";
import type * as users from "../users.js";
import type * as vorCache from "../vorCache.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  cleanupFields: typeof cleanupFields;
  draftAnalysis: typeof draftAnalysis;
  draftData: typeof draftData;
  espnImport: typeof espnImport;
  fantasyFootball: typeof fantasyFootball;
  http: typeof http;
  importAllEspnData: typeof importAllEspnData;
  importDraftData: typeof importDraftData;
  importPlayerStats: typeof importPlayerStats;
  migrations: typeof migrations;
  paymentAttemptTypes: typeof paymentAttemptTypes;
  paymentAttempts: typeof paymentAttempts;
  positionAnalysis: typeof positionAnalysis;
  teamStats: typeof teamStats;
  users: typeof users;
  vorCache: typeof vorCache;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
