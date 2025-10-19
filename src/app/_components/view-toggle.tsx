// src/app/_components/view-toggle.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Grid, Map as MapIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ViewToggle() {
  const pathname = usePathname();
  const isMapPage = pathname === '/map';

  return (
    <Button asChild variant="outline">
      {isMapPage ? (
        // Jika di halaman /map, tunjukkan link ke Grid (/)
        <Link href="/" className="flex items-center gap-2">
          <Grid className="h-4 w-4" />
          <span>Grid View</span>
        </Link>
      ) : (
        // Jika di halaman /, tunjukkan link ke Map (/map)
        <Link href="/map" className="flex items-center gap-2">
          <MapIcon className="h-4 w-4" />
          <span>Map View</span>
        </Link>
      )}
    </Button>
  );
}