// File: src/app/_components/location-picker-map-core.tsx
'use client';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Path ke ikon di folder public
const iconUrl = '/leaflet/marker-icon.png';
const iconRetinaUrl = '/leaflet/marker-icon-2x.png';
const shadowUrl = '/leaflet/marker-shadow.png';

const customIcon = new L.Icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

type Position = { lat: number; lng: number };

interface LocationPickerMapCoreProps {
  position: Position | null;
  onLocationChange: (position: Position) => void;
}

// Komponen helper untuk menangani klik
function MapClickHandler({ onLocationChange }: { onLocationChange: (position: Position) => void }) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng); 
    },
  });
  return null;
}

// =================================================================
// KOMPONEN HELPER BARU UNTUK MENGGERAKKAN PETA
// =================================================================
function MapUpdater({ position }: { position: Position | null }) {
    const map = useMap(); // Dapatkan instance peta
    useEffect(() => {
        if (position) {
            // Gunakan flyTo untuk animasi yang mulus ke posisi baru
            map.flyTo([position.lat, position.lng], 15); // Zoom level 15
        }
    }, [position, map]);

    return null;
}

export default function LocationPickerMapCore({ position, onLocationChange }: LocationPickerMapCoreProps) {
  const defaultPosition: Position = { lat: -7.2820, lng: 112.7944 }; // Default di area ITS Surabaya

  return (
    <MapContainer 
      center={position || defaultPosition} 
      zoom={13} 
      scrollWheelZoom={true} 
      className="w-full h-80 rounded-md z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {position && <Marker position={position} icon={customIcon}></Marker>}
      
      <MapClickHandler onLocationChange={onLocationChange} />
      {/* Tambahkan komponen updater di sini */}
      <MapUpdater position={position} />
    </MapContainer>
  );
}