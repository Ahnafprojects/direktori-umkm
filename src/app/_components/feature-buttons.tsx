// src/app/_components/feature-buttons.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function FeatureButtons() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handler untuk Lokasi Terdekat
  const handleFindNearest = () => {
    if (!navigator.geolocation) {
      toast.error('Browser tidak mendukung geolokasi', { icon: '❌' });
      return;
    }

    toast.loading('Mencari lokasi...', { id: 'location' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const params = new URLSearchParams(searchParams);
        params.set('lat', latitude.toString());
        params.set('long', longitude.toString());
        
        toast.success('Lokasi ditemukan!', { id: 'location', icon: '📍' });
        router.push(`/?${params.toString()}`);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Gagal mendapatkan lokasi. Pastikan GPS aktif.', { 
          id: 'location',
          icon: '⚠️' 
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  // Handler untuk Buka Sekarang
  const handleOpenNow = () => {
    const params = new URLSearchParams(searchParams);
    const currentOpenNow = params.get('openNow');
    
    if (currentOpenNow === 'true') {
      params.delete('openNow');
      toast.success('Filter "Buka Sekarang" dinonaktifkan', { icon: '🔓' });
    } else {
      params.set('openNow', 'true');
      toast.success('Menampilkan UMKM yang buka sekarang', { icon: '🟢' });
    }
    
    router.push(`/?${params.toString()}`);
  };

  const isOpenNowActive = searchParams.get('openNow') === 'true';

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6">
      {/* Buka Sekarang */}
      <button
        onClick={handleOpenNow}
        className={`group relative flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg ${
          isOpenNowActive 
            ? 'bg-green-100 dark:bg-green-950 ring-2 ring-green-500' 
            : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
        }`}
      >
        <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 transition-transform group-hover:scale-110">
          <Image
            src="/images/fitur/bukasekarang.png"
            alt="Buka Sekarang"
            fill
            className="object-contain"
          />
        </div>
        <span className="text-xs sm:text-sm md:text-base font-semibold text-center text-gray-800 dark:text-gray-200">
          Buka Sekarang
        </span>
        {isOpenNowActive && (
          <span className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full animate-pulse" />
        )}
      </button>

      {/* Lokasi Terdekat */}
      <button
        onClick={handleFindNearest}
        className="group relative flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
      >
        <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 transition-transform group-hover:scale-110">
          <Image
            src="/images/fitur/lokasiterdekat.png"
            alt="Lokasi Terdekat"
            fill
            className="object-contain"
          />
        </div>
        <span className="text-xs sm:text-sm md:text-base font-semibold text-center text-gray-800 dark:text-gray-200">
          Lokasi Terdekat
        </span>
      </button>

      {/* Map View */}
      <Link
        href="/map"
        className="group relative flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
      >
        <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 transition-transform group-hover:scale-110">
          <Image
            src="/images/fitur/mapview.png"
            alt="Map View"
            fill
            className="object-contain"
          />
        </div>
        <span className="text-xs sm:text-sm md:text-base font-semibold text-center text-gray-800 dark:text-gray-200">
          Lihat Peta UMKM
        </span>
      </Link>
    </div>
  );
}
