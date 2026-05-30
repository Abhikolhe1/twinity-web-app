"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, MessageCircle, RotateCw, XCircle } from "lucide-react";
import Link from "next/link";

import { RequestActionBanner }  from "@/components/requests/RequestActionBanner";
import { RequestDetailCard }    from "@/components/requests/RequestDetailCard";
import { RequestGateStepper }   from "@/components/requests/RequestGateStepper";
import { RequestMediaPreview }  from "@/components/requests/RequestMediaPreview";
import { RequestStatusBadge }   from "@/components/requests/RequestStatusBadge";
import { RequestTimeline }      from "@/components/requests/RequestTimeline";
import { RegenerationStudio }   from "@/components/requests/RegenerationStudio";
import { PreviewReviewPanel }   from "@/components/requests/PreviewReviewPanel";
import type { TimelineEvent, TimelineEventType, TimelineActor } from "@/components/requests/RequestTimeline";
import { computeGateStatuses }  from "@/lib/request-statuses";
import { MOCK_CREDIT_BALANCE }  from "@/lib/credits";
import type { MockRequest }     from "@/lib/studio/mock-requests";
import { jobApi, mapApiJobToRequest, type ApiVideoJob } from "@/lib/api";
import { formatValidationReason, storeImageAdResumeDraft } from "@/lib/request-recovery";

/* ── Status → timeline event mapping ────────────────────────────────────── */
const STATUS_TIMELINE: Record<string, { eventType: TimelineEventType; actor: TimelineActor; label: string }> = {
  pending:       { eventType: "REQUEST_CREATED",   actor: "CLIENT", label: "Request submitted" },
  "in-progress": { eventType: "PROVIDER_JOB",      actor: "SYSTEM", label: "Production started" },
  review:        { eventType: "PREVIEW_READY",      actor: "SYSTEM", label: "Preview ready for review" },
  delivered:     { eventType: "DELIVERED",          actor: "SYSTEM", label: "Content delivered" },
  failed:        { eventType: "PROCESSING_FAILED",  actor: "SYSTEM", label: "Processing failed" },
  cancelled:     { eventType: "CANCELLED",          actor: "CLIENT", label: "Request cancelled" },
};

function hasReviewableMedia(job: Pick<ApiVideoJob, "preview_url" | "watermarked_url" | "final_video_url">) {
  return Boolean(job.preview_url || job.watermarked_url || job.final_video_url);
}

function isValidationFailure(job: Pick<ApiVideoJob, "error_message" | "validation_result">) {
  const blockedWords = Array.isArray((job.validation_result as Record<string, unknown> | undefined)?.blockedWords)
    ? ((job.validation_result as Record<string, unknown>).blockedWords as unknown[])
    : [];
  if (blockedWords.length > 0) return true;

  const error = String(job.error_message || "").toLowerCase();
  if (!error) return false;
  return (
    error.includes("validation") ||
    error.includes("prohibited") ||
    error.includes("restricted content") ||
    error.includes("blocked")
  );
}

function buildTimeline(job: ApiVideoJob): TimelineEvent[] {
  const history = job.status_history ?? [];

  if (history.length > 0) {
    return history.map((entry, index) => {
      const failedMapping = isValidationFailure(job)
        ? { eventType: "VALIDATION_FAILED" as TimelineEventType, actor: "SYSTEM" as TimelineActor, label: "Validation failed" }
        : { eventType: "PROCESSING_FAILED" as TimelineEventType, actor: "SYSTEM" as TimelineActor, label: "Processing failed" };
      const mapping = entry.status === "review" && !hasReviewableMedia(job)
        ? { eventType: "PROVIDER_JOB" as TimelineEventType, actor: "SYSTEM" as TimelineActor, label: "Preview processing" }
        : entry.status === "failed"
          ? failedMapping
        : (STATUS_TIMELINE[entry.status] ?? STATUS_TIMELINE.pending);
      return {
        id:          `${job.id}-${entry.status}-${entry.timestamp}-${index}`,
        eventType:   mapping.eventType,
        actor:       mapping.actor,
        label:       mapping.label,
        description: entry.status === "failed"
          ? formatValidationReason(entry.note ?? job.error_message)
          : entry.note,
        timestamp:   entry.timestamp,
      };
    });
  }

  return [
    {
      id:        `${job.id}-created`,
      eventType: "REQUEST_CREATED",
      actor:     "CLIENT",
      label:     "Request submitted",
      description: `${job.product_type} request submitted successfully.`,
      timestamp: job.created_at,
    },
  ];
}

