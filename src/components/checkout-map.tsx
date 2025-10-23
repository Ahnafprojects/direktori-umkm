// src/components/checkout-map.tsx
'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Coords } from '@/app/checkout/page';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
  iconUrl: '/leaflet/images/marker-icon.png',
  shadowUrl: '/leaflet/images/marker-shadow.png',
});

// Fallback: Create custom icon if default fails
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

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
      <Marker position={position} icon={customIcon} keyboard={true}>
        <Popup>Lokasi Pengantaranmu</Popup>
      </Marker>
    </MapContainer>
  );
}