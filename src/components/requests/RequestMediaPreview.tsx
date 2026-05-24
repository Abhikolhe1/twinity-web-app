"use client";

import React from "react";
import { AlertTriangle, DownloadCloud, Eye, Film, Image as ImageIcon, XCircle } from "lucide-react";

import { jobApi } from "@/lib/api";
import type { RequestStatus } from "@/lib/request-statuses";

/* ── Props ───────────────────────────────────────────────────────────────── */
export type RequestMediaPreviewProps = {
  previewUrl?:       string;
  finalUrl?:         string;
  previewImageUrl?:  string | null;
  finalImageUrl?:    string | null;
  status:            RequestStatus;
  mediaType?:        "video" | "image" | "audio";
  /** AD_IMAGE requests render an <img> instead of <video>, and use image-specific copy */
  requestType?:      "GREETING" | "CAMPAIGN" | "CUSTOM_CAMPAIGN" | "AD_IMAGE";
  /** brief.aspectRatio from AD_IMAGE: '1:1' | '4:5' | '16:9' | '9:16' */
  aspectRatio?:      string;
  licenseExpiry?:    string;
  licensedChannels?: string[];
  licenseId?:        string;
  clientName?:       string;
  referenceId?:      string;
};

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function formatExpiry(iso: string): string {
  return new Date(iso).toLocaleDateString("en-SA", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

/* ── Shell card styles ───────────────────────────────────────────────────── */
const cardBase: React.CSSProperties = {
  width:        "100%",
  borderRadius: 16,
  overflow:     "hidden",
  border:       "1px solid rgba(0,0,0,0.08)",
  background:   "#FFFFFF",
  boxShadow:    "0 1px 4px rgba(0,0,0,0.05)",
};

const aspectBox: React.CSSProperties = {
  position:    "relative",
  width:       "100%",
  aspectRatio: "16 / 9",
};

/* ── Media renderer ─────────────────────────────────────────────────────── */
function MediaElement({
  url,
  type = "video",
  blurred = false,
}: {
  url: string;
  type?: "video" | "image" | "audio";
  blurred?: boolean;
}) {
  const mediaStyle: React.CSSProperties = {
    width:      "100%",
    height:     "100%",
    objectFit:  "contain",
    display:    "block",
    filter:     blurred ? "blur(1.5px)" : "none",
    opacity:    blurred ? 0.65 : 1,
    transition: "filter 200ms",
  };

  if (type === "image") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="Request media" style={mediaStyle} />;
  }

  if (type === "audio") {
    return (
      <div style={{ ...aspectBox, display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F5F5" }}>
        <audio controls src={url} style={{ width: "90%" }} />
      </div>
    );
  }

  return (
    <video
      src={url}
      controls={!blurred}
      controlsList="nodownload"
      style={mediaStyle}
      playsInline
      preload="metadata"
    />
  );
}

/* ── Download helper — proxies through API to avoid S3 CORS restrictions ── */
async function downloadViaApi(referenceId: string) {
  const blob = await jobApi.getDownloadBlob(referenceId);
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = `${referenceId}.mp4`;
  a.click();
  URL.revokeObjectURL(blobUrl);
}

/* ── License info card ───────────────────────────────────────────────────── */
function LicenseInfoCard({
  licenseId,
  clientName,
  licenseExpiry,
  licensedChannels,
  finalUrl,
  referenceId,
}: {
  licenseId?: string;
  clientName?: string;
  licenseExpiry?: string;
  licensedChannels?: string[];
  finalUrl?: string;
  referenceId?: string;
}) {
  const [downloading, setDownloading] = React.useState(false);
  const expiryDays   = licenseExpiry ? daysUntil(licenseExpiry) : null;
  const urgentExpiry = expiryDays !== null && expiryDays <= 3;

  const rowStyle: React.CSSProperties = {
    display:        "flex",
    justifyContent: "space-between",
    alignItems:     "center",
    padding:        "8px 0",
    borderBottom:   "1px solid rgba(0,0,0,0.06)",
  };
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: "rgba(15,10,30,0.45)" };
  const valueStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: "#0F0A1E" };

  return (
    <div style={{ padding: "16px 20px", background: "#FFFFFF", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
      {licenseId && (
        <div style={rowStyle}>
          <span style={labelStyle}>License ID</span>
          <span style={{ ...valueStyle, fontFamily: "var(--font-mono, monospace)", color: "#606060" }}>
            {licenseId}
          </span>
        </div>
      )}
      {clientName && (
        <div style={rowStyle}>
          <span style={labelStyle}>Licensed to</span>
          <span style={valueStyle}>{clientName}</span>
        </div>
      )}
      {licensedChannels && licensedChannels.length > 0 && (
        <div style={{ ...rowStyle, borderBottom: "1px solid #1A1A1A", flexWrap: "wrap", gap: 6 }}>
          <span style={labelStyle}>Channels</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {licensedChannels.map((ch) => (
              <span
                key={ch}
                style={{
                  fontSize:     11,
                  fontWeight:   500,
                  color:        "rgba(15,10,30,0.55)",
                  background:   "#F5F3FF",
                  border:       "1px solid rgba(124,58,237,0.15)",
                  borderRadius: 9999,
                  padding:      "3px 10px",
                }}
              >
                {ch}
              </span>
            ))}
          </div>
        </div>
      )}
      {licenseExpiry && (
        <div style={{ ...rowStyle, borderBottom: "none" }}>
          <span style={labelStyle}>Valid until</span>
          <span style={{ ...valueStyle, color: urgentExpiry ? "#EF4444" : "#F0F0F0" }}>
            {formatExpiry(licenseExpiry)}
          </span>
        </div>
      )}

      {finalUrl && (
        <div style={{ marginTop: 16 }}>
          <button
            type="button"
            disabled={downloading || !referenceId}
            onClick={() => {
              if (!referenceId) return;
              setDownloading(true);
              downloadViaApi(referenceId)
                .finally(() => setDownloading(false));
            }}
            style={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              gap:            8,
              width:          "100%",
              height:         44,
              borderRadius:   10,
              background:     downloading ? "rgba(124,58,237,0.5)" : "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
              color:          "#FFFFFF",
              fontWeight:     600,
              fontSize:       14,
              border:         "none",
              cursor:         downloading ? "not-allowed" : "pointer",
              boxShadow:      "0 4px 16px rgba(124,58,237,0.25)",
            }}
          >
            <DownloadCloud size={18} />
            {downloading ? "Downloading…" : "Download Video"}
          </button>
          {licenseExpiry && (
            <p style={{
              marginTop:      8,
              textAlign:      "center",
              fontSize:       11,
              color:          urgentExpiry ? "#EF4444" : "#606060",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              gap:            4,
            }}>
              {urgentExpiry && <AlertTriangle size={11} />}
              Access expires {formatExpiry(licenseExpiry)}
              {urgentExpiry && " — download now"}
            </p>
          )}
        </div>
      )}

    </div>
  );
}

/* ── Aspect ratio class for AD_IMAGE ─────────────────────────────────────── */
function aspectRatioStyle(ratio?: string): React.CSSProperties {
  if (!ratio) return { aspectRatio: "16 / 9" };
  if (ratio === "1:1")  return { aspectRatio: "1 / 1" };
  if (ratio === "4:5")  return { aspectRatio: "4 / 5" };
  if (ratio === "16:9") return { aspectRatio: "16 / 9" };
  if (ratio === "9:16") return { aspectRatio: "9 / 16" };
  return { aspectRatio: "16 / 9" };
}

/* ── Main component ──────────────────────────────────────────────────────── */
export function RequestMediaPreview({
  previewUrl,
  finalUrl,
  previewImageUrl,
  finalImageUrl,
  status,
  mediaType = "video",
  requestType,
  aspectRatio,
  licenseExpiry,
  licensedChannels,
  licenseId,
  clientName,
  referenceId,
}: RequestMediaPreviewProps) {

  const isImageAd   = requestType === "AD_IMAGE";
  /* Resolve the effective preview / final URLs for AD_IMAGE */
  const effectivePreview = previewUrl ?? (previewImageUrl ?? undefined);
  const effectiveFinal   = finalUrl   ?? (finalImageUrl   ?? undefined);
  // mediaType from props is authoritative — AD_IMAGE produces video output (Seedance 2.0)
  const mediaKind: "video" | "image" | "audio" = mediaType ?? "video";
  const boxStyle: React.CSSProperties = isImageAd
    ? { ...aspectRatioStyle(aspectRatio), position: "relative", width: "100%", overflow: "hidden" }
    : { ...aspectBox };

  /* ── PREVIEW_REVIEW: watermarked preview ──────────────────────────────── */
  if (status === "PREVIEW_REVIEW") {
    return (
      <div style={cardBase}>
        {effectivePreview ? (
          <div style={boxStyle}>
            <MediaElement url={effectivePreview} type={mediaKind} />
          </div>
        ) : (
          /*
           * No preview URL yet — preview is being prepared.
           * AD_IMAGE: use image-specific copy ("image is being generated").
           */
          <div style={{
            ...boxStyle,
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            justifyContent: "center",
            gap:            12,
            background:     "#F8F7FF",
            minHeight:      200,
          }}>
            {isImageAd
              ? <ImageIcon size={36} color="rgba(0,0,0,0.18)" />
              : <Eye size={36} color="#3B82F6" />
            }
            <p style={{ fontSize: 14, fontWeight: 600, color: "#0F0A1E", margin: 0 }}>
              {isImageAd ? "Your image is being generated" : "Preview is being prepared"}
            </p>
            <p style={{ fontSize: 12, color: "#606060", margin: 0, textAlign: "center", maxWidth: 280 }}>
              {isImageAd
                ? "Your watermarked preview image will appear here once generation completes."
                : "Your watermarked preview will appear here shortly."
              }
            </p>
          </div>
        )}

      </div>
    );
  }

  /* ── DELIVERED / APPROVED: clean delivery ──────────────────────────────── */
  if (status === "DELIVERED" || status === "APPROVED") {
    return (
      <div style={cardBase}>
        {effectiveFinal ? (
          <div style={boxStyle}>
            <MediaElement url={effectiveFinal} type={mediaKind} />
          </div>
        ) : (
          <div style={{
            ...boxStyle,
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            justifyContent: "center",
            gap:            12,
            background:     "#F8F7FF",
            minHeight:      200,
          }}>
            {isImageAd ? <ImageIcon size={40} color="#2A2A2A" /> : <Film size={40} color="rgba(0,0,0,0.18)" />}
            <p style={{ fontSize: 14, color: "rgba(15,10,30,0.45)", margin: 0}}>
              {isImageAd ? "Image ready — link pending" : "Content ready — link pending"}
            </p>
          </div>
        )}
        <LicenseInfoCard
          licenseId={licenseId}
          clientName={clientName}
          licenseExpiry={licenseExpiry}
          licensedChannels={licensedChannels}
          finalUrl={status === "DELIVERED" ? (effectiveFinal ?? undefined) : undefined}
          referenceId={referenceId}
        />
      </div>
    );
  }

  /* ── REJECTED / CANCELLED ─────────────────────────────────────────────── */
  if (status === "REJECTED" || status === "CANCELLED") {
    return (
      <div style={{
        ...cardBase,
        aspectRatio:    "16 / 9",
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        gap:            12,
      }}>
        <XCircle size={40} color="#EF4444" />
        <p style={{ fontSize: 14, fontWeight: 600, color: "#0F0A1E", margin: 0 }}>
          This request was not completed.
        </p>
        <p style={{ fontSize: 12, color: "rgba(15,10,30,0.45)", margin: 0}}>
          Contact support if you need assistance.
        </p>
        <a
          href="mailto:support@twinity.com"
          style={{
            marginTop:      8,
            display:        "inline-flex",
            alignItems:     "center",
            height:         36,
            paddingInline:  16,
            borderRadius:   8,
            border:         "1px solid rgba(0,0,0,0.12)",
            background:     "transparent",
            color:          "rgba(15,10,30,0.50)",
            fontSize:       13,
            fontWeight:     500,
            textDecoration: "none",
          }}
        >
          Contact Support
        </a>
      </div>
    );
  }

  /* ── Default: content not ready yet (matches Studio Home empty state) ─── */
  return (
    <div style={{
      ...cardBase,
      aspectRatio:    "16 / 9",
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      justifyContent: "center",
      gap:            12,
      background:     "#F8F7FF",
    }}>
      <Film size={40} color="rgba(0,0,0,0.18)" />
      <p style={{ fontSize: 14, fontWeight: 600, color: "#A0A0A0", margin: 0 }}>
        Content not yet ready
      </p>
      <p style={{ fontSize: 12, color: "#606060", margin: 0, textAlign: "center", maxWidth: 260 }}>
        Your content will appear here once production is complete.
      </p>
    </div>
  );
}