/* ── Skeleton ────────────────────────────────────────────────────────────── */
function Skeleton({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      className="animate-pulse"
      style={{ background: "#E5E7EB", borderRadius: 8, ...style }}
    />
  );
}

function PageSkeleton() {
  return (
    <div style={{ padding: "24px 24px 48px", maxWidth: 1280, margin: "0 auto" }}>
      <Skeleton style={{ height: 14, width: 280, marginBottom: 20 }} />
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
        <Skeleton style={{ height: 28, width: 200 }} />
        <Skeleton style={{ height: 22, width: 80, borderRadius: 9999 }} />
      </div>
      <Skeleton style={{ height: 120, borderRadius: 16, marginBottom: 24 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }} className="md:grid-cols-[3fr_2fr]">
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Skeleton style={{ height: 240, borderRadius: 16 }} />
          <Skeleton style={{ height: 320, borderRadius: 16 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Skeleton style={{ height: 360, borderRadius: 16 }} />
          <Skeleton style={{ height: 140, borderRadius: 12 }} />
        </div>
      </div>
    </div>
  );
}

/* ── Not-found view ──────────────────────────────────────────────────────── */
function NotFoundView() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "80px 24px", textAlign: "center", gap: 12,
    }}>
      <XCircle size={40} color="#EF4444" />
      <p style={{ fontSize: 16, fontWeight: 700, color: "#F0F0F0", margin: 0 }}>
        Request not found
      </p>
      <p style={{ fontSize: 13, color: "#A0A0A0", margin: 0 }}>
        This request doesn&apos;t exist or you don&apos;t have access.
      </p>
      <Link
        href="/studio/requests"
        style={{
          marginTop: 8, display: "inline-flex", alignItems: "center",
          height: 40, paddingInline: 20, borderRadius: 10,
          border: "1px solid #3D3D3D", background: "transparent",
          color: "#A0A0A0", fontSize: 13, fontWeight: 500, textDecoration: "none",
        }}
      >
        ← Back to My Requests
      </Link>
    </div>
  );
}

/* ── Support card ────────────────────────────────────────────────────────── */
function SupportCard() {
  return (
    <div style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12, padding: 20 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <MessageCircle size={20} color="#7C3AED" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#0F0A1E", margin: "0 0 6px" }}>
            Need help?
          </p>
          <p style={{ fontSize: 12, color: "rgba(15,10,30,0.45)", margin: "0 0 14px", lineHeight: 1.5 }}>
            Our support team is available to assist with any questions about your request.
          </p>
          <a
            href="mailto:support@twinity.com"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              height: 40, width: "100%", borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.10)", background: "transparent",
              color: "rgba(15,10,30,0.55)", fontSize: 13, fontWeight: 500, textDecoration: "none",
            }}
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Breadcrumbs ─────────────────────────────────────────────────────────── */
function Breadcrumbs({ orderId }: { orderId: string }) {
  return (
    <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
      <Link href="/studio" style={{ fontSize: 12, color: "#606060", textDecoration: "none" }}>
        Studio
      </Link>
      <ChevronRight size={12} color="rgba(0,0,0,0.22)" />
      <Link href="/studio/requests" style={{ fontSize: 12, color: "#606060", textDecoration: "none" }}>
        My Requests
      </Link>
      <ChevronRight size={12} color="rgba(0,0,0,0.22)" />
      <span style={{ fontSize: 12, color: "#0F0A1E" }}>#{orderId}</span>
    </nav>
  );
}

