/** Shared types, constants, and pricing logic for the Image Ad service. */

export type AspectRatio  = "1:1" | "4:5" | "16:9" | "9:16";
export type UsageChannel =
  | "Social Media"
  | "Digital Advertising"
  | "Website & Web Banners"
  | "Email Marketing"
  | "Print"
  | "Broadcast";
export type Duration  = "6 months" | "12 months" | "24 months" | "Perpetual";
export type Territory = "Saudi Arabia" | "GCC" | "MENA" | "Worldwide";
export type RefImage  = { id: string; name: string; size: string; objectUrl?: string };

export type AdImageBrief = {
  style?:           string;
  aspectRatio?:     AspectRatio;
  prompt?:          string;
  refImages?:       RefImage[];
  usageChannels?:   UsageChannel[];
  licenseDuration?: Duration;
  territory?:       Territory;
  exclusivity?:     boolean;
};

export type AdPricingResult = {
  base:  number;
  dur:   number;
  ter:   number;
  excl:  number;
  sub:   number;
  vat:   number;
  total: number;
} | null;

export const BASE_PRICE = 999;
export const VAT_RATE   = 0.15;

export const DURATION_SURCHARGE: Record<Duration, number | null> = {
  "6 months":  0,
  "12 months": 299,
  "24 months": 599,
  "Perpetual": null,
};

export const TERRITORY_SURCHARGE: Record<Territory, number> = {
  "Saudi Arabia": 0,
  GCC:            199,
  MENA:           399,
  Worldwide:      799,
};

export type StyleOption = {
  id:       string;
  label:    string;
  sub:      string;
  iconName: "Film" | "BookOpen" | "Package" | "Sun" | "Star";
};

export const STYLE_OPTIONS: StyleOption[] = [
  { id: "cinematic",  label: "Cinematic Portrait",  sub: "Dramatic lighting, premium film quality",       iconName: "Film"     },
  { id: "editorial",  label: "Editorial / Magazine", sub: "Clean, fashion-forward, editorial feel",        iconName: "BookOpen" },
  { id: "product",    label: "Product Integration",  sub: "Celebrity with your product, commercial focus", iconName: "Package"  },
  { id: "lifestyle",  label: "Lifestyle / Candid",   sub: "Natural, authentic, approachable",              iconName: "Sun"      },
  { id: "ambassador", label: "Brand Ambassador",     sub: "Confident, aspirational, brand-centric",        iconName: "Star"     },
];

export const ASPECT_RATIO_SPECS = [
  { id: "1:1"  as AspectRatio, label: "1:1 Square",   sub: "Instagram feed",       w: 56, h: 56 },
  { id: "4:5"  as AspectRatio, label: "4:5 Portrait",  sub: "Instagram portrait",   w: 48, h: 60 },
  { id: "16:9" as AspectRatio, label: "16:9 Wide",     sub: "Web banner / YouTube", w: 72, h: 40 },
  { id: "9:16" as AspectRatio, label: "9:16 Story",    sub: "Stories / Reels",      w: 40, h: 72 },
] as const;

export const USAGE_CHANNELS: UsageChannel[] = [
  "Social Media",
  "Digital Advertising",
  "Website & Web Banners",
  "Email Marketing",
  "Print",
  "Broadcast",
];

export const DURATIONS:   Duration[]  = ["6 months", "12 months", "24 months", "Perpetual"];
export const TERRITORIES: Territory[] = ["Saudi Arabia", "GCC", "MENA", "Worldwide"];

export const PROMPT_SUGGESTIONS = [
  "Brand ambassador with product",
  "Editorial lifestyle setting",
  "Luxury product endorsement",
  "Urban street style campaign",
] as const;

export function calcAdImagePrice(brief: Partial<AdImageBrief>): AdPricingResult {
  const dur = DURATION_SURCHARGE[brief.licenseDuration ?? "12 months"];
  if (dur === null) return null; // Perpetual = contact pricing
  const ter       = TERRITORY_SURCHARGE[brief.territory ?? "Saudi Arabia"];
  const sub       = BASE_PRICE + dur + ter;
  const excl      = brief.exclusivity ? Math.round(sub * 0.5) : 0;
  const totalBase = sub + excl;
  const vat       = Math.round(totalBase * VAT_RATE * 100) / 100;
  const total     = Math.round(totalBase * (1 + VAT_RATE) * 100) / 100;
  return { base: BASE_PRICE, dur, ter, excl, sub, vat, total };
}
