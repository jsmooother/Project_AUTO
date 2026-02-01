/**
 * Drivers: HTTP (browserless) and Headless (stub).
 * getDriver(profile) returns the driver for profile.fetch.driver.
 */

import type { SiteProfile } from "@repo/shared";
import { createHttpDriver } from "./httpDriver.js";
import { createHeadlessDriver } from "./headlessDriver.js";
import type { Driver } from "./types.js";

export type { Driver, FetchResult, FetchOptions, FetchTrace } from "./types.js";
export { createHttpDriver } from "./httpDriver.js";
export { createHeadlessDriver, HEADLESS_DISABLED_CODE } from "./headlessDriver.js";

export function getDriver(profile: SiteProfile): Driver {
  const driverType = profile.fetch?.driver ?? "http";
  if (driverType === "headless") {
    return createHeadlessDriver();
  }
  return createHttpDriver();
}
