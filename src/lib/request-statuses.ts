/*
 * ══════════════════════════════════════════════════════════════════════════════
 *  TASK 1 — AUDIT ANSWERS
 * ══════════════════════════════════════════════════════════════════════════════
 *
 *  1. TYPOGRAPHY
 *     ─────────────────────────────────────────────────────────────────────────
 *     Three font stacks are loaded in src/app/layout.tsx via next/font/google:
 *
 *       Body:    Geist (400, 500, 600, 700, 900) → CSS var --font-geist
 *                → mapped to  --font-sans  in globals.css
 *                Tailwind:    font-sans (default on <body>)
 *
 *       Display: Space Grotesk (300–700)          → CSS var --font-space-grotesk
 *                → mapped to  --font-display  in globals.css
 *                Tailwind:    font-display
 *                Applied to:  all h1–h6 in globals.css @layer base
 *
 *       Mono:    Geist Mono (400, 500, 600)        → CSS var --font-geist-mono
 *                → mapped to  --font-mono  in globals.css
 *                Tailwind:    font-mono
 *                Applied to:  order IDs, license numbers, technical strings
 *
 *       Arabic:  --font-arabic = 'Noto Kufi Arabic', 'IBM Plex Arabic', sans-serif
 *
 *     Size scale in use (Tailwind arbitrary values seen in studio components):
 *       text-[10px]  text-[11px]  text-[12px]  text-[13px]  text-[14px]
 *       text-[15px]  text-[17px]  text-[22px]  text-[28px]  text-[36px]
 *       text-sm (14px)  text-base (16px)  text-2xl (24px)
 *
 *     Weight scale:
 *       font-normal (400)  font-medium (500)  font-semibold (600)
 *       font-bold (700)    font-extrabold (800)
 *
 *     Letter-spacing base: --tracking-normal = -0.02em (set on html/body)
 *     Heading letter-spacing: --tracking-tight ≈ -0.045em
 *     Line-height body: 1.6  |  headings: 1.1 (globals.css @layer base)
 *
 *  2. WHERE FUNNELS REDIRECT AFTER SUCCESSFUL SUBMISSION
 *     ─────────────────────────────────────────────────────────────────────────
 *     Currently, NO redirect occurs.  Each funnel only advances its local step:
 *       GreetingFunnel      → setCurrentStep(7)  at PersonalizeMessage.onSubmit
 *       CampaignFunnel      → setCurrentStep(9)  at BriefAndAssets.onSubmit
 *       CustomCampaignFunnel→ setSubmitted(true)  in handleSubmit()
 *     Task 12 adds router.push('/studio/requests/[newRequestId]') to all three.
 *
 *  3. EXISTING REQUEST/ORDER DETAIL PAGE
 *     ─────────────────────────────────────────────────────────────────────────
 *     No detail page exists.  Only a stub list page:
 *       src/app/studio/(main)/requests/page.tsx  →  route  /studio/requests
 *     The [requestId] detail page is created in Task 10.
 *
 *  4. REQUEST/ORDER DATA SHAPE CURRENTLY STORED
 *     ─────────────────────────────────────────────────────────────────────────
 *     No real API calls or Supabase queries in the frontend codebase.
 *     CustomCampaignFunnel.handleSubmit() logs the closest to a request shape:
 *     {
 *       type: "CUSTOM_CAMPAIGN",
 *       campaignName, brand, objective, category, budget,
 *       celebrity: { id, name, priceFromSar, ... },
 *       licenseScope: { channels[], territory, duration, exclusivity, sla },
 *       campaignBrief: { message, script, guidelines },
 *     }
 *     The Supabase entity types are enumerated in src/lib/types/entities.ts:
 *       requests, licenses, payment_transactions, approval_events,
 *       provider_jobs, uploads, audit_logs, service_templates, users,
 *       business_profiles, celebrity_profiles, restriction_rules
 *
 *  5. SUPABASE TABLES FOR REQUESTS, ORDERS, LICENSES, PAYMENTS
 *     ─────────────────────────────────────────────────────────────────────────
 *     No Supabase client package (@supabase/supabase-js) is installed yet.
 *     Tables defined in src/lib/types/entities.ts (schema intent only):
 *       requests          — core order record, foreign key to users
 *       licenses          — license scope and activation record
 *       payment_transactions — authorization, capture, refund
 *       approval_events   — celebrity approval / rejection log
 *       provider_jobs     — generation job tracking
 *       audit_logs        — immutable governance trail
 *
 *  6. STATUS VALUES CURRENTLY DEFINED
 *     ─────────────────────────────────────────────────────────────────────────
 *     src/lib/types/request-status.ts exports `RequestStatus` const + type:
 *       draft, pending_payment, payment_authorized,
 *       pending_validation, validation_failed,
 *       pending_compliance, compliance_cleared,
 *       pending_approval, edit_requested, approved, rejected,
 *       provider_queued, provider_processing, provider_complete,
 *       preview_review, pending_capture,
 *       license_activating, delivered, expired,
 *       cancelled, refunded
 *
 *  7. COMPONENT PATTERNS ACROSS THE STUDIO
 *     ─────────────────────────────────────────────────────────────────────────
 *     Card surface:
 *       background #161616 (--color-surface)
 *       border: 1px solid #2A2A2A (--color-border)
 *       border-radius: 12–16px
 *       hover: border → rgba(124,58,237,0.20–0.35)
 *
 *     Primary button (horizonPrimaryBtn / hPrimaryBtn in funnels):
 *       inline-flex h-[44px] items-center justify-center rounded-xl px-5
 *       text-[14px] font-bold text-white
 *       background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)
 *       boxShadow: 0 8px 24px rgba(124,58,237,0.30)
 *
 *     Ghost/secondary button:
 *       background: rgba(255,255,255,0.05)
 *       border: 1px solid rgba(255,255,255,0.10)
 *       color: rgba(255,255,255,0.65)
 *
 *     Spacing rhythm: 4px base (--space-1=4 … --space-24=96)
 *     Section labels: 10px uppercase weight 600 #606060 letter-spacing 0.10em
 *     Row dividers: 1px solid #1A1A1A (slightly darker than border)
 *     Text hierarchy: #F0F0F0 primary · #A0A0A0 secondary · #606060 muted
 *     Font for order/license IDs: var(--font-mono)
 * ══════════════════════════════════════════════════════════════════════════════
 */

