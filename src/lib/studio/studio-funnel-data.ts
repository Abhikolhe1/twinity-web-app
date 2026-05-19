/** Hardcoded funnel content — Twinity Client Studio (campaign guest flow). */

export type FunnelServiceId = "greeting" | "campaign" | "custom" | "image-ad";

export type TemplateItem = {
  id: string;
  name: string;
  durationLabel: string;
  category: "Cinematic" | "UGC Style" | "Product Promo" | "Brand Story";
  gradientFrom: string;
  gradientTo: string;
};

export const TEMPLATE_ITEMS: TemplateItem[] = [
  {
    id: "t1",
    name: "PRODUCT LAUNCH",
    durationLabel: "0:30",
    category: "Cinematic",
    gradientFrom: "#2d1b69",
    gradientTo: "#0f172a",
  },
  {
    id: "t2",
    name: "BRAND STORY",
    durationLabel: "0:45",
    category: "Brand Story",
    gradientFrom: "#1e3a5f",
    gradientTo: "#0c1929",
  },
  {
    id: "t3",
    name: "UGC UNBOXING",
    durationLabel: "0:20",
    category: "UGC Style",
    gradientFrom: "#422006",
    gradientTo: "#1c0a02",
  },
  {
    id: "t4",
    name: "PRODUCT PROMO",
    durationLabel: "0:15",
    category: "Product Promo",
    gradientFrom: "#14532d",
    gradientTo: "#052e16",
  },
  {
    id: "t5",
    name: "RAMADAN SPOT",
    durationLabel: "0:40",
    category: "Cinematic",
    gradientFrom: "#4c1d95",
    gradientTo: "#1e1b4b",
  },
  {
    id: "t6",
    name: "LIFESTYLE CUT",
    durationLabel: "0:25",
    category: "UGC Style",
    gradientFrom: "#831843",
    gradientTo: "#3f0d1f",
  },
];

export type FunnelCelebrity = {
  id: string;
  name: string;
  category: string;
  filter: "Sports" | "Music" | "Entertainment" | "Business" | "TV";
  priceFromSar: number;
  imageUrl: string;
};

export const FUNNEL_CELEBRITIES: FunnelCelebrity[] = [
  {
    id: "fc1",
    name: "Rashed Al Majed",
    category: "Music",
    filter: "Music",
    priceFromSar: 499,
    imageUrl: "https://picsum.photos/seed/twinity-fc1/400/400",
  },
  {
    id: "fc2",
    name: "Ahlam Al Shamsi",
    category: "Entertainment",
    filter: "Entertainment",
    priceFromSar: 799,
    imageUrl: "https://picsum.photos/seed/twinity-fc2/400/400",
  },
  {
    id: "fc3",
    name: "Yasser Al Qahtani",
    category: "Sports",
    filter: "Sports",
    priceFromSar: 899,
    imageUrl: "https://picsum.photos/seed/twinity-fc3/400/400",
  },
  {
    id: "fc4",
    name: "Muna AbuSulayman",
    category: "Business",
    filter: "Business",
    priceFromSar: 1299,
    imageUrl: "https://picsum.photos/seed/twinity-fc4/400/400",
  },
  {
    id: "fc5",
    name: "Abdullah Al Sadhan",
    category: "TV",
    filter: "TV",
    priceFromSar: 649,
    imageUrl: "https://picsum.photos/seed/twinity-fc5/400/400",
  },
  {
    id: "fc6",
    name: "Balqees Fathi",
    category: "Music",
    filter: "Music",
    priceFromSar: 949,
    imageUrl: "https://picsum.photos/seed/twinity-fc6/400/400",
  },
];

export function getFunnelTemplateById(id: string | null): TemplateItem | undefined {
  if (!id) return undefined;
  return TEMPLATE_ITEMS.find((t) => t.id === id);
}

export function getFunnelCelebrityById(id: string | null): FunnelCelebrity | undefined {
  if (!id) return undefined;
  return FUNNEL_CELEBRITIES.find((c) => c.id === id);
}

export function serviceLabel(id: FunnelServiceId | null): string {
  if (id === "greeting")  return "Greeting Video";
  if (id === "campaign")  return "Ad Campaign";
  if (id === "custom")    return "Custom Request";
  if (id === "image-ad")  return "Image Ad";
  return "—";
}

