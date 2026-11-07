/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as clock from "../clock.js";
import type * as cms from "../cms.js";
import type * as crons from "../crons.js";
import type * as dana from "../dana.js";
import type * as itihasa from "../itihasa.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_content from "../lib/content.js";
import type * as lib_logic from "../lib/logic.js";
import type * as lib_privacy from "../lib/privacy.js";
import type * as lib_time from "../lib/time.js";
import type * as lib_validators from "../lib/validators.js";
import type * as mandala from "../mandala.js";
import type * as profiles from "../profiles.js";
import type * as sadhana from "../sadhana.js";
import type * as sangha from "../sangha.js";
import type * as seed from "../seed.js";
import type * as wisdom from "../wisdom.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  clock: typeof clock;
  cms: typeof cms;
  crons: typeof crons;
  dana: typeof dana;
  itihasa: typeof itihasa;
  "lib/auth": typeof lib_auth;
  "lib/content": typeof lib_content;
  "lib/logic": typeof lib_logic;
  "lib/privacy": typeof lib_privacy;
  "lib/time": typeof lib_time;
  "lib/validators": typeof lib_validators;
  mandala: typeof mandala;
  profiles: typeof profiles;
  sadhana: typeof sadhana;
  sangha: typeof sangha;
  seed: typeof seed;
  wisdom: typeof wisdom;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
