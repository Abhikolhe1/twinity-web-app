/** B2B Campaign funnel — mock data (BRD-aligned, static). */

export type CampaignTypeId =
  | "product_launch"
  | "brand_awareness"
  | "app_promotion"
  | "seasonal_offer"
  | "ugc_style"
  | "custom_commercial";

export type CampaignType = {
  id: CampaignTypeId;
  title: string;
  description: string;
  fromSar: number;
  icon: string;
};

export const CAMPAIGN_TYPES: CampaignType[] = [
  {
    id: "product_launch",
    icon: "🚀",
    title: "Product Launch",
    description: "High-impact launch spots with talent-led credibility.",
    fromSar: 8999,
  },
  {
    id: "brand_awareness",
    icon: "📣",
    title: "Brand Awareness",
    description: "Reach and recall across paid social and owned channels.",
    fromSar: 6999,
  },
  {
    id: "app_promotion",
    icon: "📲",
    title: "App Promotion",
    description: "Install-focused creative with clear store CTAs.",
    fromSar: 7999,
  },
  {
    id: "seasonal_offer",
    icon: "🎁",
    title: "Seasonal Offer",
    description: "Time-boxed offers with compliant promotional messaging.",
    fromSar: 5999,
  },
  {
    id: "ugc_style",
    icon: "🎥",
    title: "UGC Style Ad",
    description: "Authentic handheld feel with governed usage rights.",
    fromSar: 7499,
  },
  {
    id: "custom_commercial",
    icon: "✨",
    title: "Custom Commercial Request",
    description: "Bespoke creative with legal review and manager routing.",
    fromSar: 12999,
  },
];

export type CampaignTemplateFilter =
  | "All"
  | "Cinematic"
  | "UGC"
  | "Product"
  | "Brand Story"
  | "Social";

export type CampaignTemplate = {
  id: string;
  name: string;
  durationLabel: string;
  filter: CampaignTemplateFilter;
  from: string;
  to: string;
};

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  { id: "ct1", name: "Product Launch", durationLabel: "0:30", filter: "Product", from: "#1e3a5f", to: "#0f172a" },
  { id: "ct2", name: "Founder Message", durationLabel: "0:45", filter: "Brand Story", from: "#312e81", to: "#1e1b4b" },
  { id: "ct3", name: "UGC Testimonial", durationLabel: "0:25", filter: "UGC", from: "#422006", to: "#1c1917" },
  { id: "ct4", name: "App Promo", durationLabel: "0:20", filter: "Social", from: "#134e4a", to: "#042f2e" },
  { id: "ct5", name: "Brand Story", durationLabel: "0:60", filter: "Brand Story", from: "#4c0519", to: "#2a0410" },
  { id: "ct6", name: "Offer Push", durationLabel: "0:15", filter: "Social", from: "#713f12", to: "#422006" },
];

export type CampaignCelebrityFilter = "All" | "Music" | "Entertainment" | "Sports" | "TV" | "Business";

export type CampaignCelebrity = {
  id: string;
  name: string;
  categoryTag: string;
  filter: CampaignCelebrityFilter;
  priceFromSar: number;
  imageUrl: string;
};

export const CAMPAIGN_CELEBRITIES: CampaignCelebrity[] = [
  {
    id: "cb1",
    name: "Rashed Al Majed",
    categoryTag: "Singer",
    filter: "Music",
    priceFromSar: 24999,
    imageUrl: "https://picsum.photos/seed/camp-rashed/400/400",
  },
  {
    id: "cb2",
    name: "Abadi Al Johar",
    categoryTag: "Singer",
    filter: "Music",
    priceFromSar: 22999,
    imageUrl: "https://picsum.photos/seed/camp-abadi/400/400",
  },
  {
    id: "cb3",
    name: "Majed Al Mohandes",
    categoryTag: "Singer",
    filter: "Music",
    priceFromSar: 27999,
    imageUrl: "https://picsum.photos/seed/camp-majed/400/400",
  },
  {
    id: "cb4",
    name: "Nawal Al Kuwaitia",
    categoryTag: "Singer",
    filter: "Music",
    priceFromSar: 25999,
    imageUrl: "https://picsum.photos/seed/camp-nawal/400/400",
  },
  {
    id: "cb5",
    name: "Mohammed Abdu",
    categoryTag: "Singer",
    filter: "Music",
    priceFromSar: 34999,
    imageUrl: "https://picsum.photos/seed/camp-abdu/400/400",
  },
  {
    id: "cb6",
    name: "Aseel Abu Bakr",
    categoryTag: "Actor",
    filter: "Entertainment",
    priceFromSar: 18999,
    imageUrl: "https://picsum.photos/seed/camp-aseel/400/400",
  },
];

export type LicenseChannel = "Instagram" | "TikTok" | "YouTube" | "Snapchat" | "Website" | "TV";
export type LicenseDuration = "1 week" | "1 month" | "3 months" | "6 months" | "1 year";
export type LicenseTerritory = "Saudi Arabia" | "GCC" | "MENA" | "Global";
export type LicenseExclusivity = "none" | "category" | "brand" | "territory";
export type LicenseSla = "standard" | "priority" | "urgent";

export type LicenseScope = {
  channels: LicenseChannel[];
  duration: LicenseDuration;
  territory: LicenseTerritory;
  exclusivity: LicenseExclusivity;
  sla: LicenseSla;
};

export const DEFAULT_LICENSE_SCOPE: LicenseScope = {
  channels: ["Instagram", "YouTube"],
  duration: "1 month",
  territory: "Saudi Arabia",
  exclusivity: "none",
  sla: "standard",
};

export const VAT_RATE = 0.15;

export function getCampaignType(id: CampaignTypeId | null) {
  if (!id) return undefined;
  return CAMPAIGN_TYPES.find((t) => t.id === id);
}

export function getCampaignTemplate(id: string | null) {
  if (!id) return undefined;
  return CAMPAIGN_TEMPLATES.find((t) => t.id === id);
}

export function getCampaignCelebrity(id: string | null) {
  if (!id) return undefined;
  return CAMPAIGN_CELEBRITIES.find((c) => c.id === id);
}

export function estimateCampaignSubtotal(
  campaignTypeId: CampaignTypeId | null,
  celebrityFrom: number,
  scope: LicenseScope,
): number {
  const typeBase = getCampaignType(campaignTypeId)?.fromSar ?? 7999;
  const base = Math.max(typeBase, celebrityFrom);
  const channelFactor = 1 + Math.max(0, scope.channels.length - 1) * 0.08;
  const durationFactor =
    scope.duration === "1 week"
      ? 0.85
      : scope.duration === "1 month"
        ? 1
        : scope.duration === "3 months"
          ? 1.35
          : scope.duration === "6 months"
            ? 1.75
            : 2.2;
  const territoryFactor =
    scope.territory === "Saudi Arabia" ? 1 : scope.territory === "GCC" ? 1.12 : scope.territory === "MENA" ? 1.28 : 1.55;
  const exclusivityFactor =
    scope.exclusivity === "none" ? 1 : scope.exclusivity === "category" ? 1.08 : scope.exclusivity === "brand" ? 1.18 : 1.12;
  const slaFactor = scope.sla === "standard" ? 1 : scope.sla === "priority" ? 1.12 : 1.28;
  return Math.round(base * channelFactor * durationFactor * territoryFactor * exclusivityFactor * slaFactor);
}

export function withVat(subtotal: number) {
  const vat = Math.round(subtotal * VAT_RATE * 100) / 100;
  const total = Math.round((subtotal + vat) * 100) / 100;
  return { subtotal, vat, total };
}
