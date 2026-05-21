import type { ReactNode } from "react";

import { StudioChrome } from "@/components/studio/StudioChrome";
import { CreditsProvider } from "@/contexts/CreditsContext";
import { StudioFunnelProvider } from "@/contexts/StudioFunnelContext";
import { MOCK_CREDIT_BALANCE } from "@/lib/credits";

export default async function StudioMainLayout({ children }: { children: ReactNode }) {
  const creditBalance = MOCK_CREDIT_BALANCE;

  return (
    <CreditsProvider initialBalance={creditBalance}>
      <StudioFunnelProvider>
        <StudioChrome>{children}</StudioChrome>
      </StudioFunnelProvider>
    </CreditsProvider>
  );
}
