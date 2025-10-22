// src/components/live-tracking-map.tsx
'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useState, useEffect } from 'react';

// --- Perbaikan Ikon Leaflet ---
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
L.Icon.Default.mergeOptions({ iconUrl: iconUrl.src, shadowUrl: iconShadow.src });

// --- Ikon Kustom untuk Driver ---
const driverIcon = new L.Icon({
  iconUrl: '/img/driver-icon.png', // <-- KAMU HARUS SEDIAKAN GAMBAR INI
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

type Props = {
  restoCoords: [number, number];
  userCoords: [number, number];
};

// Fungsi "Lerp" (Linear Interpolation) untuk simulasi gerak
const lerp = (start: number, end: number, t: number) => {
  return start * (1 - t) + end * t;
};

export default function LiveTrackingMap({ restoCoords, userCoords }: Props) {
  // State untuk menyimpan posisi driver (simulasi)
  const [driverPosition, setDriverPosition] = useState<[number, number]>(restoCoords);
  // State untuk menyimpan progress (0.0 s/d 1.0)
  const [progress, setProgress] = useState(0);

  // Ini adalah SIMULASI pergerakan driver
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) {
          clearInterval(interval);
          return 1;
        }
        return prev + 0.01; // Tambah progress 1% setiap detik
      });
    }, 1000); // Update setiap 1 detik

    return () => clearInterval(interval);
  }, []);

  // Update posisi driver di peta berdasarkan progress
  useEffect(() => {
    const newLat = lerp(restoCoords[0], userCoords[0], progress);
    const newLng = lerp(restoCoords[1], userCoords[1], progress);
    setDriverPosition([newLat, newLng]);
  }, [progress, restoCoords, userCoords]);

  // Tentukan batas peta agar Resto dan User terlihat
  const bounds = L.latLngBounds([restoCoords, userCoords]);

  return (
    <MapContainer
      bounds={bounds} // Auto-zoom ke 2 titik
      scrollWheelZoom={false}
      className="w-full h-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Garis Rute (Simulasi) */}
      <Polyline positions={[restoCoords, userCoords]} color="blue" />

      {/* Pin Resto */}
      <Marker position={restoCoords}>
        <Popup>Sate Klopo Ondomohen</Popup>
      </Marker>

      {/* Pin Alamatmu */}
      <Marker position={userCoords}>
        <Popup>Lokasimu</Popup>
      </Marker>

      {/* Pin Driver (YANG BERGERAK!) */}
      <Marker position={driverPosition} icon={driverIcon}>
        <Popup>Driver OTW!</Popup>
      </Marker>
    </MapContainer>
  );
}