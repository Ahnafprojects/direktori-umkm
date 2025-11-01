// File: src/app/_components/location-picker-map-core.tsx
'use client';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';


const customIcon = new L.Icon({
    iconUrl: '/images/icon/marker3d.svg', 
    shadowUrl: undefined, 
    iconSize: [35, 35],  
    iconAnchor: [17.5, 35],
});


type Position = { lat: number; lng: number };

interface LocationPickerMapCoreProps {
  position: Position | null;
  onLocationChange: (position: Position) => void;
}

// Komponen helper tidak ada perubahan
function MapClickHandler({ onLocationChange }: { onLocationChange: (position: Position) => void }) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng); 
    },
  });
  return null;
}

function MapUpdater({ position }: { position: Position | null }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo([position.lat, position.lng], 15);
        }
    }, [position, map]);
    return null;
}

export default function LocationPickerMapCore({ position, onLocationChange }: LocationPickerMapCoreProps) {
  const defaultPosition: Position = { lat: -7.2820, lng: 112.7944 };

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
      
      {/* === PERUBAHAN DI SINI ===
        Tambahkan kembali prop 'icon' dan berikan 'customIcon' yang baru kita buat.
      */}
      {position && <Marker position={position} icon={customIcon}></Marker>}
      
      <MapClickHandler onLocationChange={onLocationChange} />
      <MapUpdater position={position} />
    </MapContainer>
  );
}