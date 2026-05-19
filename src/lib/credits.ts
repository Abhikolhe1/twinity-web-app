/*
 * ══════════════════════════════════════════════════════════════════════════════
 *  TASK 1 — AUDIT ANSWERS
 * ══════════════════════════════════════════════════════════════════════════════
 *
 *  1. HOW ARE CREDITS STORED AND ACCESSED?
 *     Currently: hardcoded module-level constants in StudioSidebar.tsx:
 *       const CREDITS = 12; const CREDITS_MAX = 30;
 *     No Supabase column, no React context, no Zustand store exists yet.
 *     TODO: replace with: SELECT available, used, total FROM credits
 *                         WHERE user_id = session.userId LIMIT 1
 *
 *  2. CREDITS DATA SHAPE
 *     No formal type exists. StudioSidebar uses CREDITS (balance) and
 *     CREDITS_MAX (total). We define CreditBalance below. The mock
 *     initializes available=12, used=18, total=30.
 *
 *  3. EXISTING CREDITS DISPLAY COMPONENT
 *     StudioSidebar.tsx lines 125–177: inline JSX widget showing
 *     "Credits 12 / 30" with a colored progress bar and "Buy Credits" button.
 *     It is NOT a reusable component — just inline JSX with hardcoded constants.
 *     Task 11 updates it to consume CreditsContext.
 *
 *  4. CARD, INPUT, BUTTON, TEXTAREA PATTERN (PersonalizeMessage / GreetingFunnel)
 *     Input/textarea:
 *       background:  #1E1E1E (Tailwind: bg-[#1F1F1F])
 *       border:      1px solid rgba(255,255,255,0.10)
 *       radius:      rounded-lg (8px) — we use 10px to match request page cards
 *       padding:     px-3 py-2.5 (inline: 12px 10px) — we use 14px 16px
 *       color:       #F0F0F0
 *       font-size:   14px
 *       focus ring:  border-color #7C3AED/50, box-shadow 0 0 0 2px #7C3AED/20
 *       outline:     none
 *     Drop zone:
 *       background:  #141414, border 2px dashed rgba(255,255,255,0.12)
 *       radius:      rounded-xl (12px), padding px-4 py-10
 *     Primary button (GreetingFunnel horizonPrimaryBtn):
 *       h-[44px] inline-flex items-center justify-center rounded-xl px-5
 *       text-[14px] font-bold text-white, transition-all duration-200 hover:-translate-y-px
 *       background: linear-gradient(135deg, #7C3AED, #5B21B6)
 *       boxShadow:  0 8px 24px rgba(124,58,237,0.30)
 *
 *  5. EXISTING FILE UPLOAD COMPONENT
 *     None. PersonalizeMessage.tsx has a visual-only drop zone (no file
 *     handling, no state). We create RegenerationVoiceUpload.tsx from scratch.
 *
 *  6. EXISTING TOAST / NOTIFICATION SYSTEM
 *     No library. Pattern from GreetingFunnel.tsx: inline fixed-position div,
 *     controlled by useState boolean. Structure:
 *       position fixed, top 24, insetInlineEnd 24, zIndex 9999
 *       background #161616, border 1px solid #2A2A2A, borderRadius 12
 *       padding 14px 18px, boxShadow 0 0 24px rgba(34,197,94,0.12), 0 8px 32px rgba(0,0,0,0.6)
 *     We replicate this pattern for regeneration success/error toasts.
 *
 *  7. ANIMATION LIBRARY
 *     CSS-only. No framer-motion. Libraries: none (tw-animate-css imported in
 *     globals.css is for Tailwind utility animations only).
 *     Keyframes defined in globals.css:
 *       @keyframes funnelStepIn { from: opacity 0, translateY(8px); to: opacity 1, translateY(0) }
 *       @keyframes fadeUp       { from: opacity 0, translateY(20px); to: opacity 1, translateY(0) }
 *     Class: .funnel-step-animate → funnelStepIn 200ms ease both
 *     Studio Home reveal: opacity + translateY(6px), 240ms ease-out via inline style
 *     Transition var: --transition: 180ms cubic-bezier(0.16, 1, 0.3, 1)
 *
 *  8. CREDIT COST PER REGENERATION ATTEMPT
 *     No existing constant, env var, or DB value.
 *     We define REGENERATION_CREDIT_COST = 1 here.
 *     Source: design spec + BRD (each regeneration = 1 credit).
 *     When Supabase is live, this could come from a `pricing_rules` table.
 *
 *  9. EXISTING API ROUTES FOR REGENERATION
 *     None. Only src/app/api/health/route.ts exists.
 *     We create src/app/api/requests/[requestId]/regenerate/route.ts.
 *
 * 10. SUPABASE TABLE AND COLUMNS FOR REQUEST VERSIONS
 *     No Supabase client installed (@supabase/supabase-js not in package.json).
 *     No schema files found. Recommended future schema:
 *       Table: regeneration_attempts
 *         id uuid PK, request_id uuid FK, user_id uuid FK,
 *         prompt text, voice_reference_key text,
 *         credits_cost int, status text, result_preview_url text,
 *         created_at timestamptz, completed_at timestamptz,
 *         failure_reason text
 *       Table: credits
 *         id uuid PK, user_id uuid FK UNIQUE,
 *         available int NOT NULL DEFAULT 0,
 *         used int NOT NULL DEFAULT 0,
 *         total int NOT NULL DEFAULT 30,
 *         resets_at timestamptz
 * ══════════════════════════════════════════════════════════════════════════════
 */

/* ── Credit balance type ─────────────────────────────────────────────────── */
export type CreditBalance = {
  available: number;   // credits the client can still spend
  used:      number;   // credits spent so far
  total:     number;   // total credits allocated to this account
  resetsAt?: string;   // ISO date when credits reset (optional)
};

/*
 * REGENERATION_CREDIT_COST — cost per regeneration attempt.
 * Source: design spec / BRD §8.2. No DB or env var backing this yet.
 * When a pricing_rules table is created, read from there instead.
 */
export const REGENERATION_CREDIT_COST = 1 as const;

/*
 * Mock credit balance — used until Supabase is live.
 * Replace with: SELECT available, used, total, resets_at FROM credits
 *               WHERE user_id = session.userId LIMIT 1
 */
export const MOCK_CREDIT_BALANCE: CreditBalance = {
  available: 12,
  used:      18,
  total:     30,
};

/* ── Regeneration attempt type ───────────────────────────────────────────── */
export type RegenerationAttemptStatus = "PENDING" | "PROCESSING" | "COMPLETE" | "FAILED";

export type RegenerationAttempt = {
  id:                  string;
  requestId:           string;
  prompt:              string;
  voiceReferenceUrl?:  string;    // signed URL only — never raw S3 key
  creditsCost:         number;
  status:              RegenerationAttemptStatus;
  resultPreviewUrl?:   string;    // signed URL, watermarked
  createdAt:           string;
  completedAt?:        string;
  failureReason?:      string;
};

/* ── Regeneration submit payload ─────────────────────────────────────────── */
export type RegenerationSubmitPayload = {
  requestId:          string;
  prompt:             string;
  voiceReferenceKey?: string;   // storage key — server-side only, never exposed to UI
  creditsCost:        number;
};

/* ── API response shapes ─────────────────────────────────────────────────── */
export type RegenerationSuccessResponse = {
  attempt:          RegenerationAttempt;
  creditsRemaining: number;
};

export type RegenerationErrorResponse = {
  error: string;
  code:  "insufficient_credits" | "invalid_type" | "invalid_status" | "validation_error" | "unauthorized" | "server_error";
  available?: number;
};
