// src/app/_components/header.tsx
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import ViewToggle from './view-toggle'; // <-- 1. IMPORT
import FavoriteNavButton from './favorite-nav-button'; // <-- 1. IMPORT

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center">
        {/* LOGO / JUDUL WEBSITE */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Building2 className="h-6 w-6 text-primary" />
          <span>LokalKeren</span>
        </Link>

        <nav className="flex items-center gap-2 md:gap-4 ml-auto">
          <div className="hidden md:block">
            <ViewToggle />
          </div>
          <FavoriteNavButton /> {/* <-- 2. TAMBAHKAN */}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}