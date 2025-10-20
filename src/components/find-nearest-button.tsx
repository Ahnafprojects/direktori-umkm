// src/components/find-nearest-button.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, X } from "lucide-react";

export default function FindNearestButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cek apakah kita sedang dalam mode "terdekat"
  const isNearestMode = searchParams.has("lat");

  const handleFindNearest = () => {
    if (!navigator.geolocation) {
      setError("Browser kamu tidak mendukung geolokasi.");
      return;
    }

    setIsLocating(true);
    setError(null);

    // Minta izin Geolocation
    navigator.geolocation.getCurrentPosition(
      // 1. Jika Berhasil
      (position) => {
        const { latitude, longitude } = position.coords;

        // Buat URL params baru, tapi pertahankan filter yg ada
        const params = new URLSearchParams(searchParams.toString());
        params.set("lat", latitude.toString());
        params.set("long", longitude.toString());

        // Refresh halaman dengan URL baru
        // Next.js akan otomatis re-render Server Component
        router.push(`/?${params.toString()}`);
        setIsLocating(false);
      },
      // 2. Jika Gagal
      (err) => {
        // Don't log to console to prevent error overlay
        // console.error("Geolocation error:", err);

        // Better error messages based on error code
        let errorMessage = "Gagal mendapatkan lokasi.";

        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage =
              "Akses lokasi ditolak. Izinkan di pengaturan browser.";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = "Lokasi tidak tersedia. Coba lagi nanti.";
            break;
          case err.TIMEOUT:
            errorMessage = "Permintaan lokasi timeout. Coba lagi.";
            break;
          default:
            errorMessage = "Gagal mendapatkan lokasi. Coba lagi.";
        }

        setError(errorMessage);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: false, // Use false for faster response
        timeout: 10000, // 10 seconds timeout
        maximumAge: 30000, // Accept cached position up to 30 seconds old
      }
    );
  };

  // Fungsi untuk Hapus Filter Lokasi
  const handleClearLocation = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("lat");
    params.delete("long");
    router.push(`/?${params.toString()}`);
  };

  // Jika sedang mode terdekat, ganti tombolnya jadi "Clear"
  if (isNearestMode) {
    return (
      <Button
        variant="destructive"
        onClick={handleClearLocation}
        className="flex-shrink-0"
      >
        <X className="mr-2 h-4 w-4" />
        Hapus Filter Lokasi
      </Button>
    );
  }

  // Tombol default
  return (
    <div className="relative flex-shrink-0" style={{ minWidth: 0 }}>
      <Button
        variant="outline"
        onClick={handleFindNearest}
        disabled={isLocating}
        className="w-full"
      >
        {isLocating ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <MapPin className="mr-2 h-4 w-4" />
        )}
        Cari Terdekat
      </Button>
      {error && (
        <span
          className="absolute left-0 top-full mt-1 text-xs text-destructive whitespace-nowrap z-10 bg-background px-2 py-1 rounded shadow"
          style={{ minWidth: "max-content" }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
