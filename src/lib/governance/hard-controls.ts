/**
 * Twinity non-negotiable hard controls (BRD v3.1).
 * Reference for server-side enforcement; not a substitute for checks in services.
 */
export const HARD_CONTROLS = [
  "no_raw_identity_asset_export",
  "no_browser_exposed_api_keys",
  "payment_before_production",
  "no_output_before_approval",
  "no_real_celebrity_likeness_in_sandbox",
  "no_unrestricted_generation",
] as const;

export type HardControlId = (typeof HARD_CONTROLS)[number];
