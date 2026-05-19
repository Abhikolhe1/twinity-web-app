"use client";

import React, { useCallback, useRef, useState } from "react";
import { FileAudio, Mic, X } from "lucide-react";

/* ── Props ───────────────────────────────────────────────────────────────── */
export type RegenerationVoiceUploadProps = {
  onFileSelected:  (file: File) => void;
  onFileRemoved:   () => void;
  selectedFile:    File | null;
  disabled:        boolean;
  maxSizeMB?:      number;
  accept?:         string;
};

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function formatBytes(bytes: number): string {
  if (bytes < 1024)         return `${bytes} B`;
  if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const ACCEPTED_EXTS = [".mp3", ".wav", ".m4a", ".aac"];

function validateFile(file: File, maxSizeMB: number): string | null {
  const isAudio = file.type.startsWith("audio/") || ACCEPTED_EXTS.some((ext) => file.name.toLowerCase().endsWith(ext));
  if (!isAudio) return "Only audio files are accepted (MP3, WAV, M4A).";
  if (file.size > maxSizeMB * 1024 * 1024) return `File exceeds ${maxSizeMB}MB limit. Please choose a smaller file.`;
  return null;
}

/* ── Main component ──────────────────────────────────────────────────────── */
export function RegenerationVoiceUpload({
  onFileSelected,
  onFileRemoved,
  selectedFile,
  disabled,
  maxSizeMB = 10,
  accept    = "audio/*",
}: RegenerationVoiceUploadProps) {
  const inputRef          = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver]   = useState(false);
  const [zoneHovered, setZoneHovered] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [iconHovered, setIconHovered]  = useState(false);

  const handleFile = useCallback((file: File) => {
    const err = validateFile(file, maxSizeMB);
    if (err) { setValidationError(err); return; }
    setValidationError(null);
    onFileSelected(file);
  }, [maxSizeMB, onFileSelected]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = "";
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const remove = () => {
    setValidationError(null);
    onFileRemoved();
    if (inputRef.current) inputRef.current.value = "";
  };

  const isActive = dragOver || zoneHovered;

  return (
    <div style={{ opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? "none" : "auto", cursor: disabled ? "not-allowed" : "auto" }}>
      {/* Label */}
      <p style={{ fontSize: 12, fontWeight: 600, color: "#F0F0F0", margin: "0 0 2px" }}>
        Voice Reference <span style={{ color: "#606060", fontWeight: 400 }}>(optional)</span>
      </p>
      <p style={{ fontSize: 11, color: "#606060", margin: "0 0 10px", lineHeight: 1.5 }}>
        Upload a voice clip to guide the tone and delivery style.
      </p>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onInputChange}
        style={{ display: "none" }}
        tabIndex={-1}
        aria-hidden="true"
      />

      {selectedFile ? (
        /* ── Selected state: file info card ──────────────────────────────── */
        <div
          style={{
            display:      "flex",
            alignItems:   "center",
            gap:          12,
            background:   "#1E1E1E",
            border:       "1px solid #2A2A2A",
            borderRadius: 10,
            padding:      "12px 16px",
          }}
        >
          {/* File icon circle */}
          <div
            style={{
              width:          36,
              height:         36,
              borderRadius:   9999,
              background:     "rgba(124,58,237,0.12)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              flexShrink:     0,
            }}
          >
            <FileAudio size={18} color="#7C3AED" />
          </div>

          {/* File info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize:     13,
                fontWeight:   600,
                color:        "#F0F0F0",
                margin:       0,
                overflow:     "hidden",
                textOverflow: "ellipsis",
                whiteSpace:   "nowrap",
              }}
              title={selectedFile.name}
            >
              {selectedFile.name.length > 40
                ? `${selectedFile.name.slice(0, 37)}…`
                : selectedFile.name}
            </p>
            <p style={{ fontSize: 11, color: "#606060", margin: "2px 0 0" }}>
              {formatBytes(selectedFile.size)}
            </p>
          </div>

          {/* Remove button */}
          <button
            type="button"
            onClick={remove}
            onMouseEnter={() => setIconHovered(true)}
            onMouseLeave={() => setIconHovered(false)}
            title="Remove file"
            style={{
              background:  "transparent",
              border:      "none",
              cursor:      "pointer",
              padding:     4,
              borderRadius: 4,
              flexShrink:  0,
            }}
          >
            <X size={14} color={iconHovered ? "#EF4444" : "#606060"} style={{ transition: "color 150ms" }} />
          </button>
        </div>
      ) : (
        /* ── Idle state: drop zone ────────────────────────────────────────── */
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); } }}
          onDragOver={onDragOver}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onMouseEnter={() => setZoneHovered(true)}
          onMouseLeave={() => setZoneHovered(false)}
          aria-label="Drop a voice file or click to browse"
          style={{
            background:   dragOver
              ? "rgba(124,58,237,0.08)"
              : isActive
                ? "rgba(124,58,237,0.04)"
                : "#161616",
            border:       `2px dashed ${dragOver ? "#7C3AED" : isActive ? "rgba(124,58,237,0.40)" : "#2A2A2A"}`,
            borderRadius: 10,
            padding:      20,
            textAlign:    "center",
            cursor:       "pointer",
            transform:    dragOver ? "scale(1.01)" : "none",
            transition:   "border-color 180ms, background 180ms, transform 150ms",
            outline:      "none",
          }}
        >
          <Mic
            size={24}
            color={isActive ? "#7C3AED" : "#2A2A2A"}
            style={{ margin: "0 auto", transition: "color 180ms", display: "block" }}
          />
          <p style={{
            fontSize:   13,
            color:      isActive ? "#C4B5FD" : "#606060",
            marginTop:  8,
            transition: "color 180ms",
          }}>
            Drop a voice file or click to browse
          </p>
          <p style={{ fontSize: 11, color: "#606060", marginTop: 4 }}>
            MP3, WAV, M4A — max {maxSizeMB}MB
          </p>
        </div>
      )}

      {/* Validation error */}
      {validationError && (
        <p style={{ fontSize: 12, color: "#EF4444", marginTop: 6, lineHeight: 1.5 }}>
          {validationError}
        </p>
      )}
    </div>
  );
}
