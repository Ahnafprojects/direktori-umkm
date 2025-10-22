// src/components/checkout-map.tsx
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Coords } from '@/app/checkout/page'; // Kita impor tipe data dari checkout

// --- Perbaikan Ikon Leaflet (sama seperti sebelumnya) ---
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconUrl: iconUrl.src,
  shadowUrl: iconShadow.src,
});
// --- Akhir Perbaikan Ikon ---

type Props = {
  location: Coords; // Menerima lokasi (lat, long)
};

export default function CheckoutMap({ location }: Props) {
  const position: [number, number] = [location.lat, location.long];

  return (
    // Kita gunakan `key` unik agar peta me-refresh saat lokasi berubah
    <MapContainer
      key={`${location.lat}-${location.long}`}
      center={position}
      zoom={16} // Zoom level yang pas
      scrollWheelZoom={false} // Nonaktifkan zoom
      className="w-full h-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} keyboard={true}>
        <Popup>Lokasi Pengantaranmu</Popup>
      </Marker>
    </MapContainer>
  );
}