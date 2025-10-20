// src/components/umkm-map.tsx
"use client"; // <-- WAJIB!

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// --- Perbaikan untuk ikon default Leaflet ---
// Ini memperbaiki masalah umum di React di mana ikon marker tidak muncul

const customIcon = new L.Icon({
  iconUrl: "/images/icon/loc_icon.png",
  // shadowUrl: "/marker-shadow.png",
  iconSize: [40, 40],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowSize: [41, 41],
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
    <>
      <MapContainer
        center={position}
        zoom={16} // Zoom level yang pas untuk lokasi
        scrollWheelZoom={false} // Nonaktifkan zoom scroll agar user bisa scroll halaman
        className="w-full h-full rounded-md z-0" // z-0 penting
        attributionControl={true} // Tetap aktif
      >
        {/* TileLayer: Ini adalah gambar petanya. Kita pakai OpenStreetMap (Gratis) */}
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marker: Pin lokasi UMKM */}
        <Marker
          position={position}
          keyboard={true} // <-- TAMBAHKAN INI
          icon={customIcon}
        >
          <Popup>
            {/* Popup: Teks yang muncul saat marker di-klik */}
            {popupText}
          </Popup>
        </Marker>
      </MapContainer>

      {/* Custom CSS untuk styling attribution */}
      <style jsx global>{`
        .leaflet-control-attribution {
          font-size: 6px !important;
          opacity: 0.1 !important;
          background: transparent !important;
          padding: 1px 2px !important;
          border-radius: 2px !important;
          pointer-events: auto !important;
        }

        .leaflet-control-attribution:hover {
          opacity: 0.8 !important;
          background: rgba(255, 255, 255, 0.9) !important;
        }
      `}</style>
    </>
  );
}
