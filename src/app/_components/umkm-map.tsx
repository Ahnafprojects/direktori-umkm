// src/components/umkm-map.tsx
'use client'; // <-- WAJIB!

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// --- Perbaikan untuk ikon default Leaflet ---
// Ini memperbaiki masalah umum di React di mana ikon marker tidak muncul
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconUrl: iconUrl.src,
  shadowUrl: iconShadow.src,
});
// --- Akhir Perbaikan Ikon ---

type Props = {
  latitude: number;
  longitude: number;
  popupText: string;
};

export default function UmkmMap({ latitude, longitude, popupText }: Props) {
  // Koordinat [lat, long]
  const position: [number, number] = [latitude, longitude];

  return (
    <MapContainer
      center={position}
      zoom={16} // Zoom level yang pas untuk lokasi
      scrollWheelZoom={false} // Nonaktifkan zoom scroll agar user bisa scroll halaman
      className="w-full h-full rounded-md z-0" // z-0 penting
    >
      {/* TileLayer: Ini adalah gambar petanya. Kita pakai OpenStreetMap (Gratis) */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Marker: Pin lokasi UMKM */}
      <Marker position={position}>
        <Popup>
          {/* Popup: Teks yang muncul saat marker di-klik */}
          {popupText}
        </Popup>
      </Marker>
    </MapContainer>
  );
}