// File: src/app/_components/header.tsx

import Link from "next/link";
import { Building2, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import FavoriteNavButton from "./favorite-nav-button";
import UserAuth from "./user-auth";
import { ThemeToggle } from "./theme-toggle";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function Header() {
  const session = await getServerSession(authOptions);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4 sm:px-6 lg:px-8">
        {/* LOGO / JUDUL WEBSITE */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Building2 className="h-6 w-6 text-primary" />
          <span>LokalKeren</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2 md:gap-4 ml-auto">
          {/* Hanya tampilkan tombol history jika user sudah login */}
          {session && (
            <div>
              <Button asChild variant="ghost" size="icon" className="flex">
                <Link href="/history" aria-label="Riwayat Pesanan">
                  <ScrollText className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          )}
          <FavoriteNavButton />
          {/* Show theme toggle in header only when user is NOT logged in.  When logged in, theme toggle will be inside profile popup */}
          {!session && <ThemeToggle />}
          <UserAuth />
        </nav>
      </div>
    </header>
  );
}
