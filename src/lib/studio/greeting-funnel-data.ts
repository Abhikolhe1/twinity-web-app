/** Greeting funnel — hardcoded content (MASTER-aligned). */

export type GreetingOccasionId =
  | "birthday"
  | "congratulations"
  | "ramadan_eid"
  | "graduation"
  | "new_baby"
  | "custom_occasion";

export type GreetingOccasion = {
  id: GreetingOccasionId;
  icon: string;
  label: string;
  description: string;
};

export const GREETING_OCCASIONS: GreetingOccasion[] = [
  { id: "birthday", icon: "🎂", label: "Birthday", description: "Celebrate someone's special day" },
  {
    id: "congratulations",
    icon: "💍",
    label: "Congratulations",
    description: "Milestones, weddings, promotions",
  },
  { id: "ramadan_eid", icon: "🌙", label: "Ramadan / Eid", description: "Islamic holiday blessings" },
  { id: "graduation", icon: "🎓", label: "Graduation", description: "Honor their achievement" },
  { id: "new_baby", icon: "👶", label: "New Baby", description: "Welcome a new arrival" },
  { id: "custom_occasion", icon: "✨", label: "Custom", description: "Any other occasion or message" },
];

export type GreetingTemplateFilter = "All" | "Classic" | "Fun & Energetic" | "Emotional" | "Elegant";

export type GreetingTemplate = {
  id: string;
  name: string;
  durationLabel: string;
  filter: GreetingTemplateFilter;
  /** Warm gradient stops */
  from: string;
  to: string;
};

export const GREETING_TEMPLATES: GreetingTemplate[] = [
  { id: "gt1", name: "BIRTHDAY CLASSIC", durationLabel: "0:20", filter: "Classic", from: "#7c2d12", to: "#431407" },
  { id: "gt2", name: "BIRTHDAY FUN", durationLabel: "0:30", filter: "Fun & Energetic", from: "#ea580c", to: "#7c2d12" },
  { id: "gt3", name: "ELEGANT GREETING", durationLabel: "0:30", filter: "Elegant", from: "#9d174d", to: "#4c0519" },
  { id: "gt4", name: "KIDS GREETING", durationLabel: "0:20", filter: "Fun & Energetic", from: "#ca8a04", to: "#713f12" },
  { id: "gt5", name: "RAMADAN SPECIAL", durationLabel: "0:30", filter: "Emotional", from: "#0f766e", to: "#134e4a" },
  { id: "gt6", name: "CONGRATULATIONS", durationLabel: "0:25", filter: "Classic", from: "#be185d", to: "#500724" },
];

export type GreetingCelebrityFilter = "All" | "Music" | "Entertainment" | "Sports" | "TV" | "Business";

export type GreetingCelebrity = {
  id: string;
  name: string;
  categoryTag: string;
  filter: GreetingCelebrityFilter;
  priceFromSar: number;
  deliveryLabel: string;
  imageUrl: string;
};

export const GREETING_CELEBRITIES: GreetingCelebrity[] = [
  {
    id: "g1",
    name: "Rashed Al Majed",
    categoryTag: "Singer",
    filter: "Music",
    priceFromSar: 699,
    deliveryLabel: "1–2 Days",
    imageUrl: "https://picsum.photos/seed/greet-rashed/400/400",
  },
  {
    id: "g2",
    name: "Abadi Al Johar",
    categoryTag: "Singer",
    filter: "Music",
    priceFromSar: 599,
    deliveryLabel: "1–2 Days",
    imageUrl: "https://picsum.photos/seed/greet-abadi/400/400",
  },
  {
    id: "g3",
    name: "Majed Al Mohandes",
    categoryTag: "Singer",
    filter: "Music",
    priceFromSar: 799,
    deliveryLabel: "1–2 Days",
    imageUrl: "https://picsum.photos/seed/greet-majed/400/400",
  },
  {
    id: "g4",
    name: "Nawal Al Kuwaitia",
    categoryTag: "Singer",
    filter: "Music",
    priceFromSar: 699,
    deliveryLabel: "1–2 Days",
    imageUrl: "https://picsum.photos/seed/greet-nawal/400/400",
  },
  {
    id: "g5",
    name: "Mohammed Abdu",
    categoryTag: "Singer",
    filter: "Music",
    priceFromSar: 999,
    deliveryLabel: "1–2 Days",
    imageUrl: "https://picsum.photos/seed/greet-abdu/400/400",
  },
  {
    id: "g6",
    name: "Aseel Abu Bakr",
    categoryTag: "Actor",
    filter: "Entertainment",
    priceFromSar: 499,
    deliveryLabel: "1–2 Days",
    imageUrl: "https://picsum.photos/seed/greet-aseel/400/400",
  },
];

export function getGreetingOccasion(id: GreetingOccasionId | null): GreetingOccasion | undefined {
  if (!id) return undefined;
  return GREETING_OCCASIONS.find((o) => o.id === id);
}

export function getGreetingTemplate(id: string | null): GreetingTemplate | undefined {
  if (!id) return undefined;
  return GREETING_TEMPLATES.find((t) => t.id === id);
}

export function getGreetingCelebrity(id: string | null): GreetingCelebrity | undefined {
  if (!id) return undefined;
  return GREETING_CELEBRITIES.find((c) => c.id === id);
}

/** Base price SAR 299; VAT 15% for checkout display */
export const GREETING_BASE_SAR = 299;
export const GREETING_VAT_RATE = 0.15;
export const GREETING_TOTAL_SAR = Math.round(GREETING_BASE_SAR * (1 + GREETING_VAT_RATE) * 100) / 100;
