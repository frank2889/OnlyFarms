"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { forgetList } from "@/lib/lists-local";

/** Ruimt een dode lijst-token (en een eventuele pin erop) uit het apparaat-geheugen op zodat de Lijst-tab er niet naar terug blijft wijzen */
export default function DeadListCleanup() {
  const pathname = usePathname();

  useEffect(() => {
    const token = pathname?.split("/lijst/")[1]?.split("/")[0];
    if (!token) return;
    forgetList(token);
  }, [pathname]);

  return null;
}
