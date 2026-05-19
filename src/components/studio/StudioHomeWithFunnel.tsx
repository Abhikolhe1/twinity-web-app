"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText, Clock, CheckCircle, Zap,
  Video, Mic, Image as ImageIcon, Sparkles,
  ArrowRight, Inbox,
  Search, Tag, Send, CreditCard,
} from "lucide-react";

import { StudioFunnel }        from "@/components/studio/StudioFunnel";
import { StudioTabbedFunnels } from "@/components/studio/StudioTabbedFunnels";
import type { StudioFunnelTab } from "@/components/studio/StudioTabbedFunnels";
import type { FunnelServiceId } from "@/lib/studio/studio-funnel-data";
import { useUser }             from "@/contexts/UserContext";
import { jobApi, celebrityApi, type ApiCelebrity } from "@/lib/api";
import styles from "./StudioHome.module.css";

/* ─────────────────────────────────────────────────────────────────────────
   TYPES
   ───────────────────────────────────────────────────────────────────────── */

type CelebCategory = "All" | "Sports" | "Music" | "TV" | "Comedy";

type CelebItem = {
  _id:      string;
  name:     string;
  category: CelebCategory;
  sub:      string;
  img:      string;
};

const CELEB_FILTERS: CelebCategory[] = ["All", "Sports", "Music", "TV", "Comedy"];

function toCelebCategory(industry: string): CelebCategory {
  const cap = industry.charAt(0).toUpperCase() + industry.slice(1).toLowerCase();
  if (cap === "Sports" || cap === "Music" || cap === "Tv" || cap === "Comedy") {
    return cap === "Tv" ? "TV" : (cap as CelebCategory);
  }
  return "Sports";
}

function mapCeleb(c: ApiCelebrity): CelebItem {
  const cat  = toCelebCategory(c.industry);
  const sub  = c.tags?.slice(0, 2).join(" · ") || c.nationality || c.industry;
  const slug = c.industry.toLowerCase();
  const img  = c.thumbnailUrl || `/placeholders/celeb-${slug === "tv" ? "tv" : slug === "sports" ? "sports" : slug === "music" ? "music" : "comedy"}.png`;
  return { _id: c._id, name: c.name, category: cat, sub, img };
}

type LicenseTypeId = "greeting" | "video" | "image-ad" | "custom";

const LICENSE_TYPES: {
  id:       LicenseTypeId;
  Icon:     React.ElementType;
  title:    string;
  desc:     string;
  badge:    string | null;
  funnel:   FunnelServiceId;
  cta:      string;
  isNew?:   boolean;
  priceFrom?: string;
}[] = [
  {
    id:       "greeting",
    Icon:     Mic,
    title:    "Personal Greeting",
    desc:     "A personalised video message from a celebrity — gifting, events, campaigns.",
    badge:    null,
    funnel:   "greeting",
    cta:      "New Greeting Request",
    priceFrom: "SAR 299",
  },
  {
    id:       "video",
    Icon:     Video,
    title:    "Video Ad",
    desc:     "Licensed celebrity appearance in a commercial — social, broadcast, OOH.",
    badge:    "Most Popular",
    funnel:   "campaign",
    cta:      "New Video Ad Request",
    priceFrom: "SAR 9,999",
  },
  {
    id:       "image-ad",
    Icon:     Sparkles,
    title:    "Image Ad",
    desc:     "Licensed celebrity image for commercial use — AI generated, brand-ready.",
    badge:    "NEW",
    funnel:   "image-ad",
    cta:      "Create Image Ad",
    isNew:    true,
    priceFrom: "SAR 999",
  },
  {
    id:       "custom",
    Icon:     ImageIcon,
    title:    "Custom Request",
    desc:     "Open brief — describe anything, attach files, get a tailored quote.",
    badge:    null,
    funnel:   "custom",
    cta:      "New Custom Request",
    priceFrom: "SAR 8,000+",
  },
];

