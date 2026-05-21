/*
 * ══════════════════════════════════════════════════════════════════════════
 *  AUDIT ANSWERS — compiled from Task 1 codebase reading
 * ══════════════════════════════════════════════════════════════════════════
 *
 *  1. SERVICE SELECTION (StudioHomeWithFunnel)
 *     State-based: openFunnel("image-ad") → setStudioTab("image-ad") →
 *     setStudioOpen(true) → StudioTabbedFunnels renders ImageAdFunnelWorkspace.
 *     No router push — tab state lives in StudioHomeWithFunnel.
 *
 *  2. MULTI-STEP NAVIGATION (GreetingFunnel pattern matched exactly)
 *     useState<number> for currentStep (1-based).
 *     handleNext() / handleBack() increment/decrement step.
 *     scrollRef.current.scrollTo({ top:0 }) on every step change.
 *     Direction-aware CSS animation: direction "fwd" | "bwd" on step change.
 *
 *  3. ANIMATION LIBRARY
 *     CSS-only — no framer-motion, no external lib.
 *     globals.css defines @keyframes funnelStepIn (opacity 0→1, translateY 8→0).
 *     Custom step-change animations added below via <style> tag.
 *
 *  4. CARD PATTERN (Studio Home exact match)
 *     Glass cards:  bg rgba(255,255,255,0.025)  border 1px solid rgba(255,255,255,0.06)
 *     Dark cards:   bg #161616  border 1px solid #2A2A2A  radius 12px
 *     Hover:        border → rgba(124,58,237,0.20-0.35)  transition 150-200ms
 *     Selected:     bg rgba(124,58,237,0.08)  border 1px solid #7C3AED
 *
 *  5. SERVICE CARD PATTERN (LICENSE_TYPES grid — §5 in StudioHomeWithFunnel)
 *     sm:grid-cols-2 lg:grid-cols-4  gap-3  rounded-xl p-5
 *     borderLeft: 2px solid #7C3AED (selected) | transparent (rest)
 *     Icon in 36px div  title 17px font-semibold  desc 13px muted
 *
 *  6. CELEBRITY LOADING
 *     Static mock arrays in src/lib/studio/studio-funnel-data.ts (FUNNEL_CELEBRITIES)
 *     and src/lib/studio/greeting-funnel-data.ts (GREETING_CELEBRITIES).
 *     No fetch / no context. This file reuses FUNNEL_CELEBRITIES.
 *
 *  7. MOCK DATA LOCATION
 *     src/lib/studio/studio-funnel-data.ts       — FUNNEL_CELEBRITIES, TEMPLATE_ITEMS
 *     src/lib/studio/greeting-funnel-data.ts     — GREETING_CELEBRITIES/OCCASIONS/TEMPLATES
 *     src/lib/studio/mock-requests.ts            — MOCK_REQUESTS, MOCK_AD_IMAGE_REQUEST
 *
 *  8. REQUEST STATUS TYPE
 *     keyof typeof REQUEST_STATUS_MAP — 18 states:
 *     DRAFT, PENDING_PAYMENT, PAYMENT_AUTHORIZED, PENDING_VALIDATION,
 *     VALIDATION_FAILED, PENDING_COMPLIANCE, PENDING_APPROVAL, EDIT_REQUESTED,
 *     PREVIEW_REVIEW, PROVIDER_QUEUED, PROVIDER_PROCESSING, PROVIDER_COMPLETE,
 *     LICENSE_ACTIVATING, APPROVED, DELIVERED, REJECTED, CANCELLED, REFUNDED
 *
 *  9. REQUEST TYPE UNION
 *     MockRequest.type: "GREETING" | "CAMPAIGN" | "CUSTOM_CAMPAIGN" | "AD_IMAGE"
 *     FunnelServiceId:  "greeting" | "campaign" | "custom" | "image-ad"
 * ══════════════════════════════════════════════════════════════════════════
 */
"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  Film,
  ImagePlus,
  Lock,
  Package,
  Shield,
  Star,
  Sun,
  X,
} from "lucide-react";

import { FUNNEL_CELEBRITIES } from "@/lib/studio/studio-funnel-data";
import type { FunnelCelebrity } from "@/lib/studio/studio-funnel-data";
import { celebrityApi, imageAdApi } from "@/lib/api";

/* ── Types ─────────────────────────────────────────────────────────────── */
type Step = 1 | 2 | 3 | 4 | 5;

type StyleOption = {
  id:   string;
  label: string;
  sub:   string;
  Icon: React.ElementType;
};

type AspectRatio = "1:1" | "4:5" | "16:9" | "9:16";

type UsageChannel =
  | "Social Media"
  | "Digital Advertising"
  | "Website & Web Banners"
  | "Email Marketing"
  | "Print"
  | "Broadcast";

type Duration = "6 months" | "12 months" | "24 months" | "Perpetual";
type Territory = "Saudi Arabia" | "GCC" | "MENA" | "Worldwide";

type RefImage = { id: string; name: string; size: string; objectUrl?: string };

/* ── Constants ──────────────────────────────────────────────────────────── */
const STYLE_OPTIONS: StyleOption[] = [
  { id: "cinematic",    label: "Cinematic Portrait",   sub: "Dramatic lighting, premium film quality",    Icon: Film    },
  { id: "editorial",   label: "Editorial / Magazine",  sub: "Clean, fashion-forward, editorial feel",     Icon: BookOpen },
  { id: "product",     label: "Product Integration",   sub: "Celebrity with your product, commercial focus", Icon: Package  },
  { id: "lifestyle",   label: "Lifestyle / Candid",    sub: "Natural, authentic, approachable",           Icon: Sun     },
  { id: "ambassador",  label: "Brand Ambassador",      sub: "Confident, aspirational, brand-centric",     Icon: Star    },
];

