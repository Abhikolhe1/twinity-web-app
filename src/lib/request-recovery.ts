import type { FunnelCelebrity } from "@/lib/studio/studio-funnel-data";

export const IMAGE_AD_RESUME_STORAGE_KEY = "twinity_image_ad_resume";

export type ImageAdResumeDraft = {
  requestId: string;
  orderId: string;
  celebrity: FunnelCelebrity;
  prompt: string;
  style?: string;
  aspectRatio: string;
  channels: string[];
  duration?: string;
  territory?: string;
  exclusivity?: boolean;
  estimatedPrice?: number;
  validationReason?: string;
};

type RawImageAdJob = {
  reference_id: string;
  celebrity_id?: string;
  script?: string;
  aspect_ratio?: string;
  channels?: string[];
  scene_notes?: string;
  estimated_price?: number;
  error_message?: string;
  celebrity?: {
    name?: string;
    thumbnail_url?: string;
  };
};

function cleanWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function industryToFilter(industry: string): FunnelCelebrity["filter"] {
  const value = industry.toLowerCase();
  if (value.includes("sport") || value.includes("athlete") || value.includes("football")) return "Sports";
  if (value.includes("music") || value.includes("singer") || value.includes("artist")) return "Music";
  if (value.includes("business") || value.includes("entrepreneur")) return "Business";
  if (value.includes("tv") || value.includes("television") || value.includes("host")) return "TV";
  return "Entertainment";
}

function extractScope(sceneNotes?: string): {
  style?: string;
  duration?: string;
  territory?: string;
  exclusivity?: boolean;
} {
  const notes = sceneNotes ?? "";
  const style = notes.match(/Visual style:\s*([^.]*)/i)?.[1]?.trim();
  const duration = notes.match(/License duration:\s*([^.]*)/i)?.[1]?.trim();
  const territory = notes.match(/Territory:\s*([^.]*)/i)?.[1]?.trim();
  const exclusivityValue = notes.match(/Exclusivity:\s*([^.]*)/i)?.[1]?.trim().toLowerCase();

  return {
    style,
    duration,
    territory,
    exclusivity:
      exclusivityValue === "true" ? true :
      exclusivityValue === "false" ? false :
      undefined,
  };
}

export function formatValidationReason(raw?: string): string | undefined {
  if (!raw) return undefined;

  const normalized = cleanWhitespace(raw);
  const lower = normalized.toLowerCase();

  if (lower.includes("resource_exhausted") || lower.includes("quota exceeded")) {
    return "Image generation could not be completed because the provider quota was temporarily exceeded. Review your brief and resubmit in a moment.";
  }

  if (lower.includes("billing details")) {
    return "Image generation is temporarily unavailable because the provider billing or quota limit was reached. Please review and resubmit shortly.";
  }

  if (lower.includes("safety") || lower.includes("policy")) {
    return "Your request was paused by an automated safety or policy check. Review the brief and remove anything that could trigger policy restrictions before resubmitting.";
  }

  if (lower.includes("timed out") || lower.includes("timeout")) {
    return "Image generation timed out before the provider could complete your request. Please review and resubmit.";
  }

  if (normalized.length > 280) {
    return `${normalized.slice(0, 277)}...`;
  }

  return normalized;
}

export function buildImageAdResumeDraft(job: RawImageAdJob): ImageAdResumeDraft | null {
  if (!job.celebrity_id || !job.script?.trim() || !job.celebrity?.name?.trim()) return null;

  const scope = extractScope(job.scene_notes);
  const category = "Entertainment";

  return {
    requestId: job.reference_id,
    orderId: job.reference_id,
    celebrity: {
      id: job.celebrity_id,
      name: job.celebrity.name,
      category,
      filter: industryToFilter(category),
      priceFromSar: Math.max(0, Number(job.estimated_price) || 0),
      imageUrl: job.celebrity.thumbnail_url || `https://picsum.photos/seed/${job.celebrity_id}/400/400`,
    },
    prompt: job.script.trim(),
    style: scope.style,
    aspectRatio: job.aspect_ratio || "16:9",
    channels: Array.isArray(job.channels) ? job.channels : [],
    duration: scope.duration,
    territory: scope.territory,
    exclusivity: scope.exclusivity,
    estimatedPrice: typeof job.estimated_price === "number" ? job.estimated_price : undefined,
    validationReason: formatValidationReason(job.error_message),
  };
}

export function storeImageAdResumeDraft(draft: ImageAdResumeDraft): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(IMAGE_AD_RESUME_STORAGE_KEY, JSON.stringify(draft));
}

export function readImageAdResumeDraft(): ImageAdResumeDraft | null {
  if (typeof window === "undefined") return null;

  const raw = window.sessionStorage.getItem(IMAGE_AD_RESUME_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as ImageAdResumeDraft;
  } catch {
    return null;
  }
}

export function clearImageAdResumeDraft(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(IMAGE_AD_RESUME_STORAGE_KEY);
}
