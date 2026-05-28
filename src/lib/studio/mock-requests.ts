/**
 * Demo/placeholder request data — used by the request detail and list pages
 * until a real Supabase client is wired in.
 *
 * Replace these with actual Supabase queries when @supabase/supabase-js is
 * installed and the database schema is live.
 */

import type { RequestStatus } from "@/lib/request-statuses";
import type { TimelineEvent } from "@/components/requests/RequestTimeline";
import type { ImageAdResumeDraft } from "@/lib/request-recovery";

export type MockRequest = {
  requestId: string;
  orderId: string;
  status: RequestStatus;
  type: "GREETING" | "CAMPAIGN" | "CUSTOM_CAMPAIGN" | "AD_IMAGE";
  celebrity: { name: string; stageName: string; avatarUrl?: string };
  licenseScope?: {
    channels: string[];
    territory: string;
    duration: string;
    exclusivity: string;
    deliverableType: string;
  };
  /** AD_IMAGE-specific brief fields */
  adImageBrief?: {
    prompt: string;
    style: string;
    aspectRatio: string;
    usageDeclaration: string;
    referenceImages?: { id: string; name: string; size: string }[];
    referenceImageCount?: number;
  };
  brief?: { campaignName?: string; objective?: string };
  payment: { subtotal: number; vat: number; total: number; status: string };
  credits?: { available: number; used: number; total: number };
  createdAt: string;
  submittedAt?: string;
  previewUrl?: string;
  finalUrl?: string;
  previewImageUrl?: string | null;
  finalImageUrl?: string | null;
  mediaType?: "video" | "image" | "audio";
  licenseId?: string;
  licenseExpiry?: string;
  licensedChannels?: string[];
  clientName?: string;
  editFeedback?: string;
  validationReason?: string;
  resumeDraft?: ImageAdResumeDraft;
};

const NOW = Date.now();
const H = 60 * 60 * 1000;
const D = 24 * H;

export const MOCK_REQUESTS: MockRequest[] = [
  {
    requestId: "ord-greeting-001",
    orderId: "ORD-2026-000042",
    status: "PREVIEW_REVIEW",
    type: "GREETING",
    celebrity: { name: "Khalid Al-Otaibi", stageName: "Khalid" },
    brief: { campaignName: "Birthday Greeting", objective: "Personal birthday message for Ahmed" },
    payment: { subtotal: 499, vat: 75, total: 574, status: "PAYMENT_AUTHORIZED" },
    createdAt: new Date(NOW - 2 * D).toISOString(),
    submittedAt: new Date(NOW - 2 * D).toISOString(),
    previewUrl: undefined,
    mediaType: "video",
    clientName: "Ahmed Al-Rashid",
  },
  {
    requestId: "ord-campaign-001",
    orderId: "ORD-2026-000031",
    status: "PENDING_APPROVAL",
    type: "CAMPAIGN",
    celebrity: { name: "Layla Al-Mutairi", stageName: "Layla" },
    licenseScope: {
      channels: ["Instagram", "TikTok", "YouTube"],
      territory: "Saudi Arabia & GCC",
      duration: "12 months",
      exclusivity: "Non-exclusive",
      deliverableType: "Video MP4 (30s)",
    },
    brief: { campaignName: "Ramadan Launch 2026", objective: "Brand awareness during Ramadan" },
    payment: { subtotal: 12000, vat: 1800, total: 13800, status: "PAYMENT_AUTHORIZED" },
    createdAt: new Date(NOW - 4 * D).toISOString(),
    submittedAt: new Date(NOW - 4 * D).toISOString(),
    mediaType: "video",
    clientName: "Almarai Corp",
  },
  {
    requestId: "ord-custom-001",
    orderId: "ORD-2026-000018",
    status: "DELIVERED",
    type: "CUSTOM_CAMPAIGN",
    celebrity: { name: "Faisal Al-Dosari", stageName: "Faisal" },
    licenseScope: {
      channels: ["LinkedIn", "Twitter/X"],
      territory: "Saudi Arabia",
      duration: "6 months",
      exclusivity: "Exclusive",
      deliverableType: "Video MP4 + Audio WAV",
    },
    brief: { campaignName: "Q1 Product Launch", objective: "Launch new SaaS product" },
    payment: { subtotal: 9500, vat: 1425, total: 10925, status: "PAYMENT_AUTHORIZED" },
    createdAt: new Date(NOW - 14 * D).toISOString(),
    submittedAt: new Date(NOW - 14 * D).toISOString(),
    mediaType: "video",
    licenseId: "LIC-2026-000018",
    licenseExpiry: new Date(NOW + 180 * D).toISOString(),
    licensedChannels: ["LinkedIn", "Twitter/X"],
    clientName: "TechVentures KSA",
  },
  {
    requestId: "ord-greeting-002",
    orderId: "ORD-2026-000055",
    status: "DRAFT",
    type: "GREETING",
    celebrity: { name: "Nora Al-Qahtani", stageName: "Nora" },
    brief: { campaignName: "Wedding Congratulations" },
    payment: { subtotal: 699, vat: 105, total: 804, status: "DRAFT" },
    createdAt: new Date(NOW - 1 * H).toISOString(),
    clientName: "Ahmed Al-Rashid",
  },
  {
    requestId: "ord-campaign-002",
    orderId: "ORD-2026-000009",
    status: "REJECTED",
    type: "CAMPAIGN",
    celebrity: { name: "Omar Al-Ghamdi", stageName: "Omar" },
    licenseScope: {
      channels: ["Instagram"],
      territory: "Global",
      duration: "Perpetual",
      exclusivity: "Exclusive",
      deliverableType: "Video MP4",
    },
    brief: { campaignName: "Crypto Campaign", objective: "Promote crypto exchange" },
    payment: { subtotal: 9999, vat: 1500, total: 11499, status: "REFUNDED" },
    createdAt: new Date(NOW - 20 * D).toISOString(),
    submittedAt: new Date(NOW - 20 * D).toISOString(),
    mediaType: "video",
    clientName: "CryptoXYZ",
  },
];

