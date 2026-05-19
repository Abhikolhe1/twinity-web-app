"use client";

import React, { useRef } from "react";
import { Plus, X } from "lucide-react";
import { type RefImage } from "@/lib/studio/image-ad-pricing";

/* ── Types ─────────────────────────────────────────────────────────── */
interface ReferenceUploadProps {
  references: RefImage[];
  onChange:   (refs: RefImage[]) => void;
  maxSlots?:  number;
}

/* ── Component ─────────────────────────────────────────────────────── */
export function ReferenceUpload({
  references,
  onChange,
  maxSlots = 3,
}: ReferenceUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Always render exactly maxSlots visible slots */
  const slots = Array.from({ length: maxSlots }, (_, i) => references[i] ?? null);

  function handleAddClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = maxSlots - references.length;
    const toAdd     = files.slice(0, remaining);

    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const objectUrl = ev.target?.result as string;
        const newRef: RefImage = {
          id:        `ref-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name:      file.name,
          size:      `${(file.size / 1024).toFixed(0)} KB`,
          objectUrl,
        };
        onChange([...references, newRef]);
      };
      reader.readAsDataURL(file);
    });

    /* Reset so same file can be re-selected */
    e.target.value = "";
  }

  function handleRemove(id: string) {
    onChange(references.filter((r) => r.id !== id));
  }

  return (
    <div>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Slot row */}
      <div style={{ display: "flex", gap: 8 }}>
        {slots.map((ref, i) => {
          const isEmpty = ref === null;
          const canAdd  = isEmpty && references.length < maxSlots;

          return isEmpty ? (
            /* Empty slot */
            <button
              key={`slot-${i}`}
              type="button"
              onClick={canAdd ? handleAddClick : undefined}
              disabled={!canAdd}
              style={{
                width:         72,
                height:        72,
                borderRadius:  "var(--radius-md)",
                background:    "var(--color-surface-2)",
                border:        "1px dashed var(--color-border)",
                display:       "flex",
                alignItems:    "center",
                justifyContent:"center",
                cursor:        canAdd ? "pointer" : "default",
                transition:    "border-color var(--transition)",
                flexShrink:    0,
              }}
              onMouseEnter={(e) => {
                if (canAdd) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border-accent)";
                }
              }}
              onMouseLeave={(e) => {
                if (canAdd) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border)";
                }
              }}
            >
              <Plus size={16} color="var(--color-text-muted)" />
            </button>
          ) : (
            /* Filled slot */
            <div
              key={ref!.id}
              style={{
                width:        72,
                height:       72,
                borderRadius: "var(--radius-md)",
                overflow:     "hidden",
                position:     "relative",
                flexShrink:   0,
              }}
            >
              {ref!.objectUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={ref!.objectUrl}
                  alt={ref!.name}
                  style={{
                    width:      "100%",
                    height:     "100%",
                    objectFit:  "cover",
                    display:    "block",
                  }}
                />
              )}
              {/* Remove overlay */}
              <button
                type="button"
                onClick={() => handleRemove(ref!.id)}
                style={{
                  position:       "absolute",
                  inset:          0,
                  background:     "rgba(0,0,0,0)",
                  border:         "none",
                  cursor:         "pointer",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  transition:     "background var(--transition)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.65)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0)";
                }}
              >
                <X
                  size={14}
                  color="#FFFFFF"
                  style={{
                    opacity:    0,
                    transition: "opacity var(--transition)",
                    filter:     "drop-shadow(0 1px 2px rgba(0,0,0,0.8))",
                  }}
                  className="ref-x-icon"
                />
              </button>
            </div>
          );
        })}
      </div>

      {/* Footnote */}
      <p
        style={{
          marginTop: 6,
          fontSize:  10,
          color:     "var(--color-text-muted)",
          lineHeight: 1.4,
        }}
      >
        Mood boards, brand assets, visual references. Max 10 MB each.
      </p>

      {/* Make X icon visible when parent hover — CSS trick */}
      <style>{`
        button:hover .ref-x-icon { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
