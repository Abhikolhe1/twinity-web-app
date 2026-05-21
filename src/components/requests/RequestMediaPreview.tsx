"use client";

import React from "react";
import { AlertTriangle, DownloadCloud, Eye, Film, Image as ImageIcon, XCircle } from "lucide-react";

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
  border:       "1px solid #2A2A2A",
  background:   "#161616",
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
      <div style={{ ...aspectBox, display: "flex", alignItems: "center", justifyContent: "center", background: "#0D0D0D" }}>
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

/* ── Watermark overlay — full repeating diagonal pattern ─────────────────── */
function WatermarkOverlay() {
  return (
    <div
      aria-hidden="true"
      style={{
        position:       "absolute",
        inset:          0,
        pointerEvents:  "none",
        userSelect:     "none",
        overflow:       "hidden",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
      }}
    >
      <div style={{
        position:             "absolute",
        inset:                "-60%",
        display:              "grid",
        gridTemplateColumns:  "repeat(4, 1fr)",
        gap:                  "32px 24px",
        transform:            "rotate(-35deg)",
      }}>
        {Array.from({ length: 32 }).map((_, i) => (
          <span
            key={i}
            style={{
              fontSize:      13,
              fontWeight:    700,
              color:         "rgba(255,255,255,0.10)",
              whiteSpace:    "nowrap",
              letterSpacing: "0.04em",
              lineHeight:    2.5,
            }}
          >
            WATERMARK · SAMPLE ONLY
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── License info card ───────────────────────────────────────────────────── */
function LicenseInfoCard({
  licenseId,
  clientName,
  licenseExpiry,
  licensedChannels,
  finalUrl,
}: {
  licenseId?: string;
  clientName?: string;
  licenseExpiry?: string;
  licensedChannels?: string[];
  finalUrl?: string;
}) {
  const expiryDays   = licenseExpiry ? daysUntil(licenseExpiry) : null;
  const urgentExpiry = expiryDays !== null && expiryDays <= 3;

  const rowStyle: React.CSSProperties = {
    display:        "flex",
    justifyContent: "space-between",
    alignItems:     "center",
    padding:        "8px 0",
    borderBottom:   "1px solid #1A1A1A",
  };
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: "#606060" };
  const valueStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: "#F0F0F0" };

  return (
    <div style={{ padding: "16px 20px", background: "#161616", borderTop: "1px solid #2A2A2A" }}>
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
                  color:        "#A0A0A0",
                  background:   "#1E1E1E",
                  border:       "1px solid #2A2A2A",
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
          <a
            href={finalUrl}
            download
            style={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              gap:            8,
              width:          "100%",
              height:         44,
              borderRadius:   10,
              background:     "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
              color:          "#FFFFFF",
              fontWeight:     600,
              fontSize:       14,
              textDecoration: "none",
              boxShadow:      "0 4px 16px rgba(124,58,237,0.25)",
            }}
          >
            <DownloadCloud size={18} />
            Download Video
          </a>
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
}: RequestMediaPreviewProps) {

  const isImageAd   = requestType === "AD_IMAGE" || mediaType === "image";
  /* Resolve the effective preview / final URLs for AD_IMAGE */
  const effectivePreview = previewUrl ?? (previewImageUrl ?? undefined);
  const effectiveFinal   = finalUrl   ?? (finalImageUrl   ?? undefined);
  const mediaKind: "video" | "image" | "audio" = isImageAd ? "image" : (mediaType ?? "video");
  const boxStyle: React.CSSProperties = isImageAd
    ? { ...aspectRatioStyle(aspectRatio), position: "relative", width: "100%", overflow: "hidden" }
    : { ...aspectBox };

  /* ── PREVIEW_REVIEW: watermarked preview ──────────────────────────────── */
  if (status === "PREVIEW_REVIEW") {
    return (
      <div style={cardBase}>
        {effectivePreview ? (
          /* Actual blurred+watermarked preview media */
          <div style={boxStyle}>
            <MediaElement url={effectivePreview} type={mediaKind} blurred />
            <WatermarkOverlay />
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
            background:     "#0D0D0D",
            minHeight:      200,
          }}>
            {isImageAd
              ? <ImageIcon size={36} color="#2A2A2A" />
              : <Eye size={36} color="#3B82F6" />
            }
            <p style={{ fontSize: 14, fontWeight: 600, color: "#F0F0F0", margin: 0 }}>
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

        {/* Amber warning notice */}
        <div style={{
          margin:       "12px 16px",
          background:   "rgba(245,158,11,0.08)",
          border:       "1px solid rgba(245,158,11,0.20)",
          borderRadius: 10,
          padding:      "12px 16px",
          display:      "flex",
          gap:          10,
          alignItems:   "flex-start",
        }}>
          <AlertTriangle size={16} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12, color: "#A0A0A0", margin: 0, lineHeight: 1.5 }}>
            Watermarked preview — not the final file. Final delivery follows after approval
            and payment capture.
          </p>
        </div>
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
            background:     "#0D0D0D",
            minHeight:      200,
          }}>
            {isImageAd ? <ImageIcon size={40} color="#2A2A2A" /> : <Film size={40} color="#2A2A2A" />}
            <p style={{ fontSize: 14, color: "#606060", margin: 0 }}>
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
        <p style={{ fontSize: 14, fontWeight: 600, color: "#F0F0F0", margin: 0 }}>
          This request was not completed.
        </p>
        <p style={{ fontSize: 12, color: "#606060", margin: 0 }}>
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
            border:         "1px solid #3D3D3D",
            background:     "transparent",
            color:          "#A0A0A0",
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
      background:     "#0D0D0D",
    }}>
      <Film size={40} color="#2A2A2A" />
      <p style={{ fontSize: 14, fontWeight: 600, color: "#A0A0A0", margin: 0 }}>
        Content not yet ready
      </p>
      <p style={{ fontSize: 12, color: "#606060", margin: 0, textAlign: "center", maxWidth: 260 }}>
        Your content will appear here once production is complete.
      </p>
    </div>
  );
}