const ONBOARDING_STEPS = [
  { id: 1, Icon: Search,     label: "Browse available celebrities",   hint: "Filter by category and discover talent.",       actionLabel: "Browse",  actionIdx: 0 },
  { id: 2, Icon: Tag,        label: "Select a license style",         hint: "Greeting, video ad, or social post.",           actionLabel: null,      actionIdx: 1 },
  { id: 3, Icon: Send,       label: "Submit your first request",      hint: "Takes less than two minutes to complete.",      actionLabel: "Start",   actionIdx: 2 },
  { id: 4, Icon: CreditCard, label: "Buy credits when you need them", hint: "Pay only for what you actually use.",           actionLabel: null,      actionIdx: 3 },
] as const;

/* ─────────────────────────────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────────────────────────────── */

function StatCount({ target }: { target: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const dur = 550;
    let t0: number | null = null;
    let raf: number;
    const step = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      setN(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return <>{n}</>;
}

function useInView(ref: React.RefObject<HTMLElement | null>) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setV(true); return; }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
  return v;
}

/* Inline SVG noise for celebrity card grain overlay */
const GRAIN_SVG =
  `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

/* ─────────────────────────────────────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────────────────────────────────────── */
export function StudioHomeWithFunnel() {
  const router = useRouter();
  const { user } = useUser();

  /* funnel state */
  const [studioOpen, setStudioOpen] = useState(false);
  const [studioTab,  setStudioTab]  = useState<StudioFunnelTab>("greeting");
  const [customOpen, setCustomOpen] = useState(false);
  const [intent,     setIntent]     = useState<FunnelServiceId | null>(null);

  /* page state */
  const [licenseType,    setLicenseType]    = useState<LicenseTypeId>("greeting");
  const [celebFilter,    setCelebFilter]    = useState<CelebCategory>("All");
  const [onboardingOpen, setOnboardingOpen] = useState(true);

  /* API data */
  const [stats,       setStats]       = useState<Record<string, number>>({});
  const [celebs,      setCelebs]      = useState<CelebItem[]>([]);
  const [recentJobs,  setRecentJobs]  = useState<{ id: string; orderId: string; celebrity: string; status: string; createdAt: string }[]>([]);

  /* time greeting — lazy initializer avoids setState-in-effect */
  const [greeting] = useState(() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  });

  /* Fetch stats, celebrities, and recent jobs on mount */
  useEffect(() => {
    jobApi.myStats()
      .then((res) => setStats(res.data))
      .catch(() => { /* fall back to zeros */ });

    celebrityApi.list({ featured: true })
      .then((res) => setCelebs(res.data.map(mapCeleb)))
      .catch(() => { /* keep empty — zero state shown */ });

    jobApi.myJobs(undefined, 1, 5)
      .then((res) => setRecentJobs(res.data.map((j) => ({
        id:         j.referenceId,
        orderId:    j.referenceId,
        celebrity:  j.celebrityId?.name ?? "Celebrity",
        status:     j.status,
        createdAt:  j.createdAt,
      }))))
      .catch(() => { /* keep empty */ });
  }, []);

  /* scroll-reveal refs */
  const celebRef    = useRef<HTMLElement>(null);
  const licenseRef  = useRef<HTMLElement>(null);
  const activityRef = useRef<HTMLElement>(null);
  const onboardRef  = useRef<HTMLElement>(null);
  const celebVisible    = useInView(celebRef);
  const licenseVisible  = useInView(licenseRef);
  const activityVisible = useInView(activityRef);
  const onboardVisible  = useInView(onboardRef);

  const name          = (user?.name ?? "there").split(" ")[0];
  const activeLic     = LICENSE_TYPES.find((l) => l.id === licenseType)!;
  const totalRequests = Object.values(stats).reduce((a, b) => a + b, 0);

  /* KPI strip — derived from API stats */
  const STATS = [
    {
      id:      "requests",
      label:   "Total Requests",
      value:   totalRequests,
      Icon:    FileText,
      href:    "/studio/requests",
      zeroCta: "Start your first request",
      subtext: "All time",
    },
    {
      id:      "pending",
      label:   "In Production",
      value:   (stats["pending"] ?? 0) + (stats["in-progress"] ?? 0),
      Icon:    Clock,
      href:    "/studio/requests",
      zeroCta: "Nothing in progress",
      subtext: "Being processed",
    },
    {
      id:      "review",
      label:   "Ready for Review",
      value:   stats["review"] ?? 0,
      Icon:    CheckCircle,
      href:    "/studio/requests",
      zeroCta: "No previews yet",
      subtext: "Awaiting your review",
    },
    {
      id:      "delivered",
      label:   "Delivered",
      value:   stats["delivered"] ?? 0,
      Icon:    Zap,
      href:    "/studio/requests",
      zeroCta: "No deliveries yet",
      subtext: "Ready to download",
    },
  ] as const;

  const filteredCelebs = useMemo(() =>
    celebFilter === "All" ? celebs : celebs.filter((c) => c.category === celebFilter),
    [celebFilter, celebs]
  );

  function openFunnel(service: FunnelServiceId) {
    if (service === "greeting")  { setStudioTab("greeting");  setStudioOpen(true); return; }
    if (service === "campaign")  { setStudioTab("campaign");  setStudioOpen(true); return; }
    if (service === "image-ad")  { router.push("/studio/image-ad"); return; }
    if (service === "custom")    { setStudioTab("custom");    setStudioOpen(true); return; }
    setIntent(service);
    setCustomOpen(true);
  }

  const reveal = (visible: boolean, delay = 0): React.CSSProperties => ({
    opacity:    visible ? 1 : 0,
    transform:  visible ? "none" : "translateY(6px)",
    transition: `opacity 240ms ease-out ${delay}ms, transform 240ms ease-out ${delay}ms`,
  });

  /* ─── render ─── */
  return (
    /* FIX 4: pageRoot provides scoped CSS vars (--tx-2, --tx-3, --tx-4) */
    <div className={styles.pageRoot}>
      <StudioTabbedFunnels
        open={studioOpen}
        onClose={() => setStudioOpen(false)}
        initialTab={studioTab}
      />
      <StudioFunnel
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        initialService={intent}
      />

      <div className="mx-auto max-w-[1200px] px-6 py-8 md:px-8 md:py-10">

        {/* ── §1 COMMAND AREA ────────────────────────────────────────────── */}
        <section className="mb-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              {/* FIX 4: 0.35 → var(--tx-3) */}
              <p className="mb-1 text-[13px]" style={{ color: "var(--tx-3)" }}>
                {greeting || "Welcome back"}, {name}
              </p>
              <h1
                className="font-display text-[36px] font-extrabold text-white"
                style={{ letterSpacing: "-0.04em", lineHeight: 1.05 }}
              >
                {totalRequests === 0 ? "License a celebrity identity." : "Your studio."}
              </h1>
              {/* FIX 4: 0.45 → var(--tx-2) */}
              <p className="mt-2 max-w-[480px] text-[15px]" style={{ color: "var(--tx-2)", lineHeight: 1.6 }}>
                {totalRequests === 0
                  ? "Browse talent, select a license style, and submit your first request in under two minutes."
                  : "Here's everything that's happening with your requests."}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <a
                href="#discover"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-[13px] font-medium transition-colors duration-150"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border:     "1px solid rgba(255,255,255,0.10)",
                  color:      "rgba(255,255,255,0.70)",
                }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "rgba(255,255,255,0.08)"; el.style.color = "#FFFFFF"; }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "rgba(255,255,255,0.05)"; el.style.color = "rgba(255,255,255,0.70)"; }}
              >
                Browse celebrities
              </a>
              {/* Purple kept here — this is the PRIMARY CTA, one of max 3 purple elements */}
              <button
                type="button"
                onClick={() => {
                  /* Image Ad is a separate page — funnel CTA always opens the 3-tab video funnel */
                  const funnelTarget = activeLic.funnel === "image-ad" ? "greeting" : activeLic.funnel;
                  setStudioTab(funnelTarget as StudioFunnelTab);
                  setStudioOpen(true);
                }}
                className="inline-flex h-9 items-center gap-2 rounded-lg px-5 text-[13px] font-semibold text-white transition-opacity duration-150 hover:opacity-90"
                style={{ background: "#7C3AED", boxShadow: "0 1px 3px rgba(0,0,0,0.40), 0 0 0 1px rgba(124,58,237,0.50)" }}
              >
                New Request
                <ArrowRight size={14} aria-hidden />
              </button>
            </div>
          </div>

          <div className="mt-8" style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
        </section>

        {/* ── §2 KPI STRIP ───────────────────────────────────────────────── */}
        <section className="mb-10">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {STATS.map(({ id, label, value, Icon, href, zeroCta, subtext }) => (
              /* FIX 5: cursor-pointer + focus-visible ring */
              <Link
                key={id}
                href={href}
                className="group flex flex-col rounded-xl p-5 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.background  = "rgba(255,255,255,0.045)";
                  el.style.borderColor = "rgba(255,255,255,0.10)";
                  el.style.boxShadow   = "0 4px 16px rgba(0,0,0,0.22)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.background  = "rgba(255,255,255,0.025)";
                  el.style.borderColor = "rgba(255,255,255,0.06)";
                  el.style.boxShadow   = "none";
                }}
              >
                {/* FIX 4: icon 0.25 → var(--tx-4); label 0.40 → var(--tx-2) */}
                <div className="flex items-center gap-2">
                  <Icon size={13} style={{ color: "var(--tx-4)", flexShrink: 0 }} aria-hidden />
                  <span className="text-[12px] font-medium" style={{ color: "var(--tx-2)" }}>
                    {label}
                  </span>
                </div>
                <div className="mt-3">
                  {value === 0 ? (
                    <>
                      <p className="text-[22px] font-bold tabular-nums text-white" style={{ letterSpacing: "-0.02em", lineHeight: 1 }}>
                        0
                      </p>
                      {/* FIX 4: 0.28 → var(--tx-4) */}
                      <p className="mt-1.5 text-[12px]" style={{ color: "var(--tx-4)" }}>
                        {zeroCta}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[22px] font-bold tabular-nums text-white" style={{ letterSpacing: "-0.02em", lineHeight: 1 }}>
                        <StatCount target={value} />
                      </p>
                      {/* FIX 4: 0.35 → var(--tx-3) */}
                      <p className="mt-1.5 text-[12px]" style={{ color: "var(--tx-3)" }}>
                        {subtext}
                      </p>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── §3 ONBOARDING — zero state only ────────────────────────────── */}
        {totalRequests === 0 && onboardingOpen && (
          <section
            ref={onboardRef as React.RefObject<HTMLElement>}
            className="mb-10"
            style={reveal(onboardVisible)}
          >
            <div
              className="rounded-xl p-6"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {/* Header row */}
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-[22px] font-bold text-white" style={{ letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                    Get started
                  </h2>
                  <p className="mt-1 text-[13px]" style={{ color: "var(--tx-3)" }}>
                    4 steps to your first licensed campaign
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOnboardingOpen(false)}
                  className="mt-1 shrink-0 text-[12px] transition-colors duration-150"
                  style={{ color: "var(--tx-4)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.55)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--tx-4)"; }}
                  aria-label="Dismiss onboarding"
                >
                  Dismiss
                </button>
              </div>

              {/* Step cards — stacked layout */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {ONBOARDING_STEPS.map((step, i) => {
                  const { Icon } = step;
                  return (
                    <div
                      key={step.id}
                      className="flex flex-col gap-4 rounded-xl px-4 py-5"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      {/* Top row: icon badge + step number */}
                      <div className="flex items-center justify-between">
                        <div
                          className="flex size-10 items-center justify-center rounded-xl"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}
                        >
                          <Icon size={17} style={{ color: "rgba(255,255,255,0.50)" }} aria-hidden />
                        </div>
                        <span
                          className="flex size-6 items-center justify-center rounded-full text-[11px] font-bold tabular-nums"
                          style={{
                            background: "rgba(255,255,255,0.08)",
                            border:     "1px solid rgba(255,255,255,0.14)",
                            color:      "rgba(255,255,255,0.45)",
                          }}
                        >
                          {step.id}
                        </span>
                      </div>

                      {/* Text content */}
                      <div className="flex flex-col gap-1.5">
                        <p className="text-[13px] font-semibold leading-snug" style={{ color: "rgba(255,255,255,0.85)" }}>
                          {step.label}
                        </p>
                        <p className="text-[12px] leading-relaxed" style={{ color: "var(--tx-3)" }}>
                          {step.hint}
                        </p>
                      </div>

                      {/* Optional CTA */}
                      {i === 0 && (
                        <button
                          type="button"
                          onClick={() => openFunnel("campaign")}
                          className="mt-auto inline-flex items-center gap-1.5 self-start rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all duration-150"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            border:     "1px solid rgba(255,255,255,0.10)",
                            color:      "rgba(255,255,255,0.60)",
                          }}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget as HTMLButtonElement;
                            el.style.background = "rgba(255,255,255,0.09)";
                            el.style.color = "rgba(255,255,255,0.90)";
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget as HTMLButtonElement;
                            el.style.background = "rgba(255,255,255,0.05)";
                            el.style.color = "rgba(255,255,255,0.60)";
                          }}
                        >
                          Browse <ArrowRight size={11} aria-hidden />
                        </button>
                      )}
                      {i === 2 && (
                        <button
                          type="button"
                          onClick={() => openFunnel(activeLic.funnel)}
                          className="mt-auto inline-flex items-center gap-1.5 self-start rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all duration-150"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            border:     "1px solid rgba(255,255,255,0.10)",
                            color:      "rgba(255,255,255,0.60)",
                          }}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget as HTMLButtonElement;
                            el.style.background = "rgba(255,255,255,0.09)";
                            el.style.color = "rgba(255,255,255,0.90)";
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget as HTMLButtonElement;
                            el.style.background = "rgba(255,255,255,0.05)";
                            el.style.color = "rgba(255,255,255,0.60)";
                          }}
                        >
                          Start <ArrowRight size={11} aria-hidden />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── §4 DISCOVER CELEBRITIES ──────────────────────────────────────── */}
        <section
          id="discover"
          ref={celebRef as React.RefObject<HTMLElement>}
          className="mb-10"
          style={reveal(celebVisible)}
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-[22px] font-bold text-white" style={{ letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                Discover Celebrities
              </h2>
              {/* FIX 4: 0.38 → var(--tx-3) */}
              <p className="mt-0.5 text-[15px]" style={{ color: "var(--tx-3)", lineHeight: 1.6 }}>
                Licensed talent available for commercial campaigns
              </p>
            </div>
            {/* FIX 4: 0.40 → var(--tx-2) */}
            <button
              type="button"
              onClick={() => openFunnel("campaign")}
              className="inline-flex items-center gap-1 text-[12px] font-medium transition-colors duration-150"
              style={{ color: "var(--tx-2)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.80)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--tx-2)"; }}
            >
              View all <ArrowRight size={12} aria-hidden />
            </button>
          </div>

          {/* Category filter tabs */}
          <div className="mb-5 flex flex-wrap gap-1.5">
            {CELEB_FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setCelebFilter(f)}
                className="rounded-full px-3 py-1 text-[12px] font-medium transition-all duration-150"
                style={
                  celebFilter === f
                    ? { background: "rgba(255,255,255,0.10)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.18)" }
                    /* FIX 4: 0.35 → var(--tx-3) */
                    : { background: "transparent", color: "var(--tx-3)", border: "1px solid rgba(255,255,255,0.07)" }
                }
              >
                {f}
              </button>
            ))}
          </div>

          {/* Celebrity grid */}
          {filteredCelebs.length === 0 ? (
            /* FIX 4: 0.25 → var(--tx-4) */
            <p className="py-6 text-center text-[13px]" style={{ color: "var(--tx-4)" }}>
              No celebrities in this category yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {filteredCelebs.map((c) => (
                <div
                  key={c._id}
                  className={`${styles.celebCard} relative cursor-pointer overflow-hidden rounded-xl`}
                  style={{ border: "1px solid rgba(255,255,255,0.07)", transition: "box-shadow 200ms ease, border-color 200ms ease" }}
                  onClick={() => openFunnel("campaign")}
                  role="button"
                  tabIndex={0}
                  aria-label={`License ${c.name}`}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openFunnel("campaign"); } }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.boxShadow   = "0 8px 28px rgba(0,0,0,0.40)";
                    el.style.borderColor = "rgba(255,255,255,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.boxShadow   = "none";
                    el.style.borderColor = "rgba(255,255,255,0.07)";
                  }}
                >
                  {/* Portrait — 3:4 */}
                  <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
                    {/* Photo — covers entire portrait area */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.img}
                      alt={c.name}
                      className={`${styles.celebVisual} absolute inset-0 h-full w-full object-cover object-top`}
                    />

                    {/* Dark vignette — top edge so pill stays readable */}
                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 h-20"
                      style={{ background: "linear-gradient(to bottom, rgba(9,8,15,0.55) 0%, transparent 100%)" }}
                      aria-hidden
                    />

                    {/* Grain texture overlay */}
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        backgroundImage: GRAIN_SVG,
                        backgroundRepeat: "repeat",
                        backgroundSize: "200px 200px",
                      }}
                      aria-hidden
                    />

                    {/* Category pill — top-right */}
                    <div
                      className="absolute end-2.5 top-2.5 rounded-full px-2 py-0.5 text-[12px] font-medium"
                      style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.80)", backdropFilter: "blur(6px)" }}
                    >
                      {c.category}
                    </div>

                    {/* Bottom gradient + info */}
                    <div
                      className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-14"
                      style={{ background: "linear-gradient(to top, rgba(9,8,15,0.96) 40%, rgba(9,8,15,0.60) 75%, transparent 100%)" }}
                    >
                      <p className="truncate text-[17px] font-semibold leading-tight text-white">{c.name}</p>
                      <p className="mt-0.5 truncate text-[12px]" style={{ color: "var(--tx-3)" }}>{c.sub}</p>
                    </div>

                    {/* Hover CTA */}
                    <div
                      className={`${styles.celebCta} absolute inset-x-0 bottom-0 flex h-9 items-center justify-center`}
                      style={{ background: "rgba(124,58,237,0.92)", backdropFilter: "blur(4px)" }}
                      aria-hidden
                    >
                      <span className="text-[12px] font-semibold text-white">License Now</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── §5 LICENSE STYLE SELECTOR ────────────────────────────────────── */}
        <section
          ref={licenseRef as React.RefObject<HTMLElement>}
          className="mb-10"
          style={reveal(licenseVisible, 40)}
        >
          <div className="mb-5">
            <h2 className="font-display text-[22px] font-bold text-white" style={{ letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Choose a License Style
            </h2>
            {/* FIX 4: 0.38 → var(--tx-3) */}
            <p className="mt-0.5 text-[15px]" style={{ color: "var(--tx-3)", lineHeight: 1.6 }}>
              Select a request type — this pre-fills the form when you hit &ldquo;New Request&rdquo;
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {LICENSE_TYPES.map(({ id, Icon, title, desc, badge, funnel, isNew, priceFrom }) => {
              const sel = licenseType === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setLicenseType(id)}
                  className="relative flex flex-col items-start rounded-xl p-5 text-start transition-all duration-150"
                  style={{
                    background: sel ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
                    border:     sel ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.06)",
                    borderLeft: sel ? "2px solid #7C3AED" : "2px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (sel) return;
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    if (sel) return;
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.02)";
                  }}
                >
                  {/* Badge — "NEW" uses gradient-brand; others use muted */}
                  {badge && (
                    <span
                      className="absolute end-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={
                        isNew
                          ? { background: "linear-gradient(135deg, #8B5CF6 0%, #3D1A6E 100%)", color: "#FFFFFF", letterSpacing: "0.08em" }
                          : { background: "rgba(255,255,255,0.07)", color: "var(--tx-2)", border: "1px solid rgba(255,255,255,0.08)" }
                      }
                    >
                      {badge}
                    </span>
                  )}

                  {/* Icon */}
                  <div
                    className="flex size-9 items-center justify-center rounded-lg"
                    style={{
                      background: sel
                        ? (isNew ? "linear-gradient(135deg, #8B5CF6 0%, #3D1A6E 100%)" : "rgba(124,58,237,0.15)")
                        : (isNew ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.05)"),
                      color:      sel ? "#FFFFFF" : (isNew ? "#A78BFA" : "var(--tx-3)"),
                      boxShadow:  isNew && sel ? "0 0 16px rgba(139,92,246,0.30)" : "none",
                    }}
                  >
                    <Icon size={16} />
                  </div>

                  <p
                    className="mt-3.5 text-[17px] font-semibold leading-tight"
                    style={{ color: sel ? "#FFFFFF" : "rgba(255,255,255,0.75)" }}
                  >
                    {title}
                  </p>
                  <p className="mt-1.5 text-[13px]" style={{ color: "var(--tx-3)", lineHeight: 1.6 }}>
                    {desc}
                  </p>

                  {/* Price from */}
                  {priceFrom && (
                    <p className="mt-2 text-[12px]" style={{ color: sel ? "#C4B5FD" : "var(--tx-4)" }}>
                      From <span style={{ fontWeight: 600 }}>{priceFrom}</span>
                    </p>
                  )}

                  {/* Start request link */}
                  {sel && (
                    <button
                      type="button"
                      className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors duration-150"
                      style={{ color: "var(--tx-2)" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.90)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--tx-2)"; }}
                      onClick={(e) => { e.stopPropagation(); openFunnel(funnel); }}
                    >
                      Start request <ArrowRight size={10} />
                    </button>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── §6 RECENT REQUESTS ───────────────────────────────────────────── */}
        <section
          ref={activityRef as React.RefObject<HTMLElement>}
          style={reveal(activityVisible, 80)}
        >
          <div
            className="overflow-hidden rounded-xl"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <h2 className="font-display text-[22px] font-bold text-white" style={{ letterSpacing: "-0.02em", lineHeight: 1.2 }}>Recent Requests</h2>
              {/* FIX 4: 0.30 → var(--tx-3) */}
              <Link
                href="/studio/requests"
                className="text-[12px] font-medium transition-colors duration-150"
                style={{ color: "var(--tx-3)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.65)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--tx-3)"; }}
              >
                View all →
              </Link>
            </div>

            {recentJobs.length > 0 ? (
              <div>
                {recentJobs.map((job, idx) => (
                  <Link
                    key={job.id}
                    href={`/studio/requests/${job.id}`}
                    className="flex items-center justify-between px-5 py-3.5 transition-colors duration-150"
                    style={{
                      borderBottom: idx < recentJobs.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.03)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[11px] font-mono shrink-0" style={{ color: "var(--tx-4)" }}>
                        {job.orderId}
                      </span>
                      <span className="truncate text-[13px] text-white">{job.celebrity}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize"
                        style={{
                          background: job.status === "delivered" ? "rgba(34,197,94,0.12)" : job.status === "review" ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.06)",
                          color:      job.status === "delivered" ? "#4ADE80" : job.status === "review" ? "#60A5FA" : "rgba(255,255,255,0.50)",
                          border:     "1px solid " + (job.status === "delivered" ? "rgba(34,197,94,0.20)" : job.status === "review" ? "rgba(59,130,246,0.20)" : "rgba(255,255,255,0.08)"),
                        }}
                      >
                        {job.status.replace(/-/g, " ")}
                      </span>
                      <span className="text-[11px]" style={{ color: "var(--tx-4)" }}>
                        {new Date(job.createdAt).toLocaleDateString("en-SA", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <div
                  className="flex size-11 items-center justify-center rounded-xl"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  aria-hidden
                >
                  <Inbox size={20} style={{ color: "var(--tx-4)" }} />
                </div>
                <p className="mt-4 text-[17px] font-semibold text-white">No requests yet</p>
                <p className="mt-1 max-w-[320px] text-[15px]" style={{ color: "var(--tx-2)", lineHeight: 1.6 }}>
                  Submit your first celebrity license request — it takes less than 2 minutes.
                </p>
                <button
                  type="button"
                  onClick={() => openFunnel(activeLic.funnel)}
                  className="mt-5 inline-flex h-8 items-center gap-1.5 rounded-lg px-4 text-[12px] font-medium transition-all duration-150"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border:     "1px solid rgba(255,255,255,0.12)",
                    color:      "rgba(255,255,255,0.75)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.background = "rgba(255,255,255,0.09)";
                    el.style.color      = "#FFFFFF";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.background = "rgba(255,255,255,0.05)";
                    el.style.color      = "rgba(255,255,255,0.75)";
                  }}
                >
                  Create your first request
                  <ArrowRight size={12} aria-hidden />
                </button>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
