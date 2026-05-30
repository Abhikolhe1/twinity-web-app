"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, PencilLine, LifeBuoy, AlertTriangle, Loader2, BadgeCheck } from "lucide-react";
import { jobApi, type ApiRevision } from "@/lib/api";

/* ── Types ───────────────────────────────────────────────────────────────── */
interface RevisionMeta {
  revisionCount: number;
  revisionLimit: number;
  revisionsRemaining: number;
  isEscalatedToSupport: boolean;
}

interface PreviewReviewPanelProps {
  referenceId: string;
  isPreviewApproved?: boolean;
  onApproved: () => void;
  onRevisionSubmitted: () => void;
  onEscalated: () => void;
}

/* ── Sub-components ──────────────────────────────────────────────────────── */
function ActionCard({
  icon: Icon,
  title,
  description,
  buttonLabel,
  buttonVariant,
  disabled,
  loading,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  description: string;
  buttonLabel: string;
  buttonVariant: "primary" | "warning" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
}) {
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: "linear-gradient(135deg, #8B5CF6 0%, #3D1A6E 100%)",
      color: "#FFF",
      border: "none",
      boxShadow: "0 1px 3px rgba(0,0,0,0.40), 0 0 0 1px rgba(139,92,246,0.40)",
    },
    warning: {
      background: "rgba(245,158,11,0.08)",
      color: "#F59E0B",
      border: "1px solid rgba(245,158,11,0.40)",
    },
    ghost: {
      background: "rgba(239,68,68,0.07)",
      color: "#EF4444",
      border: "1px solid rgba(239,68,68,0.30)",
    },
  };

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 12,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        flex: 1,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            width: 36, height: 36, borderRadius: 9999,
            background: "rgba(124,58,237,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}
        >
          <Icon size={16} color="#7C3AED" />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#0F0A1E", margin: "0 0 4px" }}>{title}</p>
          <p style={{ fontSize: 12, color: "rgba(15,10,30,0.50)", margin: 0, lineHeight: 1.5 }}>{description}</p>
        </div>
      </div>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={onClick}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          height: 38, borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.45 : 1, transition: "opacity 150ms",
          ...variantStyles[buttonVariant],
        }}
      >
        {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : null}
        {buttonLabel}
      </button>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export function PreviewReviewPanel({
  referenceId,
  isPreviewApproved = false,
  onApproved,
  onRevisionSubmitted,
  onEscalated,
}: PreviewReviewPanelProps) {
  const [meta, setMeta] = useState<RevisionMeta | null>(null);
  const [revisions, setRevisions] = useState<ApiRevision[]>([]);
  const [loading, setLoading] = useState(true);

  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [approvingBusy, setApprovingBusy] = useState(false);
  const [localApproved, setLocalApproved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    jobApi.getRevisions(referenceId)
      .then((res) => {
        setMeta(res.meta);
        setRevisions(res.data);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [referenceId]);

  async function handleApprove() {
    setError("");
    setApprovingBusy(true);
    try {
      await jobApi.approvePreview(referenceId);
      setLocalApproved(true);
      onApproved();
    } catch (err: unknown) {
      setError((err as Error).message || "Approval failed");
      setApprovingBusy(false);
    }
  }

  if (loading) return null;

  const isEscalated    = meta?.isEscalatedToSupport ?? false;
  const noRevisionsLeft = (meta?.revisionsRemaining ?? 0) <= 0;
  const approved       = isPreviewApproved || localApproved;

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div
        style={{
          background: "#FAFAFA",
          border: `1px solid ${approved ? "rgba(5,150,105,0.25)" : "rgba(0,0,0,0.08)"}`,
          borderRadius: 16,
          padding: "20px 20px 24px",
        }}
      >
        <p style={{ fontSize: 13, fontWeight: 700, color: "#0F0A1E", margin: "0 0 4px" }}>
          Preview Review
        </p>
        <p style={{ fontSize: 12, color: "rgba(15,10,30,0.50)", margin: "0 0 16px", lineHeight: 1.5 }}>
          {approved
            ? "Your preview has been approved. Our team is preparing your final content."
            : isEscalated
            ? "This request has been escalated to our support team. An Account Manager will contact you."
            : `Review the watermarked preview above and choose an action. You have ${meta?.revisionsRemaining ?? 0} of ${meta?.revisionLimit ?? 1} revision(s) remaining.`}
        </p>

        {error && (
          <div style={{
            display: "flex", gap: 8, alignItems: "center",
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.20)",
            borderRadius: 8, padding: "10px 14px", marginBottom: 14,
          }}>
            <AlertTriangle size={14} color="#EF4444" />
            <span style={{ fontSize: 12, color: "#EF4444" }}>{error}</span>
          </div>
        )}

        {/* ── Approved success state ── */}
        {approved && (
          <div style={{
            display: "flex", alignItems: "center", gap: 14,
            background: "rgba(5,150,105,0.06)", border: "1px solid rgba(5,150,105,0.20)",
            borderRadius: 12, padding: "16px 20px",
          }}>
            <BadgeCheck size={28} color="#059669" style={{ flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#065F46", margin: "0 0 3px" }}>
                Preview Approved
              </p>
              <p style={{ fontSize: 12, color: "#047857", margin: 0, lineHeight: 1.5 }}>
                You have approved this preview. Our team will prepare and deliver your final content shortly.
              </p>
            </div>
          </div>
        )}

        {/* ── Action cards (hidden once approved or escalated) ── */}
        {!isEscalated && !approved && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <ActionCard
              icon={CheckCircle}
              title="Approve Preview"
              description="Accept this output and proceed to final delivery."
              buttonLabel="Approve"
              buttonVariant="primary"
              loading={approvingBusy}
              onClick={handleApprove}
            />
            <ActionCard
              icon={PencilLine}
              title="Request Minor Revision"
              description={
                noRevisionsLeft
                  ? "No revisions remaining for this request."
                  : `${meta?.revisionsRemaining} revision(s) left.`
              }
              buttonLabel="Request Revision"
              buttonVariant="warning"
              disabled={noRevisionsLeft}
              onClick={() => setShowRevisionModal(true)}
            />
            <ActionCard
              icon={LifeBuoy}
              title="Escalate to Support"
              description="Contact our team for assistance with this request."
              buttonLabel="Get Support"
              buttonVariant="ghost"
              onClick={() => setShowEscalateModal(true)}
            />
          </div>
        )}

        {revisions.length > 0 && (
          <RevisionHistoryPanel revisions={revisions} />
        )}
      </div>

      {showRevisionModal && (
        <RevisionRequestModal
          referenceId={referenceId}
          revisionsRemaining={meta?.revisionsRemaining ?? 0}
          onClose={() => setShowRevisionModal(false)}
          onSubmitted={() => {
            setShowRevisionModal(false);
            onRevisionSubmitted();
          }}
        />
      )}

      {showEscalateModal && (
        <EscalateToSupportModal
          referenceId={referenceId}
          onClose={() => setShowEscalateModal(false)}
          onEscalated={() => {
            setShowEscalateModal(false);
            onEscalated();
          }}
        />
      )}
    </>
  );
}

/* ── Revision Request Modal ──────────────────────────────────────────────── */
function RevisionRequestModal({
  referenceId,
  revisionsRemaining,
  onClose,
  onSubmitted,
}: {
  referenceId: string;
  revisionsRemaining: number;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [materialWarning, setMaterialWarning] = useState(false);
  const [error, setError] = useState("");

  const MATERIAL_TRIGGERS = [
    "change the brand", "different brand", "new brand",
    "change the product", "different product", "new product",
    "change the celebrity", "different celebrity", "new celebrity",
    "change the script", "rewrite the script", "full script",
    "marketing message", "change the message", "different message",
    "change platform", "different platform", "new platform",
    "change distribution", "change territory", "different country", "different territory",
    "change duration", "different duration",
    "extend the license", "change license",
    "convert to customized", "convert to template",
    "switch to customized", "switch to template",
    "change ad type", "different ad type",
    "change category", "different sector",
    "competitor brand", "medical claim", "financial claim", "legal claim", "regulated claim",
  ];

  function checkForMaterial(text: string) {
    const lower = text.toLowerCase();
    setMaterialWarning(MATERIAL_TRIGGERS.some((kw) => lower.includes(kw)));
  }

  async function submit() {
    if (!reason.trim()) { setError("Please describe your revision request."); return; }
    setBusy(true);
    setError("");
    try {
      const res = await jobApi.requestRevision(referenceId, reason.trim());
      if (!res.success && res.classification === "material") {
        setError("This change is classified as material and cannot be processed as a revision. Please submit a new request.");
        setBusy(false);
        return;
      }
      onSubmitted();
    } catch (err: unknown) {
      setError((err as Error).message || "Submission failed");
      setBusy(false);
    }
  }

  return (
    <div style={OVERLAY_STYLE}>
      <div style={MODAL_STYLE}>
        <p style={{ fontSize: 15, fontWeight: 700, color: "#0F0A1E", margin: "0 0 4px" }}>Request Minor Revision</p>
        <p style={{ fontSize: 12, color: "rgba(15,10,30,0.50)", margin: "0 0 16px" }}>
          {revisionsRemaining} revision(s) remaining after this request.
        </p>

        {materialWarning && (
          <div style={{
            display: "flex", gap: 8, alignItems: "flex-start",
            background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.30)",
            borderRadius: 8, padding: "10px 14px", marginBottom: 12,
          }}>
            <AlertTriangle size={14} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 12, color: "#92400E", lineHeight: 1.5 }}>
              Your description may include a material change (e.g. brand, celebrity, territory). Material changes
              require a new request — they cannot be processed as revisions.
            </span>
          </div>
        )}

        <textarea
          value={reason}
          onChange={(e) => { setReason(e.target.value); checkForMaterial(e.target.value); }}
          placeholder="Describe the specific adjustment you need (e.g. 'Fix pronunciation of the brand name', 'Slightly adjust the pacing')..."
          rows={5}
          style={{
            width: "100%", borderRadius: 8, border: "1px solid rgba(0,0,0,0.12)",
            padding: "10px 12px", fontSize: 13, color: "#0F0A1E", resize: "vertical",
            fontFamily: "inherit", outline: "none", boxSizing: "border-box",
          }}
        />

        {error && (
          <p style={{ fontSize: 12, color: "#EF4444", margin: "6px 0 0" }}>{error}</p>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} style={GHOST_BTN_STYLE}>Cancel</button>
          <button
            type="button"
            onClick={submit}
            disabled={busy || !reason.trim()}
            style={{ ...PRIMARY_BTN_STYLE, opacity: busy || !reason.trim() ? 0.5 : 1 }}
          >
            {busy ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : null}
            Submit Revision
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Escalate to Support Modal ───────────────────────────────────────────── */
function EscalateToSupportModal({
  referenceId,
  onClose,
  onEscalated,
}: {
  referenceId: string;
  onClose: () => void;
  onEscalated: () => void;
}) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setBusy(true);
    setError("");
    try {
      await jobApi.escalateToSupport(referenceId, reason.trim() || undefined);
      onEscalated();
    } catch (err: unknown) {
      setError((err as Error).message || "Escalation failed");
      setBusy(false);
    }
  }

  return (
    <div style={OVERLAY_STYLE}>
      <div style={MODAL_STYLE}>
        <p style={{ fontSize: 15, fontWeight: 700, color: "#0F0A1E", margin: "0 0 4px" }}>Escalate to Support</p>
        <p style={{ fontSize: 12, color: "rgba(15,10,30,0.50)", margin: "0 0 16px", lineHeight: 1.5 }}>
          An Account Manager will review your request and contact you. Once escalated, you will not be able to submit
          further revision requests for this order.
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Briefly describe the issue (optional)..."
          rows={4}
          style={{
            width: "100%", borderRadius: 8, border: "1px solid rgba(0,0,0,0.12)",
            padding: "10px 12px", fontSize: 13, color: "#0F0A1E", resize: "vertical",
            fontFamily: "inherit", outline: "none", boxSizing: "border-box",
          }}
        />

        {error && (
          <p style={{ fontSize: 12, color: "#EF4444", margin: "6px 0 0" }}>{error}</p>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} style={GHOST_BTN_STYLE}>Cancel</button>
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            style={{ ...PRIMARY_BTN_STYLE, opacity: busy ? 0.5 : 1, background: "rgba(239,68,68,0.1)", color: "#EF4444", boxShadow: "none", border: "1px solid rgba(239,68,68,0.30)" }}
          >
            {busy ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : null}
            Escalate to Support
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Revision History Panel ──────────────────────────────────────────────── */
export function RevisionHistoryPanel({ revisions }: { revisions: ApiRevision[] }) {
  if (!revisions.length) return null;

  const TYPE_LABEL: Record<string, string> = {
    minor: "Minor",
    material: "Material",
    escalation: "Escalation",
  };
  const TYPE_COLOR: Record<string, string> = {
    minor: "#059669",
    material: "#DC2626",
    escalation: "#D97706",
  };
  const STATUS_COLOR: Record<string, string> = {
    pending: "#6B7280",
    approved: "#059669",
    rejected: "#DC2626",
    escalated: "#D97706",
  };

  return (
    <div style={{ marginTop: 20, borderTop: "1px solid rgba(0,0,0,0.07)", paddingTop: 16 }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px" }}>
        Revision History
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {revisions.map((rev) => (
          <div
            key={rev.id}
            style={{
              display: "flex", gap: 12, alignItems: "flex-start",
              padding: "10px 14px", background: "#F9F9F9",
              border: "1px solid rgba(0,0,0,0.06)", borderRadius: 8,
            }}
          >
            <div
              style={{
                width: 22, height: 22, borderRadius: 9999, background: "rgba(124,58,237,0.10)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, fontSize: 11, fontWeight: 700, color: "#7C3AED",
              }}
            >
              {rev.attempt_number}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: TYPE_COLOR[rev.classification ?? rev.type] ?? "#6B7280" }}>
                  {TYPE_LABEL[rev.classification ?? rev.type] ?? "Unknown"}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 600, color: STATUS_COLOR[rev.status] ?? "#6B7280",
                  background: `${STATUS_COLOR[rev.status] ?? "#6B7280"}15`,
                  borderRadius: 4, padding: "1px 6px",
                }}>
                  {rev.status.charAt(0).toUpperCase() + rev.status.slice(1)}
                </span>
              </div>
              <p style={{ fontSize: 12, color: "rgba(15,10,30,0.60)", margin: 0, lineHeight: 1.4 }}>
                {rev.reason}
              </p>
              <p style={{ fontSize: 11, color: "rgba(15,10,30,0.35)", margin: "4px 0 0" }}>
                {new Date(rev.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Shared styles ───────────────────────────────────────────────────────── */
const OVERLAY_STYLE: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 1000, padding: 20,
};
const MODAL_STYLE: React.CSSProperties = {
  background: "#FFFFFF", borderRadius: 16, padding: "24px",
  width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.20)",
};
const PRIMARY_BTN_STYLE: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
  height: 38, paddingInline: 18, borderRadius: 9, border: "none",
  background: "linear-gradient(135deg, #8B5CF6 0%, #3D1A6E 100%)",
  color: "#FFF", fontSize: 13, fontWeight: 600, cursor: "pointer",
  boxShadow: "0 1px 3px rgba(0,0,0,0.30)",
};
const GHOST_BTN_STYLE: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  height: 38, paddingInline: 16, borderRadius: 9,
  border: "1px solid rgba(0,0,0,0.10)", background: "transparent",
  color: "rgba(15,10,30,0.45)", fontSize: 13, fontWeight: 500, cursor: "pointer",
};
