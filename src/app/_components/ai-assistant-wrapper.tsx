"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import AiAssistant from "./ai-assistant";

export default function AiAssistantWrapper() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Loading state - jangan tampilkan apa-apa
  if (status === "loading") {
    return null;
  }

  // Hide AI Assistant on login and register pages
  const isAuthPage = pathname === "/login" || pathname === "/register";
  if (isAuthPage) {
    return null;
  }

  // AI Assistant sekarang tersedia untuk semua role (guest, customer, umkm owner)
  // Sebagai sumber informasi website dan panduan penggunaan
  return <AiAssistant />;
}
