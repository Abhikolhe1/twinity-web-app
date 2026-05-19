import type { ReactNode } from "react";

import { StudioChrome } from "@/components/studio/StudioChrome";
import { CreditsProvider } from "@/contexts/CreditsContext";
import { MOCK_CREDIT_BALANCE } from "@/lib/credits";

export default async function StudioMainLayout({ children }: { children: ReactNode }) {
  /*
   * TODO: fetch real credit balance from Supabase here (server-side).
   * Replace with:
   *   const supabase = createServerClient(...)
   *   const { data: { session } } = await supabase.auth.getSession()
   *   const { data: credits } = await supabase
   *     .from("credits").select("available, used, total, resets_at")
   *     .eq("user_id", session?.user.id).single()
   *   const creditBalance = credits
   *     ? { available: credits.available, used: credits.used, total: credits.total, resetsAt: credits.resets_at ?? undefined }
   *     : MOCK_CREDIT_BALANCE
   */
  const creditBalance = MOCK_CREDIT_BALANCE;

  return (
    <CreditsProvider initialBalance={creditBalance}>
      <StudioChrome>{children}</StudioChrome>
    </CreditsProvider>
  );
}
