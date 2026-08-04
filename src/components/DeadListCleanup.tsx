"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Ruimt een dode lijst-token uit `of_lists` op zodat de Lijst-tab er niet naar terug blijft wijzen */
export default function DeadListCleanup() {
  const pathname = usePathname();

  useEffect(() => {
    const token = pathname?.split("/lijst/")[1]?.split("/")[0];
    if (!token) return;
    try {
      const stored: { token: string }[] = JSON.parse(localStorage.getItem("of_lists") ?? "[]");
      const next = stored.filter((l) => l.token !== token);
      if (next.length !== stored.length) {
        localStorage.setItem("of_lists", JSON.stringify(next));
      }
    } catch {}
  }, [pathname]);

  return null;
}