export const MOCK_TIMELINE_EVENTS: Record<string, TimelineEvent[]> = {
  "ord-greeting-001": [
    {
      id: "evt-g1-004",
      eventType: "PREVIEW_READY",
      actor: "SYSTEM",
      label: "Watermarked preview is ready",
      description: "Your preview has been generated and is ready for review. Do not share or distribute this watermarked version.",
      timestamp: new Date(NOW - 3 * H).toISOString(),
    },
    {
      id: "evt-g1-003",
      eventType: "APPROVAL_DECISION",
      actor: "CELEBRITY",
      label: "Celebrity approved the request",
      description: "Khalid has reviewed and approved your greeting brief.",
      timestamp: new Date(NOW - 8 * H).toISOString(),
    },
    {
      id: "evt-g1-002",
      eventType: "PAYMENT_AUTHORIZED",
      actor: "SYSTEM",
      label: "Payment authorized",
      description: "SAR 574 authorized. Funds will be captured after final delivery.",
      timestamp: new Date(NOW - 2 * D).toISOString(),
    },
    {
      id: "evt-g1-001",
      eventType: "REQUEST_CREATED",
      actor: "CLIENT",
      label: "Request submitted",
      description: "Greeting request for Khalid Al-Otaibi submitted successfully.",
      timestamp: new Date(NOW - 2 * D - 5 * 60 * 1000).toISOString(),
    },
  ],
  "ord-campaign-001": [
    {
      id: "evt-c1-003",
      eventType: "VALIDATION_PASSED",
      actor: "SYSTEM",
      label: "Validation passed",
      description: "All policy and brand safety checks cleared.",
      timestamp: new Date(NOW - 3 * D).toISOString(),
    },
    {
      id: "evt-c1-002",
      eventType: "PAYMENT_AUTHORIZED",
      actor: "SYSTEM",
      label: "Payment authorized",
      description: "SAR 13,800 authorized.",
      timestamp: new Date(NOW - 4 * D).toISOString(),
    },
    {
      id: "evt-c1-001",
      eventType: "REQUEST_CREATED",
      actor: "CLIENT",
      label: "Campaign request submitted",
      description: "Campaign request for Layla Al-Mutairi submitted.",
      timestamp: new Date(NOW - 4 * D - 10 * 60 * 1000).toISOString(),
    },
  ],
  "ord-custom-001": [
    {
      id: "evt-cu1-005",
      eventType: "DELIVERED",
      actor: "SYSTEM",
      label: "Content delivered",
      description: "Your licensed content is ready for download. License is now active.",
      timestamp: new Date(NOW - 3 * D).toISOString(),
    },
    {
      id: "evt-cu1-004",
      eventType: "LICENSE_ACTIVATED",
      actor: "SYSTEM",
      label: "License activated",
      description: `License ${MOCK_REQUESTS[2].licenseId} is now active.`,
      timestamp: new Date(NOW - 3 * D - 30 * 60 * 1000).toISOString(),
    },
    {
      id: "evt-cu1-003",
      eventType: "APPROVAL_DECISION",
      actor: "CELEBRITY",
      label: "Celebrity approved",
      timestamp: new Date(NOW - 5 * D).toISOString(),
    },
    {
      id: "evt-cu1-002",
      eventType: "PAYMENT_AUTHORIZED",
      actor: "SYSTEM",
      label: "Payment authorized",
      description: "SAR 10,925 authorized.",
      timestamp: new Date(NOW - 14 * D).toISOString(),
    },
    {
      id: "evt-cu1-001",
      eventType: "REQUEST_CREATED",
      actor: "CLIENT",
      label: "Custom campaign request submitted",
      timestamp: new Date(NOW - 14 * D - 5 * 60 * 1000).toISOString(),
    },
  ],
};

