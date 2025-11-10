// src/app/_components/open-now-toggle.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function OpenNowToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isOpenNow = searchParams.get('openNow') === 'true';

  const handleToggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isOpenNow) {
      params.delete('openNow');
    } else {
      params.set('openNow', 'true');
    }
    // Ganti URL tanpa me-refresh scroll
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <Button
      variant={isOpenNow ? "default" : "outline"}
      onClick={handleToggle}
      className={`transition-all duration-200 ${
        isOpenNow 
          ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
          : 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
      }`}
    >
      Buka Sekarang
    </Button>
  );
}