/* ── Page component ──────────────────────────────────────────────────────── */
export default function RequestDetailPage() {
  const params    = useParams();
  const router    = useRouter();
  const requestId = params.requestId as string;

  const [request,  setRequest]  = useState<MockRequest | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  const mediaPreviewRef = useRef<HTMLDivElement>(null);

  const loadJob = useCallback(() => {
    setLoading(true);
    setNotFound(false);
    jobApi.getJob(requestId)
      .then((res) => {
        setRequest(mapApiJobToRequest(res.data));
        setTimeline(buildTimeline(res.data));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [requestId]);

  useEffect(() => { loadJob(); }, [loadJob]);

  const handleBannerAction = useCallback(() => {
    switch (request?.status) {
      case "VALIDATION_FAILED":
      case "PROCESSING_FAILED":
        if (request.type === "AD_IMAGE" && request.resumeDraft) {
          storeImageAdResumeDraft(request.resumeDraft);
          router.push("/studio/image-ad?resume=1");
          break;
        }
        router.push("/studio");
        break;
      case "PREVIEW_REVIEW":
      case "EDIT_REQUESTED":
        mediaPreviewRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        break;
      case "PENDING_PAYMENT":
        router.push("/studio/checkout");
        break;
      default:
        break;
    }
  }, [request?.resumeDraft, request?.status, request?.type, router]);

  if (loading)              return <PageSkeleton />;
  if (notFound || !request) return <NotFoundView />;

  const gateStatuses = computeGateStatuses(request.status, request.type);
  const activeGateKey = gateStatuses
    ? (Object.entries(gateStatuses).find(([, v]) => v === "active")?.[0] as unknown as number ?? 0)
    : 0;

  return (
    <div
      style={{ padding: "24px 16px 64px", maxWidth: 1280, margin: "0 auto", width: "100%" }}
      className="md:px-8"
    >
      <Breadcrumbs orderId={request.orderId} />

      {/* Page header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12, marginBottom: 24, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h1 style={{
            fontFamily: "var(--font-display, var(--font-sans))",
            fontSize: 22, fontWeight: 700, color: "#0F0A1E",
            letterSpacing: "-0.02em", lineHeight: 1.2, margin: 0,
          }}>
            Request #{request.orderId}
          </h1>
          <RequestStatusBadge status={request.status} size="md" />
        </div>

        <button
          type="button"
          onClick={loadJob}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            height: 36, paddingInline: 14, borderRadius: 8,
            border: "1px solid rgba(0,0,0,0.10)", background: "transparent",
            color: "rgba(15,10,30,0.45)", fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}
        >
          <RotateCw size={14} />
          Refresh
        </button>
      </div>

      {/* Action banner */}
      <div style={{ marginBottom: 20 }}>
        <RequestActionBanner
          status={request.status}
          editFeedback={request.editFeedback}
          validationReason={request.validationReason}
          onAction={handleBannerAction}
        />
      </div>

      {/* Gate stepper */}
      <div style={{ marginBottom: 24 }}>
        <RequestGateStepper
          currentGate={activeGateKey}
          gateStatuses={gateStatuses}
          requestType={request.type}
          complianceRequired={request.type === "AD_IMAGE"}
        />
      </div>

      {/* Two-column grid */}
      <div style={{ display: "grid", gap: 24 }} className="grid-cols-1 md:grid-cols-[3fr_2fr]">
        {/* Left: media + regen studio + timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
          <div ref={mediaPreviewRef}>
          <RequestMediaPreview
            status={request.status}
            previewUrl={request.previewUrl}
            finalUrl={request.finalUrl}
            previewImageUrl={request.previewImageUrl}
            finalImageUrl={request.finalImageUrl}
            mediaType={request.mediaType}
            requestType={request.type}
            aspectRatio={request.adImageBrief?.aspectRatio}
            licenseId={request.licenseId}
            licenseExpiry={request.licenseExpiry}
            licensedChannels={request.licensedChannels}
            clientName={request.clientName}
            referenceId={request.orderId}
          />
          </div>

          {request.status === "PREVIEW_REVIEW" && (
            <PreviewReviewPanel
              referenceId={requestId}
              isPreviewApproved={request.isPreviewApproved}
              onApproved={loadJob}
              onRevisionSubmitted={loadJob}
              onEscalated={loadJob}
            />
          )}

          {(request.type === "GREETING" || request.type === "AD_IMAGE") &&
            (["DELIVERED", "APPROVED", "PREVIEW_REVIEW"] as const).includes(
              request.status as "DELIVERED" | "APPROVED" | "PREVIEW_REVIEW",
            ) && (
              <RegenerationStudio
                requestId={request.requestId ?? requestId}
                requestType={request.type === "AD_IMAGE" ? "AD_IMAGE" : "GREETING"}
                requestStatus={request.status}
                creditBalance={MOCK_CREDIT_BALANCE}
                previousAttempts={[]}
              />
            )}

          <RequestTimeline events={timeline} />
        </div>

        {/* Right: detail card + support */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <RequestDetailCard
            orderId={request.orderId}
            type={request.type}
            celebrity={request.celebrity}
            licenseScope={request.licenseScope}
            adImageBrief={request.adImageBrief}
            brief={request.brief}
            payment={request.payment}
            createdAt={request.createdAt}
            submittedAt={request.submittedAt}
          />
          <SupportCard />
        </div>
      </div>
    </div>
  );
}