/** AD_IMAGE mock request — used by /studio/requests/req-ad-001 */
export const MOCK_AD_IMAGE_REQUEST: MockRequest = {
  requestId:  "req-ad-001",
  orderId:    "ORD-2026-AD001",
  type:       "AD_IMAGE",
  status:     "PREVIEW_REVIEW",
  celebrity:  { name: "Khalid Al-Otaibi", stageName: "Khalid" },
  adImageBrief: {
    prompt:           "A confident brand ambassador shot with Khalid in a modern urban setting — warm cinematic lighting, editorial composition, product placement front-and-center.",
    style:            "Brand Ambassador",
    aspectRatio:      "16:9",
    usageDeclaration: "Digital advertising — social media and web banners",
    referenceImages:  [
      { id: "ref-1", name: "brand-ref-1.jpg",  size: "2.4 MB" },
      { id: "ref-2", name: "mood-board.jpg",   size: "1.8 MB" },
    ],
    referenceImageCount: 2,
  },
  brief: { campaignName: "Brand Ambassador Image", objective: "Commercial image for digital ads" },
  payment: { subtotal: 999, vat: 149.85, total: 1148.85, status: "PAYMENT_AUTHORIZED", currency: "SAR" } as MockRequest["payment"] & { currency: string },
  credits:  { available: 2, used: 0, total: 2 },
  previewImageUrl: null,
  finalImageUrl:   null,
  mediaType:  "image",
  createdAt:  new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
};

MOCK_REQUESTS.push(MOCK_AD_IMAGE_REQUEST);

export function getMockRequest(requestId: string): MockRequest | undefined {
  return MOCK_REQUESTS.find((r) => r.requestId === requestId);
}

export function getDemoRequest(requestId: string): MockRequest {
  return getMockRequest(requestId) ?? {
    ...MOCK_REQUESTS[0],
    requestId,
    orderId: `ORD-2026-${requestId.slice(-6).toUpperCase()}`,
  };
}

export function getMockTimeline(requestId: string): TimelineEvent[] {
  return MOCK_TIMELINE_EVENTS[requestId] ?? MOCK_TIMELINE_EVENTS["ord-greeting-001"];
}

/** Gate config labels for AD_IMAGE (differs from default GREETING/CAMPAIGN) */
export const AD_IMAGE_GATE_LABELS: Record<number, string> = {
  1: "License Scope",
  2: "Validation",
  3: "Payment",
  4: "Compliance",
  5: "Celebrity Approval",
  6: "Image Generation",
  7: "Preview Review",
  8: "License Activation",
  9: "Delivery",
};
