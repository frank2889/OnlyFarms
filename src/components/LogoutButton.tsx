"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm text-ink-500 underline hover:text-terra-700"
    >
      Uitloggen
    </button>
  );
}
