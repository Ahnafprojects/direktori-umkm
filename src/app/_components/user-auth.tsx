// File: src/app/_components/user-auth.tsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogIn,
  LogOut,
  User,
  Store,
  LayoutDashboard,
  PlusCircle,
  Home,
  Menu,
  Heart,
  ScrollText,
} from "lucide-react";
import Link from "next/link";
import ThemeSelector from "./theme-selector";
import FavoriteNavButton from "./favorite-nav-button";

export default function UserAuth() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-10 w-24 rounded-md bg-gray-200 animate-pulse" />;
  }

  if (!session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="px-3">
            <LogIn className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Masuk / Daftar</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              <span>Masuk</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/register">
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>Daftar</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const user = session.user;
  // @ts-ignore
  const isPengusaha = user?.role === "PENGUSAHA";
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.image ?? ""} alt={user?.name ?? ""} />
              <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* 2. TAMBAHKAN MENU "BERANDA" DI SINI */}
        <DropdownMenuItem asChild>
          <Link href="/?section=directory">
            <Home className="mr-2 h-4 w-4" />
            <span>Beranda</span>
          </Link>
        </DropdownMenuItem>

        {/* Tombol Favorit */}
        <DropdownMenuItem asChild>
          <Link href="/favorites">
            <Heart className="mr-2 h-4 w-4" />
            <span>UMKM Favorit</span>
          </Link>
        </DropdownMenuItem>

        {/* Menu Transaksi - untuk semua user */}
        <DropdownMenuItem asChild>
          <Link href="/history">
            <ScrollText className="mr-2 h-4 w-4" />
            <span>Riwayat Transaksi</span>
          </Link>
        </DropdownMenuItem>

        {isPengusaha && (
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard UMKM</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <Link href="/profil">
            <User className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        {/* Compact theme selector (no nested dropdown) inside profile popup */}
        <div className="px-2 py-1">
          <ThemeSelector showLabels={false} />
        </div>
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Keluar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
