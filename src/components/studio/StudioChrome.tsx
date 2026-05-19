import type { ReactNode } from "react";

import { StudioSidebar } from "./StudioSidebar";
import { StudioTopbar }  from "./StudioTopbar";

export function StudioChrome({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#0A0812] md:flex-row">
      <StudioSidebar />
      <div className="flex min-h-0 flex-1 flex-col md:ps-[240px]">
        <StudioTopbar />
        {/* pb-[60px] reserves space for the mobile bottom tab bar (FIX 9) */}
        <main className="flex-1 pb-[60px] md:pb-0">{children}</main>
      </div>
    </div>
  );
}