const ASPECT_RATIOS: { id: AspectRatio; label: string; sub: string; w: number; h: number }[] = [
  { id: "1:1",  label: "1:1 Square",   sub: "Instagram feed",         w: 1,   h: 1   },
  { id: "4:5",  label: "4:5 Portrait", sub: "Instagram portrait",     w: 4,   h: 5   },
  { id: "16:9", label: "16:9 Wide",    sub: "Web banner / YouTube",   w: 16,  h: 9   },
  { id: "9:16", label: "9:16 Story",   sub: "Stories / Reels",        w: 9,   h: 16  },
];

const USAGE_CHANNELS: UsageChannel[] = [
  "Social Media",
  "Digital Advertising",
  "Website & Web Banners",
  "Email Marketing",
  "Print",
  "Broadcast",
];

const DURATIONS: Duration[] = ["6 months", "12 months", "24 months", "Perpetual"];
const TERRITORIES: Territory[] = ["Saudi Arabia", "GCC", "MENA", "Worldwide"];

const DURATION_SURCHARGE: Record<Duration, number | null> = {
  "6 months":  0,
  "12 months": 299,
  "24 months": 599,
  "Perpetual": null, // contact pricing
};

const TERRITORY_SURCHARGE: Record<Territory, number> = {
  "Saudi Arabia": 0,
  "GCC":          199,
  "MENA":         399,
  "Worldwide":    799,
};

const BASE_PRICE = 999;
const VAT_RATE   = 0.15;

const PROMPT_SUGGESTIONS = [
  "Brand ambassador with product",
  "Editorial lifestyle setting",
  "Luxury product endorsement",
  "Urban street style campaign",
];

const SIDEBAR_STEPS: { id: Step; label: string }[] = [
  { id: 1, label: "Select Celebrity"     },
  { id: 2, label: "Describe Image"       },
  { id: 3, label: "Style & Format"       },
  { id: 4, label: "Usage & License"      },
  { id: 5, label: "Review & Pay"         },
];

/* ── Shared style tokens ─────────────────────────────────────────────────── */
const S = {
  label:   { fontSize: 12, fontWeight: 600, color: "#F0F0F0", marginBottom: 4 } as React.CSSProperties,
  sub:     { fontSize: 11, color: "#606060", lineHeight: 1.55 }                 as React.CSSProperties,
  pill:    {
    display: "inline-flex", alignItems: "center", gap: 5,
    background: "#1E1E1E", border: "1px solid #2A2A2A",
    borderRadius: 9999, padding: "6px 14px",
    fontSize: 12, color: "#A0A0A0", cursor: "pointer",
    transition: "border-color 150ms, color 150ms, background 150ms",
    userSelect: "none",
  }                                                                               as React.CSSProperties,
  pillSel: {
    background: "rgba(124,58,237,0.10)", border: "1px solid #7C3AED",
    color: "#C4B5FD", fontWeight: 600,
  }                                                                               as React.CSSProperties,
  divider: { height: 1, background: "#1A1A1A", margin: "20px 0" }               as React.CSSProperties,
  input:   {
    width: "100%", background: "#1E1E1E", border: "1px solid #2A2A2A",
    borderRadius: 10, padding: "12px 14px", color: "#F0F0F0",
    fontSize: 14, lineHeight: 1.6, outline: "none",
    transition: "border-color 150ms, box-shadow 150ms",
  }                                                                               as React.CSSProperties,
  card:    { background: "#161616", border: "1px solid #2A2A2A", borderRadius: 12, padding: 20 } as React.CSSProperties,
} as const;

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function calcPrice(duration: Duration, territory: Territory, exclusivity: boolean) {
  const dur = DURATION_SURCHARGE[duration];
  if (dur === null) return null; // Perpetual = contact
  const ter = TERRITORY_SURCHARGE[territory];
  const sub  = BASE_PRICE + dur + ter;
  const excl = exclusivity ? Math.round(sub * 0.5) : 0;
  const total = sub + excl;
  return { base: BASE_PRICE, dur, ter, excl, sub, vat: Math.round(total * VAT_RATE * 100) / 100, total: Math.round((total * (1 + VAT_RATE)) * 100) / 100 };
}

