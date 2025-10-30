// File: src/app/_components/user-auth.tsx
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogIn, LogOut, User, Store, LayoutDashboard, PlusCircle, Home, Palette, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { useTheme } from 'next-themes';

export default function UserAuth() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();

  const renderThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'theme-rose':
        return <Palette className="h-4 w-4" />;
      case 'theme-ocean':
        return <Moon className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  if (status === 'loading') {
    return <div className="h-10 w-24 rounded-md bg-gray-200 animate-pulse" />;
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <LogIn className="mr-2 h-4 w-4" />
              Masuk / Daftar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Masuk sebagai</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signIn()}>
               <User className="mr-2 h-4 w-4" />
               <span>Pelanggan</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signIn()}>
              <Store className="mr-2 h-4 w-4" />
              <span>Pengusaha UMKM</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      );
  }

  const user = session.user;
  // @ts-ignore
  const isPengusaha = user?.role === 'PENGUSAHA';
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.image ?? ''} alt={user?.name ?? ''} />
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* 2. TAMBAHKAN MENU "BERANDA" DI SINI */}
        <DropdownMenuItem asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            <span>Beranda</span>
          </Link>
        </DropdownMenuItem>

        {isPengusaha && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/umkm/baru">
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Daftarkan UMKM</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/umkm/saya">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Produk Saya</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuItem asChild>
          <Link href="/profil">
            <User className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        
        {/* Theme Selector - Nested Dropdown */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {renderThemeIcon()}
            <span className="ml-2">Tema</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => setTheme('light')}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('theme-rose')}>
              <Palette className="mr-2 h-4 w-4" />
              <span>Rose</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('theme-ocean')}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Ocean</span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Keluar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}