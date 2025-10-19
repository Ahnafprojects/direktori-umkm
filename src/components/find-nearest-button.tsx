// src/components/find-nearest-button.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, X } from 'lucide-react';

export default function FindNearestButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cek apakah kita sedang dalam mode "terdekat"
  const isNearestMode = searchParams.has('lat');

  const handleFindNearest = () => {
    setIsLocating(true);
    setError(null);

    // Minta izin Geolocation
    navigator.geolocation.getCurrentPosition(
      // 1. Jika Berhasil
      (position) => {
        const { latitude, longitude } = position.coords;

        // Buat URL params baru, tapi pertahankan filter yg ada
        const params = new URLSearchParams(searchParams.toString());
        params.set('lat', latitude.toString());
        params.set('long', longitude.toString());
        
        // Refresh halaman dengan URL baru
        // Next.js akan otomatis re-render Server Component
        router.push(`/?${params.toString()}`);
        setIsLocating(false);
      },
      // 2. Jika Gagal
      (err) => {
        console.error(err);
        setError('Gagal mendapatkan lokasi. Izinkan di browsermu.');
        setIsLocating(false);
      },
      { timeout: 10000 } // Batas waktu 10 detik
    );
  };

  // Fungsi untuk Hapus Filter Lokasi
  const handleClearLocation = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('lat');
    params.delete('long');
    router.push(`/?${params.toString()}`);
  }

  // Jika sedang mode terdekat, ganti tombolnya jadi "Clear"
  if (isNearestMode) {
    return (
      <Button variant="destructive" onClick={handleClearLocation} className="flex-shrink-0">
        <X className="mr-2 h-4 w-4" />
        Hapus Filter Lokasi
      </Button>
    )
  }

  // Tombol default
  return (
    <Button
      variant="outline"
      onClick={handleFindNearest}
      disabled={isLocating}
      className="flex-shrink-0"
    >
      {isLocating ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <MapPin className="mr-2 h-4 w-4" />
      )}
      Cari Terdekat
    </Button>
  );
}