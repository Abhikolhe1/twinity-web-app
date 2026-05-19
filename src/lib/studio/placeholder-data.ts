import type { CelebrityPlaceholder, StudioUserPlaceholder } from "./types";

export const STUDIO_USER_PLACEHOLDER: StudioUserPlaceholder = {
  displayName: "Ahmed Al-Rashid",
  email: "ahmed@example.com",
};

export const CELEBRITY_PLACEHOLDERS: CelebrityPlaceholder[] = [
  {
    id: "c1",
    name: "Khalid Al-Otaibi",
    initials: "KO",
    category: "sports",
    categoryLabel: "Sports",
    priceFromSar: 499,
    availability: "available",
  },
  {
    id: "c2",
    name: "Layla Al-Mutairi",
    initials: "LM",
    category: "entertainment",
    categoryLabel: "Entertainment",
    priceFromSar: 799,
    availability: "available",
  },
  {
    id: "c3",
    name: "Faisal Al-Dosari",
    initials: "FD",
    category: "music",
    categoryLabel: "Music",
    priceFromSar: 599,
    availability: "on_hold",
  },
  {
    id: "c4",
    name: "Nora Al-Qahtani",
    initials: "NQ",
    category: "tv",
    categoryLabel: "TV",
    priceFromSar: 899,
    availability: "available",
  },
  {
    id: "c5",
    name: "Omar Al-Ghamdi",
    initials: "OG",
    category: "business",
    categoryLabel: "Business",
    priceFromSar: 1299,
    availability: "available",
  },
  {
    id: "c6",
    name: "Hessa Al-Zahrani",
    initials: "HZ",
    category: "entertainment",
    categoryLabel: "Entertainment",
    priceFromSar: 699,
    availability: "available",
  },
  {
    id: "c7",
    name: "Turki Al-Malki",
    initials: "TM",
    category: "sports",
    categoryLabel: "Sports",
    priceFromSar: 449,
    availability: "on_hold",
  },
  {
    id: "c8",
    name: "Reem Al-Shammari",
    initials: "RS",
    category: "music",
    categoryLabel: "Music",
    priceFromSar: 949,
    availability: "available",
  },
];

export function getCelebrityById(id: string): CelebrityPlaceholder | undefined {
  return CELEBRITY_PLACEHOLDERS.find((c) => c.id === id);
}
