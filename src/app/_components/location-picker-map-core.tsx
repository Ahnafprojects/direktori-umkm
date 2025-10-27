// File: src/app/_components/location-picker-map-core.tsx
'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 1. HAPUS SEMUA IMPORT GAMBAR DARI SINI
// import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// import markerIcon from 'leaflet/dist/images/marker-icon.png';
// import markerShadow from 'leaflet/dist/images/marker-shadow.png';

type Position = { lat: number; lng: number };

interface LocationPickerMapCoreProps {
  position: Position | null;
  onLocationChange: (position: Position) => void;
}

function MapClickHandler({ onLocationChange }: { onLocationChange: (position: Position) => void }) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng); 
    },
  });
  return null;
}

export default function LocationPickerMapCore({ position, onLocationChange }: LocationPickerMapCoreProps) {
  // 2. PERBAIKI PEMBUATAN IKON UNTUK MENGGUNAKAN PATH DARI FOLDER 'PUBLIC'
  const customIcon = new L.Icon({
      iconUrl: '/leaflet/marker-icon.png',
      iconRetinaUrl: '/leaflet/marker-icon-2x.png',
      shadowUrl: '/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
  });

  const defaultPosition: Position = { lat: -7.2575, lng: 112.7521 };

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
    </MapContainer>
  );
}