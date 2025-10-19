// src/app/_components/open-now-toggle.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function OpenNowToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isOpenNow = searchParams.get('openNow') === 'true';

  const handleToggle = (isChecked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (isChecked) {
      params.set('openNow', 'true');
    } else {
      params.delete('openNow');
    }
    // Ganti URL tanpa me-refresh scroll
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="open-now-filter"
        checked={isOpenNow}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor="open-now-filter" className="font-semibold cursor-pointer">
        Buka Sekarang
      </Label>
    </div>
  );
}