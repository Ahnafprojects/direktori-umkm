// File: src/app/_components/location-picker.tsx
'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Tipe data untuk posisi yang akan kita gunakan
type Position = { lat: number; lng: number };

// Props yang akan diterima oleh komponen kita
interface LocationPickerProps {
  position: Position | null;
  onLocationChange: (position: Position) => void;
}

export default function LocationPicker({ position, onLocationChange }: LocationPickerProps) {
    // Gunakan useMemo untuk memuat komponen peta secara dinamis HANYA di sisi klien.
    // Ini adalah teknik yang sama yang digunakan di live-tracking-map.tsx
    const Map = useMemo(() => dynamic(
        () => import('@/app/_components/location-picker-map-core'), // Kita akan buat file ini selanjutnya
        { 
            loading: () => <div className="w-full h-80 bg-gray-200 flex items-center justify-center rounded-md text-muted-foreground">Memuat Peta...</div>,
            ssr: false // Sangat penting: Nonaktifkan Server-Side Rendering untuk komponen ini
        }
    ), []);

    return <Map position={position} onLocationChange={onLocationChange} />;
}
