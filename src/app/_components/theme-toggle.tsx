// src/app/_components/theme-toggle.tsx
'use client';

import * as React from 'react';
import { Moon, Sun, Palette } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  // Kita butuh `theme` (tema saat ini) dan `setTheme`
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Pastikan component sudah mounted untuk menghindari hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Fungsi untuk render ikon yang "pintar"
  const renderIcon = () => {
    if (!mounted) {
      // Return default icon saat belum mounted
      return <Palette className="h-[1.2rem] w-[1.2rem]" />;
    }
    
    if (theme === 'light') {
      return <Sun className="h-[1.2rem] w-[1.2rem]" />;
    }
    if (theme === 'theme-ocean') {
      return <Moon className="h-[1.2rem] w-[1.2rem]" />;
    }
    // Jika temanya 'rose' atau lainnya
    return <Palette className="h-[1.2rem] w-[1.2rem]" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {/* Tampilkan ikon dinamis */}
          {renderIcon()}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className="cursor-pointer hover:bg-emerald-50 focus:bg-emerald-50"
        >
          <Sun className="mr-2 h-4 w-4 text-amber-500" />
          <span className="font-medium">Terang</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => setTheme('theme-rose')}
          className="cursor-pointer hover:bg-pink-50 focus:bg-pink-50"
        >
          <Palette className="mr-2 h-4 w-4 text-pink-500" />
          <span className="font-medium">Rose <span className="text-sm text-muted-foreground">(Pink)</span></span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setTheme('theme-ocean')}
          className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50"
        >
          <Moon className="mr-2 h-4 w-4 text-blue-500" />
          <span className="font-medium">Ocean <span className="text-sm text-muted-foreground">(Biru Gelap)</span></span>
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}