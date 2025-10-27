// src/components/live-tracking-map.tsx
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

type Props = {
  restoCoords: [number, number];
  userCoords: [number, number];
};

// Dynamic import untuk menghindari SSR issues
const MapComponent = dynamic(() => import('react-leaflet').then((mod) => {
  // Setup leaflet icons
  if (typeof window !== 'undefined') {
    const L = require('leaflet');
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/leaflet/marker-icon-2x.png',
      iconUrl: '/leaflet/marker-icon.png',
      shadowUrl: '/leaflet/marker-shadow.png',
    });
  }
  
  return {
    default: ({ restoCoords, userCoords }: Props) => {
      const { MapContainer, TileLayer, Marker, Popup, Polyline } = mod;
      const [driverPosition, setDriverPosition] = useState<[number, number]>(restoCoords);
      const [progress, setProgress] = useState(0);
      
      const L = require('leaflet');
      
      // Custom driver icon
      const driverIcon = new L.Icon({
        iconUrl: '/leaflet/marker-icon.png', // Use default icon for now
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: '/leaflet/marker-shadow.png',
        shadowSize: [41, 41]
      });
      
      // Lerp function for smooth animation
      const lerp = (start: number, end: number, t: number) => {
        return start * (1 - t) + end * t;
      };
      
      // Simulate driver movement
      useEffect(() => {
        const interval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 1) {
              clearInterval(interval);
              return 1;
            }
            return prev + 0.01; // 1% progress per second
          });
        }, 1000);
        
        return () => clearInterval(interval);
      }, []);
      
      // Update driver position based on progress
      useEffect(() => {
        const newLat = lerp(restoCoords[0], userCoords[0], progress);
        const newLng = lerp(restoCoords[1], userCoords[1], progress);
        setDriverPosition([newLat, newLng]);
      }, [progress, restoCoords, userCoords]);
      
      // Calculate bounds
      const bounds = L.latLngBounds([restoCoords, userCoords]);
      
      return (
        <MapContainer
          bounds={bounds}
          scrollWheelZoom={false}
          className="w-full h-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Route line */}
          <Polyline positions={[restoCoords, userCoords]} color="blue" />
          
          {/* Restaurant marker */}
          <Marker position={restoCoords}>
            <Popup>Sate Klopo Ondomohen</Popup>
          </Marker>
          
          {/* User location marker */}
          <Marker position={userCoords}>
            <Popup>Lokasimu</Popup>
          </Marker>
          
          {/* Driver marker (animated) */}
          <Marker position={driverPosition} icon={driverIcon}>
            <Popup>Driver OTW!</Popup>
          </Marker>
        </MapContainer>
      );
    }
  };
}), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-gray-500">Memuat peta tracking...</div>
    </div>
  )
});

export default function LiveTrackingMap({ restoCoords, userCoords }: Props) {
  return <MapComponent restoCoords={restoCoords} userCoords={userCoords} />;
}