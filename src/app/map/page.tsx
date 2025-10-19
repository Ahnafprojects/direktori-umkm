// src/app/map/page.tsx
import { getUmkmForMap } from '@/lib/actions';
import MapClientWrapper from './_components/map-client-wrapper';

export default async function MapPage() {
  // 1. Ambil data semua pin (Server Component tetap bisa fetch data)
  const pins = await getUmkmForMap();

  // 2. Tentukan titik tengah peta (misal: PENS Surabaya)
  // Ganti dengan koordinat pusat lokasimu
  const mapCenter: [number, number] = [-7.275810, 112.794640];

  return (
    // Kita buat halaman ini full-screen (minus header)
    // 'h-[calc(100vh-theme(spacing.14))]' = 100% tinggi layar - tinggi header
    <div className="h-[calc(100vh-theme(spacing.14))] w-full">
      <MapClientWrapper pins={pins} center={mapCenter} />
    </div>
  );
}