/** Client Studio — placeholder types (BRD-aligned naming). */

export type StudioServiceId = "greeting" | "campaign" | "custom";

export type CelebrityCategory =
  | "sports"
  | "entertainment"
  | "music"
  | "business"
  | "tv"
  | "all";

export type CelebrityAvailability = "available" | "on_hold";

export type CelebrityPlaceholder = {
  id: string;
  name: string;
  initials: string;
  category: CelebrityCategory;
  categoryLabel: string;
  priceFromSar: number;
  availability: CelebrityAvailability;
};

export type StudioUserPlaceholder = {
  displayName: string;
  email: string;
};
