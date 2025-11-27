// File: src/app/_components/header.tsx
"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserAuth from "./user-auth";
import { ThemeToggle } from "./theme-toggle";
import { useSession } from "next-auth/react";
import HeaderNotifications from "./header-notifications";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full pt-2 sm:pt-3 px-2 sm:px-4 lg:px-6">
      <div className="container mx-auto rounded-2xl border border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
          {/* LOGO / JUDUL WEBSITE */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity"
          >
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              LokalKeren
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2 md:gap-4 ml-auto">
            {/* Notifikasi bell untuk semua user yang login */}
            {session && <HeaderNotifications />}

            {/* Show theme toggle in header only when user is NOT logged in.  When logged in, theme toggle will be inside profile popup */}
            {!session && <ThemeToggle />}
            <UserAuth />
          </nav>
        </div>
      </div>
    </header>
  );
}