/** BRD v3.1 full lifecycle state map. Each entry carries display metadata. */
export const REQUEST_STATUS_MAP = {
  DRAFT: {
    label:       "Draft",
    description: "Your request has not been submitted yet.",
    gate:        0,
    color:       "muted" as const,
    icon:        "FileText",
  },
  PENDING_PAYMENT: {
    label:       "Awaiting Payment",
    description: "Complete your payment to start production.",
    gate:        3,
    color:       "purple" as const,
    icon:        "Lock",
  },
  PAYMENT_AUTHORIZED: {
    label:       "Payment Authorized",
    description: "Your payment is reserved. Production will begin shortly.",
    gate:        3,
    color:       "purple" as const,
    icon:        "ShieldCheck",
  },
  PENDING_VALIDATION: {
    label:       "Under Validation",
    description: "We are running automated policy and brand safety checks.",
    gate:        2,
    color:       "info" as const,
    icon:        "ScanSearch",
  },
  VALIDATION_FAILED: {
    label:       "Validation Failed",
    description: "Your request needs adjustments before it can proceed.",
    gate:        2,
    color:       "error" as const,
    icon:        "AlertTriangle",
  },
  PENDING_COMPLIANCE: {
    label:       "Compliance Review",
    description: "Your request has been escalated for compliance review.",
    gate:        4,
    color:       "warning" as const,
    icon:        "Scale",
  },
  PENDING_APPROVAL: {
    label:       "Awaiting Approval",
    description: "Your request is in the celebrity's approval queue.",
    gate:        5,
    color:       "warning" as const,
    icon:        "Clock",
  },
  EDIT_REQUESTED: {
    label:       "Edits Requested",
    description: "The celebrity has requested changes to your brief.",
    gate:        5,
    color:       "warning" as const,
    icon:        "PencilLine",
  },
  PREVIEW_REVIEW: {
    label:       "Preview Ready",
    description: "Your watermarked preview is ready for review.",
    gate:        7,
    color:       "info" as const,
    icon:        "Eye",
  },
  PROVIDER_QUEUED: {
    label:       "Production Queued",
    description: "Your content has been queued for production.",
    gate:        6,
    color:       "info" as const,
    icon:        "ListOrdered",
  },
  PROVIDER_PROCESSING: {
    label:       "In Production",
    description: "Your content is being produced.",
    gate:        6,
    color:       "info" as const,
    icon:        "Cpu",
  },
  PROVIDER_COMPLETE: {
    label:       "Production Complete",
    description: "Production is done. Final review is underway.",
    gate:        6,
    color:       "info" as const,
    icon:        "CheckCircle2",
  },
  LICENSE_ACTIVATING: {
    label:       "Activating License",
    description: "Payment captured. Your license is being activated.",
    gate:        8,
    color:       "purple" as const,
    icon:        "KeyRound",
  },
  APPROVED: {
    label:       "Approved",
    description: "Your request is approved and the license is active.",
    gate:        8,
    color:       "success" as const,
    icon:        "BadgeCheck",
  },
  DELIVERED: {
    label:       "Delivered",
    description: "Your final content is ready to download.",
    gate:        9,
    color:       "success" as const,
    icon:        "Download",
  },
  REJECTED: {
    label:       "Rejected",
    description: "Your request was not approved. See details below.",
    gate:        5,
    color:       "error" as const,
    icon:        "XCircle",
  },
  CANCELLED: {
    label:       "Cancelled",
    description: "This request has been cancelled.",
    gate:        0,
    color:       "muted" as const,
    icon:        "Ban",
  },
  REFUNDED: {
    label:       "Refunded",
    description: "Your payment has been refunded.",
    gate:        0,
    color:       "muted" as const,
    icon:        "RotateCcw",
  },
} as const;

