// src/components/umkm-map.tsx

"use client"; // <-- WAJIB!

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Ini memperbaiki masalah umum di React di mana ikon marker tidak muncul
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconUrl: iconUrl.src,
  shadowUrl: iconShadow.src,
});

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

type Props = {
  latitude: number;
  longitude: number;
  popupText: string;
  showRoute?: boolean;
  userLocation?: [number, number];
};

export default function UmkmMap({
  latitude,
  longitude,
  popupText,
  showRoute = false,
  userLocation,
}: Props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapComponents, setMapComponents] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    const loadMapComponents = async () => {
      try {
        const [{ MapContainer, TileLayer, Marker, Popup, Polyline }, L] =
          await Promise.all([import("react-leaflet"), import("leaflet")]);

        if (!mounted) return;

        // Fix leaflet default icon issue
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        // Custom icon untuk lokasi UMKM (merah/biru yang jelas)
        const customIcon = new L.Icon({
          iconUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });

        const userIcon = new L.Icon({
          iconUrl:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMzYjgyZjYiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNCIgZmlsbD0id2hpdGUiLz4KPC9zdmc+",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        setMapComponents({
          MapContainer,
          TileLayer,
          Marker,
          Popup,
          Polyline,
          customIcon,
          userIcon,
        });

        setIsLoaded(true);
      } catch (error) {
        console.error("Error loading map components:", error);
      }
    };

    loadMapComponents();

    return () => {
      mounted = false;
    };
  }, []); // Only run once

  if (!isLoaded || !mapComponents) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    customIcon,
    userIcon,
  } = mapComponents;
  const position: [number, number] = [latitude, longitude];

  return (
    <>
      <MapContainer
        center={position}
        zoom={showRoute ? 13 : 16}
        scrollWheelZoom={false}
        className="w-full h-full rounded-md z-0"
        attributionControl={true}
        key={`${latitude}-${longitude}-${showRoute}`} // Force re-render when needed
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marker: Pin lokasi UMKM */}
        <Marker position={position} keyboard={true} icon={customIcon}>
          <Popup>{popupText}</Popup>
        </Marker>

        {/* User location marker */}
        {showRoute && userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>Lokasi Anda</Popup>
          </Marker>
        )}

        {/* Route line */}
        {showRoute && userLocation && (
          <Polyline
            positions={[userLocation, position]}
            pathOptions={{
              color: "#10b981",
              weight: 4,
              opacity: 0.8,
              dashArray: "10, 10",
            }}
          />
        )}
      </MapContainer>

      {/* Custom CSS */}
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
