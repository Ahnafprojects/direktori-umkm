// src/components/live-tracking-map.tsx
"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

type Props = {
  restoCoords: [number, number];
  userCoords: [number, number];
};

export default function LiveTrackingMap({ restoCoords, userCoords }: Props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapComponents, setMapComponents] = useState<any>(null);
  const [driverPosition, setDriverPosition] =
    useState<[number, number]>(restoCoords);
  const [progress, setProgress] = useState(0);

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

        // Icon untuk restoran (biru)
        const restoIcon = new L.Icon({
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

        // Icon untuk tujuan/customer (merah)
        const destinationIcon = new L.Icon({
          iconUrl:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDEwLjYgMTIuNSAyOC41IDEyLjUgMjguNVMyNSAyMy4xIDI1IDEyLjVDMjUgNS42IDE5LjQgMCAxMi41IDB6bTAgMTcuNWMtMi44IDAtNS0yLjItNS01czIuMi01IDUtNSA1IDIuMiA1IDUtMi4yIDUtNSA1eiIgZmlsbD0iI2VmNDQ0NCIvPgogIDxjaXJjbGUgY3g9IjEyLjUiIGN5PSIxMi41IiByPSI1IiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPg==",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          shadowSize: [41, 41],
        });

        // Icon untuk driver (motor)
        const driverIcon = new L.Icon({
          iconUrl: "/images/icon/driver.svg",
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40],
        });

        setMapComponents({
          MapContainer,
          TileLayer,
          Marker,
          Popup,
          Polyline,
          restoIcon,
          destinationIcon,
          driverIcon,
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
  }, []);

  // Animasi driver bergerak dari restoran ke tujuan
  useEffect(() => {
    if (!isLoaded) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) {
          clearInterval(interval);
          return 1;
        }
        return prev + 0.005; // Kecepatan animasi (0.5% per interval)
      });
    }, 50); // Update setiap 50ms

    return () => clearInterval(interval);
  }, [isLoaded]);

  // Hitung posisi driver berdasarkan progress
  useEffect(() => {
    const lat = restoCoords[0] + (userCoords[0] - restoCoords[0]) * progress;
    const lng = restoCoords[1] + (userCoords[1] - restoCoords[1]) * progress;
    setDriverPosition([lat, lng]);
  }, [progress, restoCoords, userCoords]);

  if (!isLoaded || !mapComponents) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    restoIcon,
    destinationIcon,
    driverIcon,
  } = mapComponents;

  // Calculate center point between restaurant and user
  const centerLat = (restoCoords[0] + userCoords[0]) / 2;
  const centerLng = (restoCoords[1] + userCoords[1]) / 2;
  const center: [number, number] = [centerLat, centerLng];

  return (
    <>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marker Restoran (Biru) */}
        <Marker position={restoCoords} icon={restoIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-semibold">🏪 Restoran</p>
              <p className="text-xs text-muted-foreground">Lokasi UMKM</p>
            </div>
          </Popup>
        </Marker>

        {/* Marker Tujuan/Customer (Merah) */}
        <Marker position={userCoords} icon={destinationIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-semibold">🏠 Tujuan</p>
              <p className="text-xs text-muted-foreground">Lokasi Pengiriman</p>
            </div>
          </Popup>
        </Marker>

        {/* Marker Driver (Bergerak) */}
        <Marker position={driverPosition} icon={driverIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-semibold">🏍️ Driver</p>
              <p className="text-xs text-muted-foreground">
                {progress >= 1
                  ? "Sudah sampai!"
                  : `Dalam perjalanan (${Math.round(progress * 100)}%)`}
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Garis penghubung (rute) */}
        <Polyline
          positions={[restoCoords, userCoords]}
          pathOptions={{
            color: "#10b981",
            weight: 4,
            opacity: 0.7,
            dashArray: "10, 10",
          }}
        />
      </MapContainer>

      {/* Custom CSS untuk attribution */}
      <style jsx global>{`
        .leaflet-control-attribution {
          font-size: 6px !important;
          opacity: 0.1 !important;
          background: transparent !important;
          padding: 1px 2px !important;
          border-radius: 2px !important;
        }

        .leaflet-control-attribution:hover {
          opacity: 0.8 !important;
          background: rgba(255, 255, 255, 0.9) !important;
        }
      `}</style>
    </>
  );
}