export type RequestStatus = keyof typeof REQUEST_STATUS_MAP;

export type GateStatus = "completed" | "active" | "blocked" | "pending" | "skipped";

/**
 * Derive a gate-status map from a request status and type.
 * All gates before `currentGate` are 'completed'; `currentGate` is 'active';
 * gates after are 'pending'. Special skipping rules apply per BRD.
 */
export function computeGateStatuses(
  status: RequestStatus,
  requestType: "GREETING" | "CAMPAIGN" | "CUSTOM_CAMPAIGN" | "AD_IMAGE",
): Record<number, GateStatus> {
  const currentGate = REQUEST_STATUS_MAP[status].gate;
  const result: Record<number, GateStatus> = {};

  for (let g = 1; g <= 9; g++) {
    /* AD_IMAGE: Compliance (gate 4) is NEVER skipped — it is mandatory */
    if (g === 4 && requestType === "GREETING") {
      result[g] = "skipped";
    } else if (g === 6 && requestType === "CUSTOM_CAMPAIGN") {
      result[g] = "skipped";
    } else if (status === "VALIDATION_FAILED" && g === currentGate) {
      result[g] = "blocked";
    } else if (status === "REJECTED" && g === currentGate) {
      result[g] = "blocked";
    } else if (g < currentGate) {
      result[g] = "completed";
    } else if (g === currentGate) {
      result[g] = currentGate === 0 ? "pending" : "active";
    } else {
      result[g] = "pending";
    }
  }

  if (status === "DELIVERED" || status === "APPROVED") {
    for (let g = 1; g <= 9; g++) {
      if (result[g] !== "skipped") result[g] = "completed";
    }
  }

  if (status === "CANCELLED" || status === "REFUNDED") {
    for (let g = 1; g <= 9; g++) {
      if (result[g] !== "skipped") result[g] = "pending";
    }
  }

  return result;
}
