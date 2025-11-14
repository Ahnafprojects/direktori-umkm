// File: src/app/_components/header.tsx
"use client";

import Link from "next/link";
import { Building2, ScrollText, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserAuth from "./user-auth";
import { ThemeToggle } from "./theme-toggle";
import { useSession } from "next-auth/react";
import HeaderNotifications from "./header-notifications";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4 sm:px-6 lg:px-8">
        {/* LOGO / JUDUL WEBSITE */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Building2 className="h-6 w-6 text-primary" />
          <span>LokalKeren</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2 md:gap-4 ml-auto">
          {/* Notifikasi bell untuk semua user yang login */}
          {session && (
            <HeaderNotifications />
          )}
          
          {/* Show theme toggle in header only when user is NOT logged in.  When logged in, theme toggle will be inside profile popup */}
          {!session && <ThemeToggle />}
          <UserAuth />
        </nav>
      </div>
    </header>
  );
}
