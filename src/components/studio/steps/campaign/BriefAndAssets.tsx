"use client";

import { useRef } from "react";
import { Music2, X } from "lucide-react";

export type UploadedFile = {
  name: string;
  objectUrl: string;
  file: File;
};

export type BriefAndAssetsProps = {
  objective: string;
  keyMessage: string;
  cta: string;
  audience: string;
  prohibited: string;
  addMusic: boolean;
  logoFile: UploadedFile | null;
  productFile: UploadedFile | null;
  musicFile: UploadedFile | null;
  onObjectiveChange: (v: string) => void;
  onKeyMessageChange: (v: string) => void;
  onCtaChange: (v: string) => void;
  onAudienceChange: (v: string) => void;
  onProhibitedChange: (v: string) => void;
  onAddMusicChange: (v: boolean) => void;
  onLogoFile: (file: UploadedFile | null) => void;
  onProductFile: (file: UploadedFile | null) => void;
  onMusicFile: (file: UploadedFile | null) => void;
  onSubmit: () => void;
};

function ImageUploadTile({
  label,
  accept,
  file,
  onFile,
  onClear,
}: {
  label: string;
  accept: string;
  file: UploadedFile | null;
  onFile: (file: UploadedFile) => void;
  onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.files?.[0];
    if (!next) return;
    onFile({ name: next.name, objectUrl: URL.createObjectURL(next), file: next });
    e.target.value = "";
  }

  return (
    <>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={handleChange} />
      {file ? (
        <div className="relative overflow-hidden rounded-xl border border-[#7C3AED]/30 bg-[#7C3AED]/[0.04]">
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-2 z-10 flex size-5 items-center justify-center rounded-full bg-black/[0.40] transition-colors hover:bg-black/[0.60]"
            aria-label="Remove file"
          >
            <X size={11} color="#fff" />
          </button>
          <div className="flex items-center justify-center bg-[#F0ECF8]" style={{ height: 120 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={file.objectUrl} alt={file.name} className="max-h-full max-w-full object-contain" />
          </div>
          <div className="px-3 py-2">
            <span className="block truncate text-[11px] font-medium" style={{ color: "rgba(15,10,30,0.55)" }}>
              {file.name}
            </span>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="flex min-h-[148px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-black/[0.12] bg-white px-3 py-8 text-center transition-colors duration-[180ms] hover:border-[#7C3AED]/35"
        >
          <span className="text-xs font-semibold" style={{ color: "rgba(15,10,30,0.65)" }}>{label}</span>
          <span className="mt-2 text-[11px] text-[#7C3AED]">Upload</span>
        </button>
      )}
    </>
  );
}

function AudioUploadTile({
  file,
  onFile,
  onClear,
}: {
  file: UploadedFile | null;
  onFile: (file: UploadedFile) => void;
  onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.files?.[0];
    if (!next) return;
    onFile({ name: next.name, objectUrl: URL.createObjectURL(next), file: next });
    e.target.value = "";
  }

  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="audio/mpeg,audio/wav,audio/mp4,audio/ogg,audio/aac,.mp3,.wav,.m4a,.ogg,.aac"
        className="hidden"
        onChange={handleChange}
      />
      {file ? (
        <div
          className="relative flex items-center gap-3 rounded-xl px-4 py-3.5"
          style={{ background: "#F8F7FF", border: "1px solid rgba(124,58,237,0.20)" }}
        >
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)" }}
          >
            <Music2 size={16} color="#fff" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold" style={{ color: "#0F0A1E" }}>{file.name}</p>
            <audio src={file.objectUrl} controls className="mt-1.5 h-6 w-full" style={{ maxWidth: "100%" }} />
          </div>
          <button
            type="button"
            onClick={onClear}
            className="ml-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-black/[0.07] transition-colors hover:bg-black/[0.14]"
            aria-label="Remove audio"
          >
            <X size={12} color="rgba(15,10,30,0.55)" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-colors duration-[180ms]"
          style={{ background: "#F8F7FF", border: "1px dashed rgba(124,58,237,0.25)" }}
        >
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "rgba(124,58,237,0.10)" }}
          >
            <Music2 size={16} color="#7C3AED" />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#0F0A1E" }}>Upload music / tone</p>
            <p className="mt-0.5 text-xs" style={{ color: "rgba(15,10,30,0.45)" }}>MP3, WAV, M4A - played under the video</p>
          </div>
          <span className="ml-auto text-xs font-semibold text-[#7C3AED]">Upload</span>
        </button>
      )}
    </>
  );
}

