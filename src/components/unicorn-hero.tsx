"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const UnicornScene = dynamic(() => import("unicornstudio-react"), { ssr: false });

interface UnicornHeroProps {
  /** Pass false on single-page views to load immediately */
  lazyLoad?: boolean;
}

export default function UnicornHero({ lazyLoad = true }: UnicornHeroProps) {
  const [loaded, setLoaded] = useState(false);

  // Start at 1 — matches the server render value exactly (no window on server).
  // After hydration, update to the real device DPI.
  // UnicornScene is ssr:false so it never renders before this effect runs.
  const [dpi, setDpi] = useState(1);

  useEffect(() => {
    setDpi(Math.min(window.devicePixelRatio || 1, 1.5));
  }, []);

  // Fallback timer — if onLoad never fires (older SDK versions),
  // fade the scene in after a generous delay rather than stay invisible.
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      aria-hidden
      className="absolute inset-0 h-full w-full"
      style={{
        zIndex: 0,
        pointerEvents: "none",
        opacity: loaded ? 1 : 0,
        transition: "opacity 1200ms ease",
        contain: "strict",
        willChange: "opacity",
      }}
    >
      <UnicornScene
        projectId="EUcO4jP9OcMbaNvrhQii"
        width="100%"
        height="100%"
        scale={1}
        dpi={dpi}
        production={true}
        lazyLoad={lazyLoad}
        sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@2.1.12/dist/unicornStudio.umd.js"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
