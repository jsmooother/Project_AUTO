/**
 * ExtractorEngine: select extractor by profile.extract.vertical (vehicle | generic).
 */

import type { SiteProfile } from "@repo/shared";
import type { FetchResult } from "../drivers/types.js";
import { extractGeneric } from "./generic.js";
import { extractVehicle } from "./vehicle.js";
import type { ExtractResult } from "./types.js";

export type { ExtractResult } from "./types.js";

export interface ExtractInput {
  profile: SiteProfile;
  fetchResult: FetchResult;
}

export function extract(input: ExtractInput): ExtractResult {
  const { profile, fetchResult } = input;
  const vertical = profile.extract?.vertical ?? "generic";
  if (vertical === "vehicle") {
    return extractVehicle(fetchResult);
  }
  return extractGeneric(fetchResult);
}