export function BriefAndAssets({
  objective,
  keyMessage,
  cta,
  audience,
  prohibited,
  addMusic,
  logoFile,
  productFile,
  musicFile,
  onObjectiveChange,
  onKeyMessageChange,
  onCtaChange,
  onAudienceChange,
  onProhibitedChange,
  onAddMusicChange,
  onLogoFile,
  onProductFile,
  onMusicFile,
  onSubmit,
}: BriefAndAssetsProps) {
  const ok = objective.trim() && keyMessage.trim() && audience.trim();

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="font-display text-2xl font-bold tracking-tight" style={{ color: "#0F0A1E" }}>Brief & Assets</h2>
      <p className="mt-2 text-sm" style={{ color: "rgba(15,10,30,0.50)" }}>
        Structured creative intake - feeds validation and celebrity-manager review.
      </p>
      <form
        className="mt-8 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (ok) onSubmit();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <ImageUploadTile
            label="Logo pack (SVG/PNG)"
            accept=".svg,.png,image/svg+xml,image/png"
            file={logoFile}
            onFile={onLogoFile}
            onClear={() => onLogoFile(null)}
          />
          <ImageUploadTile
            label="Product image"
            accept="image/jpeg,image/png,image/webp"
            file={productFile}
            onFile={onProductFile}
            onClear={() => onProductFile(null)}
          />
        </div>

        <AudioUploadTile
          file={musicFile}
          onFile={onMusicFile}
          onClear={() => onMusicFile(null)}
        />

        {!musicFile && (
          <div
            className="flex items-center justify-between gap-4 rounded-xl px-4 py-3.5"
            style={{ background: "#F8F7FF", border: "1px solid rgba(124,58,237,0.12)" }}
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: "#0F0A1E" }}>AI-generated background audio</p>
              <p className="mt-0.5 text-xs" style={{ color: "rgba(15,10,30,0.45)" }}>
                Let AI add background audio to the video automatically.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={addMusic}
              onClick={() => onAddMusicChange(!addMusic)}
              style={{
                width: 44,
                height: 24,
                borderRadius: 9999,
                flexShrink: 0,
                background: addMusic ? "linear-gradient(135deg, #7C3AED, #5B21B6)" : "rgba(0,0,0,0.12)",
                border: "none",
                cursor: "pointer",
                position: "relative",
                transition: "background 200ms",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 2,
                  left: addMusic ? "calc(100% - 22px)" : 2,
                  width: 20,
                  height: 20,
                  borderRadius: 9999,
                  background: "#FFFFFF",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.20)",
                  transition: "left 200ms cubic-bezier(0.16,1,0.3,1)",
                }}
              />
            </button>
          </div>
        )}

        <label className="block">
          <span className="text-sm font-medium" style={{ color: "rgba(15,10,30,0.70)" }}>Campaign objective *</span>
          <textarea
            value={objective}
            onChange={(e) => onObjectiveChange(e.target.value)}
            rows={2}
            className="mt-2 w-full rounded-lg border border-black/[0.09] bg-white px-3 py-2.5 text-sm text-[#0F0A1E] outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20 placeholder:text-black/30"
            placeholder="e.g. Drive qualified installs for v2 launch in KSA"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium" style={{ color: "rgba(15,10,30,0.70)" }}>Key message *</span>
          <textarea
            value={keyMessage}
            onChange={(e) => onKeyMessageChange(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-lg border border-black/[0.09] bg-white px-3 py-2.5 text-sm text-[#0F0A1E] outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20 placeholder:text-black/30"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium" style={{ color: "rgba(15,10,30,0.70)" }}>Primary CTA</span>
            <input
              value={cta}
              onChange={(e) => onCtaChange(e.target.value)}
              className="mt-2 w-full rounded-lg border border-black/[0.09] bg-white px-3 py-2.5 text-sm text-[#0F0A1E] outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20 placeholder:text-black/30"
              placeholder="Install - Shop - Sign up"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium" style={{ color: "rgba(15,10,30,0.70)" }}>Target audience *</span>
            <input
              value={audience}
              onChange={(e) => onAudienceChange(e.target.value)}
              className="mt-2 w-full rounded-lg border border-black/[0.09] bg-white px-3 py-2.5 text-sm text-[#0F0A1E] outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20 placeholder:text-black/30"
              placeholder="Women 25-40, Riyadh, AR-first"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-medium" style={{ color: "rgba(15,10,30,0.70)" }}>
            Prohibited mentions / competitor sensitivity
          </span>
          <textarea
            value={prohibited}
            onChange={(e) => onProhibitedChange(e.target.value)}
            rows={2}
            className="mt-2 w-full rounded-lg border border-black/[0.09] bg-white px-3 py-2.5 text-sm text-[#0F0A1E] outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20 placeholder:text-black/30"
            placeholder="No competitor names, no alcohol adjacency, ..."
          />
        </label>
        <button
          type="submit"
          disabled={!ok}
          className="w-full rounded-lg bg-[#7C3AED] py-3 text-sm font-semibold text-white hover:bg-[#6D28D9] disabled:pointer-events-none disabled:opacity-40"
        >
          Submit brief for validation {"->"}
        </button>
      </form>
    </div>
  );
}