/* ── Step indicator ─────────────────────────────────────────────────────── */
function StepIndicator({ current }: { current: Step }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
      {SIDEBAR_STEPS.map((s, i) => {
        const done   = current > s.id;
        const active = current === s.id;
        return (
          <React.Fragment key={s.id}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 0 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 9999,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                background: done || active
                  ? "linear-gradient(135deg, #8B5CF6 0%, #3D1A6E 100%)"
                  : "#1E1E1E",
                border: done || active ? "none" : "1px solid #2A2A2A",
                boxShadow: active ? "0 0 12px rgba(139,92,246,0.35)" : "none",
                fontSize: 12, fontWeight: 700, color: done || active ? "#FFFFFF" : "#606060",
                transition: "all 200ms",
              }}>
                {done ? <Check size={13} /> : s.id}
              </div>
              <span style={{
                fontSize: 10, fontWeight: active ? 600 : 400, whiteSpace: "nowrap",
                color: active ? "#C4B5FD" : done ? "rgba(255,255,255,0.40)" : "#606060",
                letterSpacing: "0.01em",
              }}>
                {s.label}
              </span>
            </div>
            {i < SIDEBAR_STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 1, marginBottom: 24,
                background: current > s.id
                  ? "linear-gradient(90deg, #7C3AED, #5B21B6)"
                  : "#2A2A2A",
                transition: "background 300ms",
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ── Celebrity grid ─────────────────────────────────────────────────────── */
function industryToFilter(industry: string): FunnelCelebrity["filter"] {
  const i = (industry || "").toLowerCase();
  if (i.includes("sport") || i.includes("athlete") || i.includes("football")) return "Sports";
  if (i.includes("music") || i.includes("singer") || i.includes("artist"))    return "Music";
  if (i.includes("business") || i.includes("entrepreneur"))                    return "Business";
  if (i.includes("tv") || i.includes("television") || i.includes("host"))     return "TV";
  return "Entertainment";
}

function CelebrityGrid({
  selected,
  onSelect,
}: {
  selected: FunnelCelebrity | null;
  onSelect: (c: FunnelCelebrity) => void;
}) {
  const [celebs, setCelebs] = useState<FunnelCelebrity[]>(FUNNEL_CELEBRITIES);

  useEffect(() => {
    celebrityApi.list({ featured: true }).then(res => {
      if (res.data.length === 0) return;
      setCelebs(res.data.map(a => ({
        id:           a.id,
        name:         a.name,
        category:     a.industry,
        filter:       industryToFilter(a.industry),
        priceFromSar: a.price_range["avatar-studio"]?.min ?? 999,
        imageUrl:     a.thumbnail_url ?? `https://picsum.photos/seed/${a.slug}/400/400`,
      })));
    }).catch(() => null);
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))", gap: 12 }}>
      {celebs.map((c: FunnelCelebrity) => {
        const sel = selected?.id === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c)}
            style={{
              position:   "relative",
              background: sel ? "rgba(124,58,237,0.08)" : "#161616",
              border:     `1px solid ${sel ? "#7C3AED" : "#2A2A2A"}`,
              borderRadius: 12,
              padding:    12,
              cursor:     "pointer",
              textAlign:  "start",
              transition: "all 150ms",
            }}
            onMouseEnter={(e) => {
              if (sel) return;
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,58,237,0.30)";
            }}
            onMouseLeave={(e) => {
              if (sel) return;
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#2A2A2A";
            }}
          >
            {/* Avatar */}
            <div style={{
              width: "100%", aspectRatio: "1", borderRadius: 10,
              overflow: "hidden", marginBottom: 10,
              background: "linear-gradient(135deg, #1A1A2E, #0D0D18)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.imageUrl}
                alt={c.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: sel ? "#C4B5FD" : "#F0F0F0", margin: "0 0 2px", lineHeight: 1.3 }}>
              {c.name}
            </p>
            <p style={{ fontSize: 11, color: "#606060", margin: 0 }}>{c.category}</p>
            <p style={{ fontSize: 11, color: sel ? "#A78BFA" : "#606060", margin: "4px 0 0" }}>
              From SAR {c.priceFromSar.toLocaleString("en-SA")}
            </p>
            {sel && (
              <div style={{
                position: "absolute", top: 8, insetInlineEnd: 8,
                width: 20, height: 20, borderRadius: 9999,
                background: "linear-gradient(135deg, #8B5CF6, #3D1A6E)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Check size={11} color="#FFFFFF" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── Price calculator ───────────────────────────────────────────────────── */
function PriceCalculator({
  duration,
  territory,
  exclusivity,
}: {
  duration:    Duration;
  territory:   Territory;
  exclusivity: boolean;
}) {
  const p = calcPrice(duration, territory, exclusivity);
  const fmt = (n: number) =>
    n.toLocaleString("en-SA", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  if (!p) {
    return (
      <div style={S.card}>
        <p style={{ fontSize: 10, fontWeight: 600, color: "#606060", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 12 }}>
          Estimated Price
        </p>
        <p style={{ fontSize: 18, fontWeight: 800, color: "#F59E0B", margin: 0 }}>
          Contact for Perpetual Pricing
        </p>
      </div>
    );
  }

  const rows: [string, string][] = [
    ["Base license fee",  `SAR ${fmt(p.base)}`],
    ["Duration",          p.dur > 0 ? `+ SAR ${fmt(p.dur)}` : "Included"],
    ["Territory",         p.ter > 0 ? `+ SAR ${fmt(p.ter)}` : "Included"],
    ["Exclusivity",       p.excl > 0 ? `+ SAR ${fmt(p.excl)}` : "—"],
  ];

  return (
    <div style={S.card}>
      <p style={{ fontSize: 10, fontWeight: 600, color: "#606060", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 12 }}>
        Estimated Price
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {rows.map(([label, val]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#A0A0A0" }}>{label}</span>
            <span style={{ fontSize: 12, color: "#F0F0F0", fontVariantNumeric: "tabular-nums" }}>{val}</span>
          </div>
        ))}
        <div style={{ height: 1, background: "#2A2A2A", margin: "4px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "#A0A0A0" }}>Subtotal</span>
          <span style={{ fontSize: 12, color: "#F0F0F0", fontVariantNumeric: "tabular-nums" }}>SAR {fmt(p.sub + p.excl)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "#A0A0A0" }}>VAT (15%)</span>
          <span style={{ fontSize: 12, color: "#F0F0F0", fontVariantNumeric: "tabular-nums" }}>SAR {fmt(p.vat)}</span>
        </div>
        <div style={{ height: 1, background: "#2A2A2A", margin: "4px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#F0F0F0" }}>Total</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#F0F0F0", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
            SAR {fmt(p.total)}
          </span>
        </div>
      </div>
      <p style={{ fontSize: 11, color: "#606060", marginTop: 10, lineHeight: 1.5 }}>
        Price is calculated based on your selections.
      </p>
    </div>
  );
}

/* ── Success screen ─────────────────────────────────────────────────────── */
function SuccessScreen({ onViewRequest }: { onViewRequest: () => void }) {
  return (
    <div
      style={{
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        textAlign:      "center",
        padding:        "40px 32px",
        flex:           1,
        background:     "radial-gradient(ellipse at center, rgba(124,58,237,0.08) 0%, transparent 70%)",
        animation:      "_scaleIn 300ms cubic-bezier(0.16,1,0.3,1) both",
        gap:            16,
        overflowY:      "auto",
      }}
    >
      <CheckCircle2 size={52} color="#22C55E" />
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#F0F0F0", letterSpacing: "-0.025em", margin: "0 0 8px" }}>
          Request submitted!
        </h2>
        <p style={{ fontSize: 14, color: "#A0A0A0", margin: 0, lineHeight: 1.6 }}>
          Your Image Ad request is now in review.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 320 }}>
        <button
          type="button"
          onClick={onViewRequest}
          style={{ height: 44, borderRadius: 10, background: "linear-gradient(135deg, #8B5CF6 0%, #3D1A6E 100%)", border: "none", color: "#FFFFFF", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}
        >
          View Request <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────── */
export type ImageAdFunnelWorkspaceProps = {
  onClose:   () => void;
  sessionId: number;
};

export function ImageAdFunnelWorkspace({ onClose, sessionId }: ImageAdFunnelWorkspaceProps) {
  /* step navigation */
  const [step,      setStep]      = useState<Step>(1);
  const [direction, setDirection] = useState<"fwd" | "bwd">("fwd");
  const [animKey,   setAnimKey]   = useState(0);

  /* step 1 */
  const [celebrity, setCelebrity] = useState<FunnelCelebrity | null>(null);

  /* step 2 */
  const [prompt,   setPrompt]   = useState("");
  const [refImages, setRefImages] = useState<RefImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* step 3 */
  const [style,       setStyle]       = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");

  /* step 4 */
  const [channels,    setChannels]    = useState<UsageChannel[]>([]);
  const [duration,    setDuration]    = useState<Duration>("12 months");
  const [territory,   setTerritory]   = useState<Territory>("Saudi Arabia");
  const [exclusivity, setExclusivity] = useState(false);

  /* step 5 */
  const [acknowledged,  setAcknowledged]  = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [submitted,     setSubmitted]     = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const router    = useRouter();

  /* reset on new session — setTimeout avoids synchronous setState-in-effect warning */
  useEffect(() => {
    const id = setTimeout(() => {
      setStep(1); setDirection("fwd"); setAnimKey(0);
      setCelebrity(null); setPrompt(""); setRefImages([]);
      setStyle(null); setAspectRatio("16:9");
      setChannels([]); setDuration("12 months"); setTerritory("Saudi Arabia"); setExclusivity(false);
      setAcknowledged(false); setSubmitting(false); setSubmitted(false);
      setGenerateError(null);
    }, 0);
    return () => clearTimeout(id);
  }, [sessionId]);

  /* scroll to top on step change */
  useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }); }, [step]);

  const price = useMemo(() => calcPrice(duration, territory, exclusivity), [duration, territory, exclusivity]);

  function goTo(target: Step) {
    const fwd = target > step;
    setDirection(fwd ? "fwd" : "bwd");
    setAnimKey(k => k + 1);
    setStep(target);
  }
  function handleNext() { if (step < 5) goTo((step + 1) as Step); }
  function handleBack() { if (step > 1) goTo((step - 1) as Step); }

  /* ref image handling */
  function handleFileSelect(files: FileList | null) {
    if (!files) return;
    const toAdd = Array.from(files).slice(0, 3 - refImages.length);
    const newImgs: RefImage[] = toAdd.map((f, i) => ({
      id:        `ref-${Date.now()}-${i}`,
      name:       f.name,
      size:       `${(f.size / 1024 / 1024).toFixed(1)} MB`,
      objectUrl:  URL.createObjectURL(f),
    }));
    setRefImages(prev => [...prev, ...newImgs].slice(0, 3));
  }
  function removeRefImage(id: string) {
    setRefImages(prev => prev.filter(r => r.id !== id));
  }

  /* submit */
  async function handleSubmit() {
    if (!celebrity) return;
    setSubmitting(true);
    setGenerateError(null);
    try {
      await imageAdApi.generate({
        celebrityId:    celebrity.id,
        prompt:         prompt.trim(),
        style:          style ?? undefined,
        aspectRatio,
        channels,
        duration,
        territory,
        exclusivity,
        estimatedPrice: price?.total ?? 0,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setGenerateError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  function handleViewRequest() {
    router.push("/studio/requests");
    onClose();
  }

  const canNext: Record<Step, boolean> = {
    1: celebrity !== null,
    2: prompt.trim().length >= 10,
    3: style !== null,
    4: channels.length > 0 && (DURATION_SURCHARGE[duration] !== null || duration === "Perpetual"),
    5: acknowledged,
  };

  const promptPct = Math.round((prompt.length / 600) * 100);
  const promptColor = promptPct >= 100 ? "#EF4444" : promptPct >= 80 ? "#F59E0B" : "#606060";

  /* ── sidebar ── */
  const sidebarLocked = (id: Step) => id > step;

  /* ── render ── */
  if (submitted) {
    return <SuccessScreen onViewRequest={handleViewRequest} />;
  }

  return (
    <>
      <style>{`
        @keyframes _stepFwd {
          from { opacity:0; transform: translateX(20px); }
          to   { opacity:1; transform: translateX(0);    }
        }
        @keyframes _stepBwd {
          from { opacity:0; transform: translateX(-20px); }
          to   { opacity:1; transform: translateX(0);     }
        }
        @keyframes _scaleIn {
          from { opacity:0; transform: scale(0.95); }
          to   { opacity:1; transform: scale(1);    }
        }
        @keyframes _spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">

        {/* ── Sidebar ── */}
        <nav
          className="hidden md:flex w-[220px] shrink-0 flex-col py-6"
          aria-label="Image Ad funnel steps"
          style={{ background: "rgba(10,8,18,0.60)", borderRight: "1px solid rgba(255,255,255,0.06)" }}
        >
          <ul className="flex flex-col gap-0.5 px-2">
            {SIDEBAR_STEPS.map(s => {
              const locked = sidebarLocked(s.id);
              const active = !locked && s.id === step;
              const done   = !locked && s.id < step;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => !locked && goTo(s.id)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start transition-all duration-150"
                    style={{
                      background: active ? "rgba(124,58,237,0.10)" : "transparent",
                      cursor:     locked ? "default" : "pointer",
                    }}
                  >
                    <span
                      style={{
                        width: 26, height: 26, borderRadius: 9999, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700,
                        background: done
                          ? "linear-gradient(135deg, #7C3AED, #5B21B6)"
                          : active
                            ? "rgba(124,58,237,0.15)"
                            : "rgba(255,255,255,0.04)",
                        border:  done ? "none" : active ? "2px solid #7C3AED" : "1px solid rgba(255,255,255,0.08)",
                        color:   done ? "#FFFFFF" : active ? "#C4B5FD" : "rgba(255,255,255,0.20)",
                        boxShadow: done ? "0 4px 10px rgba(124,58,237,0.35)" : "none",
                      }}
                    >
                      {done ? "✓" : s.id}
                    </span>
                    <span style={{
                      fontSize: 13,
                      fontWeight: active ? 600 : 400,
                      color: locked
                        ? "rgba(255,255,255,0.18)"
                        : active
                          ? "rgba(255,255,255,0.90)"
                          : done
                            ? "rgba(255,255,255,0.50)"
                            : "rgba(255,255,255,0.30)",
                    }}>
                      {s.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Governance note */}
          <div style={{ margin: "auto 12px 0", padding: "12px 14px", background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: 10 }}>
            <p style={{ fontSize: 11, color: "#A0A0A0", lineHeight: 1.55, margin: 0 }}>
              <span style={{ color: "#C4B5FD", fontWeight: 600 }}>Image Ad</span> — AI generated, celebrity-licensed. Compliance review required.
            </p>
          </div>
        </nav>

        {/* ── Main content ── */}
        <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto" style={{ padding: "28px 28px 40px" }}>

          {/* Mobile step indicator */}
          <div className="md:hidden mb-6">
            <StepIndicator current={step} />
          </div>

          {/* Desktop title */}
          <div className="hidden md:block mb-6">
            <StepIndicator current={step} />
          </div>

          {/* Step content */}
          <div
            key={`step-${animKey}`}
            style={{ animation: `${direction === "fwd" ? "_stepFwd" : "_stepBwd"} 200ms cubic-bezier(0.16,1,0.3,1) both`, flex: 1 }}
          >

            {/* ── STEP 1: Celebrity Selection ── */}
            {step === 1 && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F0F0F0", letterSpacing: "-0.02em", margin: "0 0 6px" }}>
                  Choose your celebrity
                </h2>
                <p style={{ fontSize: 14, color: "#A0A0A0", lineHeight: 1.6, margin: "0 0 24px" }}>
                  Select the celebrity who will appear in your image ad.
                </p>

                <CelebrityGrid selected={celebrity} onSelect={setCelebrity} />

                {celebrity && (
                  <div style={{ marginTop: 20, padding: "14px 16px", background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.20)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9999, overflow: "hidden", flexShrink: 0 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={celebrity.imageUrl} alt={celebrity.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#F0F0F0", margin: 0 }}>{celebrity.name}</p>
                        <p style={{ fontSize: 11, color: "#606060", margin: 0 }}>Watermarked samples available</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleNext}
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 44, paddingInline: 20, borderRadius: 10, background: "linear-gradient(135deg, #8B5CF6 0%, #3D1A6E 100%)", border: "none", color: "#FFFFFF", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                    >
                      Continue <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 2: Prompt + Reference Images ── */}
            {step === 2 && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F0F0F0", letterSpacing: "-0.02em", margin: "0 0 6px" }}>
                  Describe your image
                </h2>
                <p style={{ fontSize: 14, color: "#A0A0A0", lineHeight: 1.6, margin: "0 0 24px" }}>
                  Write a prompt and optionally upload reference images.
                </p>

                {/* Prompt textarea */}
                <label style={S.label}>Image description</label>
                <p style={{ ...S.sub, marginBottom: 10 }}>
                  Describe the scene, mood, setting, and how the celebrity appears.
                </p>
                <div style={{ position: "relative" }}>
                  <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value.slice(0, 600))}
                    placeholder="E.g. A confident lifestyle shot with the celebrity holding our product in a modern urban setting, warm lighting, editorial style..."
                    rows={5}
                    style={{ ...S.input, resize: "vertical", minHeight: 120 }}
                    onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = "#7C3AED"; (e.target as HTMLTextAreaElement).style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)"; }}
                    onBlur={e  => { (e.target as HTMLTextAreaElement).style.borderColor = "#2A2A2A"; (e.target as HTMLTextAreaElement).style.boxShadow = "none"; }}
                  />
                  <span style={{ position: "absolute", bottom: 10, insetInlineEnd: 12, fontSize: 11, color: promptColor }}>
                    {prompt.length}/600
                  </span>
                </div>

                {/* Quick suggestions */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                  {PROMPT_SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPrompt(p => p ? p + " " + s : s)}
                      style={S.pill}
                      onMouseEnter={e => { Object.assign((e.currentTarget as HTMLButtonElement).style, { borderColor: "rgba(124,58,237,0.35)", color: "#C4B5FD" }); }}
                      onMouseLeave={e => { Object.assign((e.currentTarget as HTMLButtonElement).style, { borderColor: "#2A2A2A", color: "#A0A0A0" }); }}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div style={S.divider} />

                {/* Reference image upload */}
                <label style={S.label}>Reference images <span style={{ color: "#606060", fontWeight: 400 }}>(optional)</span></label>
                <p style={{ ...S.sub, marginBottom: 12 }}>
                  Upload mood boards, brand assets, or visual references. Max 3 images, 10 MB each.
                </p>

                {refImages.length < 3 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: "100%", border: "2px dashed #2A2A2A", borderRadius: 10, padding: "20px 16px",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                      background: "transparent", cursor: "pointer", transition: "border-color 150ms, background 150ms",
                    }}
                    onMouseEnter={e => { Object.assign((e.currentTarget as HTMLButtonElement).style, { borderColor: "rgba(124,58,237,0.40)", background: "rgba(124,58,237,0.04)" }); }}
                    onMouseLeave={e => { Object.assign((e.currentTarget as HTMLButtonElement).style, { borderColor: "#2A2A2A", background: "transparent" }); }}
                  >
                    <ImagePlus size={24} color="#2A2A2A" />
                    <span style={{ fontSize: 13, color: "#606060" }}>Drop images or click to browse</span>
                    <span style={{ fontSize: 11, color: "#606060" }}>JPEG, PNG, WEBP — max 10 MB each</span>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  style={{ display: "none" }}
                  onChange={e => handleFileSelect(e.target.files)}
                />

                {refImages.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 80px)", gap: 8, marginTop: 12 }}>
                    {refImages.map(img => (
                      <div key={img.id} style={{ position: "relative", width: 80, height: 80, borderRadius: 8, overflow: "hidden", border: "1px solid #2A2A2A" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.objectUrl} alt={img.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        <button
                          type="button"
                          onClick={() => removeRefImage(img.id)}
                          style={{ position: "absolute", top: 4, insetInlineEnd: 4, width: 18, height: 18, borderRadius: 9999, background: "rgba(0,0,0,0.6)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          aria-label={`Remove ${img.name}`}
                        >
                          <X size={10} color="#FFFFFF" />
                        </button>
                      </div>
                    ))}
                    {refImages.length < 3 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{ width: 80, height: 80, borderRadius: 8, border: "2px dashed #2A2A2A", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 150ms" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,58,237,0.40)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#2A2A2A"; }}
                        aria-label="Add more images"
                      >
                        <ImagePlus size={16} color="#606060" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 3: Style + Aspect Ratio ── */}
            {step === 3 && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F0F0F0", letterSpacing: "-0.02em", margin: "0 0 6px" }}>
                  Choose your style
                </h2>
                <p style={{ fontSize: 14, color: "#A0A0A0", lineHeight: 1.6, margin: "0 0 24px" }}>
                  Define the visual treatment and output format.
                </p>

                <label style={S.label}>Visual style</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24, marginTop: 12 }}>
                  {STYLE_OPTIONS.map((opt, i) => {
                    const sel = style === opt.id;
                    const isLast = i === STYLE_OPTIONS.length - 1;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setStyle(opt.id)}
                        style={{
                          gridColumn: isLast ? "1 / -1" : undefined,
                          position: "relative",
                          display: "flex", alignItems: "flex-start", gap: 12,
                          background: sel ? "rgba(124,58,237,0.08)" : "#161616",
                          border: `1px solid ${sel ? "#7C3AED" : "#2A2A2A"}`,
                          borderRadius: 12, padding: 14, cursor: "pointer", textAlign: "start",
                          transition: "all 150ms",
                          animation: `_stepFwd 180ms ease ${i * 40}ms both`,
                        }}
                        onMouseEnter={e => { if (!sel) (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,58,237,0.20)"; }}
                        onMouseLeave={e => { if (!sel) (e.currentTarget as HTMLButtonElement).style.borderColor = "#2A2A2A"; }}
                      >
                        <div style={{ width: 28, height: 28, borderRadius: 9999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: sel ? "linear-gradient(135deg, #8B5CF6, #3D1A6E)" : "#1E1E1E", color: sel ? "#FFFFFF" : "#606060" }}>
                          <opt.Icon size={13} />
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: sel ? "#C4B5FD" : "#F0F0F0", margin: "0 0 3px" }}>{opt.label}</p>
                          <p style={{ fontSize: 11, color: "#606060", margin: 0 }}>{opt.sub}</p>
                        </div>
                        {sel && (
                          <div style={{ position: "absolute", top: 8, insetInlineEnd: 8, width: 18, height: 18, borderRadius: 9999, background: "linear-gradient(135deg, #8B5CF6, #3D1A6E)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Check size={10} color="#FFFFFF" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Aspect ratio */}
                <label style={{ ...S.label, marginTop: 20, display: "block" }}>Output format</label>
                <p style={{ ...S.sub, marginBottom: 12 }}>Choose the format for your final image.</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {ASPECT_RATIOS.map(ar => {
                    const sel = aspectRatio === ar.id;
                    const scaledH = 40;
                    const scaledW = Math.round((ar.w / ar.h) * scaledH);
                    return (
                      <button
                        key={ar.id}
                        type="button"
                        onClick={() => setAspectRatio(ar.id)}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 10, border: `1px solid ${sel ? "#7C3AED" : "#2A2A2A"}`, background: sel ? "rgba(124,58,237,0.10)" : "#1E1E1E", cursor: "pointer", transition: "all 150ms", minWidth: 90 }}
                      >
                        <span style={{ fontSize: 12, fontWeight: sel ? 600 : 400, color: sel ? "#C4B5FD" : "#A0A0A0" }}>
                          {ar.label}
                        </span>
                        <div style={{ width: Math.min(scaledW, 50), height: Math.min(scaledH, 50), background: "#2A2A2A", border: "1px solid #3D3D3D", borderRadius: 3, transition: "all 200ms" }} />
                        <span style={{ fontSize: 10, color: "#606060" }}>{ar.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── STEP 4: Usage Declaration ── */}
            {step === 4 && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F0F0F0", letterSpacing: "-0.02em", margin: "0 0 6px" }}>
                  How will you use this image?
                </h2>
                <p style={{ fontSize: 14, color: "#A0A0A0", lineHeight: 1.6, margin: "0 0 20px" }}>
                  This determines your license scope and final price.
                </p>

                {/* Governance banner */}
                <div style={{ borderInlineStart: "3px solid #F59E0B", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "0 10px 10px 0", padding: "12px 16px", marginBottom: 24, display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 9999, background: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <Shield size={12} color="#F59E0B" />
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#F0F0F0", margin: "0 0 4px" }}>
                      Your declared usage determines your license scope.
                    </p>
                    <p style={{ fontSize: 12, color: "#A0A0A0", margin: 0, lineHeight: 1.55 }}>
                      Using the content beyond your declared scope is a license violation. Scope can be expanded later with an upgrade.
                    </p>
                  </div>
                </div>

                {/* Platforms & channels */}
                <label style={S.label}>Platforms & channels</label>
                <p style={{ ...S.sub, marginBottom: 12 }}>Select all that apply.</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                  {USAGE_CHANNELS.map(ch => {
                    const sel = channels.includes(ch);
                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => setChannels(prev => sel ? prev.filter(c => c !== ch) : [...prev, ch])}
                        style={{ ...S.pill, ...(sel ? S.pillSel : {}), gap: 6 }}
                      >
                        {sel && <Check size={11} />}
                        {ch}
                      </button>
                    );
                  })}
                </div>

                {/* Usage period */}
                <label style={S.label}>Usage period</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24, marginTop: 10 }}>
                  {DURATIONS.map(d => {
                    const sel = duration === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDuration(d)}
                        style={{ ...S.pill, ...(sel ? S.pillSel : {}) }}
                      >
                        {d}
                        {d === "Perpetual" && (
                          <span style={{ fontSize: 10, color: sel ? "#A78BFA" : "#606060", marginLeft: 4 }}>(contact for pricing)</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Territory */}
                <label style={S.label}>Territory</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24, marginTop: 10 }}>
                  {TERRITORIES.map(t => {
                    const sel = territory === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTerritory(t)}
                        style={{ ...S.pill, ...(sel ? S.pillSel : {}) }}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>

                {/* Exclusivity toggle */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 24, padding: "14px 16px", background: "#161616", border: "1px solid #2A2A2A", borderRadius: 12 }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#F0F0F0", margin: "0 0 4px" }}>Exclusivity</p>
                    <p style={{ fontSize: 11, color: "#606060", margin: 0, lineHeight: 1.55, maxWidth: 360 }}>
                      Prevent other brands from licensing the same celebrity for similar use during your period.
                    </p>
                    {exclusivity && price && (
                      <span style={{ display: "inline-block", marginTop: 6, fontSize: 11, fontWeight: 600, color: "#F59E0B", background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 9999, padding: "2px 10px" }}>
                        + SAR {price.excl.toLocaleString("en-SA")}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={exclusivity}
                    onClick={() => setExclusivity(e => !e)}
                    style={{
                      width: 44, height: 24, borderRadius: 9999, flexShrink: 0,
                      background: exclusivity ? "linear-gradient(135deg, #8B5CF6, #3D1A6E)" : "#2A2A2A",
                      border: "none", cursor: "pointer",
                      position: "relative", transition: "background 200ms",
                    }}
                  >
                    <span style={{
                      position: "absolute", top: 2, left: exclusivity ? "calc(100% - 22px)" : 2,
                      width: 20, height: 20, borderRadius: 9999, background: "#FFFFFF",
                      transition: "left 200ms cubic-bezier(0.16,1,0.3,1)",
                    }} />
                  </button>
                </div>

                {/* Live price calculator */}
                <PriceCalculator duration={duration} territory={territory} exclusivity={exclusivity} />
              </div>
            )}

            {/* ── STEP 5: Review + Payment ── */}
            {step === 5 && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F0F0F0", letterSpacing: "-0.02em", margin: "0 0 6px" }}>
                  Review your brief
                </h2>
                <p style={{ fontSize: 14, color: "#A0A0A0", lineHeight: 1.6, margin: "0 0 24px" }}>
                  Confirm your selections before proceeding to payment.
                </p>

                {/* Summary card */}
                <div style={{ ...S.card, padding: "0", overflow: "hidden", marginBottom: 20 }}>
                  {/* Celebrity section */}
                  <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {celebrity && (
                        <div style={{ width: 36, height: 36, borderRadius: 9999, overflow: "hidden", flexShrink: 0 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={celebrity.imageUrl} alt={celebrity.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      )}
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#F0F0F0", margin: 0 }}>{celebrity?.name ?? "—"}</p>
                        <p style={{ fontSize: 11, color: "#606060", margin: 0 }}>Celebrity approval required after payment</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => goTo(1)} style={{ fontSize: 11, color: "#C4B5FD", background: "none", border: "none", cursor: "pointer" }}>Edit</button>
                  </div>

                  <div style={{ height: 1, background: "#1A1A1A" }} />

                  {/* Brief section */}
                  <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0, marginRight: 16 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#606060", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" }}>Brief</p>
                      <p style={{ fontSize: 13, fontStyle: "italic", color: "#A0A0A0", margin: "0 0 8px", lineHeight: 1.55 }}>
                        {prompt.slice(0, 80)}{prompt.length > 80 ? "…" : ""}
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {style && (
                          <span style={{ fontSize: 11, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.20)", borderRadius: 9999, padding: "2px 9px", color: "#C4B5FD" }}>
                            {STYLE_OPTIONS.find(s => s.id === style)?.label ?? style}
                          </span>
                        )}
                        <span style={{ fontSize: 11, background: "#1E1E1E", border: "1px solid #2A2A2A", borderRadius: 9999, padding: "2px 9px", color: "#A0A0A0" }}>
                          {aspectRatio}
                        </span>
                        {refImages.length > 0 && (
                          <span style={{ fontSize: 11, background: "#1E1E1E", border: "1px solid #2A2A2A", borderRadius: 9999, padding: "2px 9px", color: "#A0A0A0" }}>
                            {refImages.length} reference image{refImages.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <button type="button" onClick={() => goTo(2)} style={{ fontSize: 11, color: "#C4B5FD", background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>Edit</button>
                  </div>

                  <div style={{ height: 1, background: "#1A1A1A" }} />

                  {/* License section */}
                  <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#606060", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" }}>License Scope</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {channels.map(ch => (
                          <span key={ch} style={{ fontSize: 11, background: "#1E1E1E", border: "1px solid #2A2A2A", borderRadius: 9999, padding: "2px 9px", color: "#A0A0A0" }}>{ch}</span>
                        ))}
                        <span style={{ fontSize: 11, background: "#1E1E1E", border: "1px solid #2A2A2A", borderRadius: 9999, padding: "2px 9px", color: "#A0A0A0" }}>{duration}</span>
                        <span style={{ fontSize: 11, background: "#1E1E1E", border: "1px solid #2A2A2A", borderRadius: 9999, padding: "2px 9px", color: "#A0A0A0" }}>{territory}</span>
                        {exclusivity && (
                          <span style={{ fontSize: 11, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 9999, padding: "2px 9px", color: "#F59E0B" }}>Exclusive</span>
                        )}
                      </div>
                    </div>
                    <button type="button" onClick={() => goTo(4)} style={{ fontSize: 11, color: "#C4B5FD", background: "none", border: "none", cursor: "pointer", flexShrink: 0, marginLeft: 16 }}>Edit</button>
                  </div>

                  <div style={{ height: 1, background: "#1A1A1A" }} />

                  {/* Payment section */}
                  <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#606060", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" }}>Payment</p>
                      {price ? (
                        <>
                          <div style={{ display: "flex", gap: 16 }}>
                            <span style={{ fontSize: 12, color: "#A0A0A0" }}>Subtotal: SAR {(price.sub + price.excl).toLocaleString("en-SA")}</span>
                            <span style={{ fontSize: 12, color: "#A0A0A0" }}>VAT: SAR {price.vat.toLocaleString("en-SA")}</span>
                          </div>
                          <p style={{ fontSize: 16, fontWeight: 800, color: "#F0F0F0", margin: "6px 0 0", fontVariantNumeric: "tabular-nums" }}>
                            Total: SAR {price.total.toLocaleString("en-SA")}
                          </p>
                        </>
                      ) : (
                        <p style={{ fontSize: 13, color: "#F59E0B" }}>Perpetual — contact for pricing</p>
                      )}
                      <p style={{ fontSize: 11, color: "#606060", margin: "4px 0 0" }}>Payment authorization required</p>
                    </div>
                    <button type="button" onClick={() => goTo(4)} style={{ fontSize: 11, color: "#C4B5FD", background: "none", border: "none", cursor: "pointer", flexShrink: 0, marginLeft: 16 }}>Edit</button>
                  </div>
                </div>

                {/* Governance acknowledgment */}
                <button
                  type="button"
                  onClick={() => setAcknowledged(a => !a)}
                  style={{ display: "flex", alignItems: "flex-start", gap: 12, width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "start", padding: 0, marginBottom: 20 }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
                    background: acknowledged ? "#7C3AED" : "#1E1E1E",
                    border: `1.5px solid ${acknowledged ? "#7C3AED" : "#2A2A2A"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 150ms",
                  }}>
                    {acknowledged && <Check size={11} color="#FFFFFF" />}
                  </div>
                  <span style={{ fontSize: 13, color: "#A0A0A0", lineHeight: 1.6 }}>
                    I confirm my usage declaration is accurate. I understand that using this content beyond the declared scope is a license violation. Celebrity approval is required — approval is not guaranteed.
                  </span>
                </button>

                {/* CTA */}
                <button
                  type="button"
                  disabled={!acknowledged || submitting || !price}
                  onClick={handleSubmit}
                  style={{
                    width:          "100%",
                    height:         48,
                    borderRadius:   12,
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    gap:            8,
                    fontSize:       14,
                    fontWeight:     600,
                    color:          acknowledged && price ? "#FFFFFF" : "#606060",
                    background:     acknowledged && price
                      ? "linear-gradient(135deg, #8B5CF6 0%, #3D1A6E 100%)"
                      : "#1E1E1E",
                    border:         acknowledged && price ? "none" : "1px solid #2A2A2A",
                    cursor:         acknowledged && price ? "pointer" : "not-allowed",
                    boxShadow:      acknowledged && price
                      ? "0 0 24px rgba(139,92,246,0.25), 0 0 8px rgba(139,92,246,0.15)"
                      : "none",
                    transition:     "all 200ms",
                  }}
                >
                  <Lock size={14} />
                  {submitting
                    ? "Processing…"
                    : `Proceed to Payment${price ? ` · SAR ${price.total.toLocaleString("en-SA")}` : ""}`
                  }
                </button>

                <p style={{ textAlign: "center", fontSize: 11, color: "#606060", marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                  <Shield size={11} />
                  Secure payment · License activates after celebrity approval
                </p>
              </div>
            )}

          </div>

          {/* ── Footer nav ── */}
          {!submitted && (
            <div style={{ display: "flex", gap: 10, marginTop: 32, paddingTop: 20, borderTop: "1px solid #1A1A1A" }}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 44, paddingInline: 18, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.65)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                >
                  <ChevronLeft size={14} />
                  Back
                </button>
              )}
              {step < 5 && (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canNext[step]}
                  style={{
                    marginLeft: "auto",
                    display:    "inline-flex",
                    alignItems: "center",
                    gap:        6,
                    height:     44,
                    paddingInline: 20,
                    borderRadius: 10,
                    background: canNext[step] ? "linear-gradient(135deg, #8B5CF6 0%, #3D1A6E 100%)" : "#1E1E1E",
                    border:     canNext[step] ? "none" : "1px solid #2A2A2A",
                    color:      canNext[step] ? "#FFFFFF" : "#606060",
                    fontSize:   14,
                    fontWeight: 600,
                    cursor:     canNext[step] ? "pointer" : "not-allowed",
                    transition: "all 150ms",
                  }}
                >
                  Continue
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── Generating overlay ─────────────────────────────────── */}
      {submitting && (
        <div style={{ position: "absolute", inset: 0, zIndex: 20, background: "rgba(8,8,8,0.80)", backdropFilter: "blur(6px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(124,58,237,0.20)", borderTop: "3px solid #7C3AED", animation: "_spin 0.9s linear infinite" }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: "#F0F0F0", margin: 0 }}>Generating your image ad…</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.40)", margin: 0 }}>This usually takes 15–30 seconds</p>
        </div>
      )}

      {/* ── Error toast ────────────────────────────────────────── */}
      {generateError && !submitting && (
        <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", zIndex: 20, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.30)", borderRadius: 10, padding: "10px 18px", color: "#FCA5A5", fontSize: 13, maxWidth: 420, textAlign: "center", whiteSpace: "pre-wrap" }}>
          {generateError}
        </div>
      )}
    </>
  );
}
