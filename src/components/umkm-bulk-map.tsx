// src/components/umkm-bulk-map.tsx
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import { Button } from './ui/button';

// --- Perbaikan Ikon Leaflet (sama seperti sebelumnya) ---
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconUrl: iconUrl.src,
  shadowUrl: iconShadow.src,
});
// --- Akhir Perbaikan Ikon ---

// Tipe data untuk pin
type MapPin = {
  id: number;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  category: { name: string };
};

type Props = {
  pins: MapPin[];
  center: [number, number]; // [lat, long]
};

export default function UmkmBulkMap({ pins, center }: Props) {
  return (
    <>
      {/* Peta ini akan mengisi penuh parent-nya */}
      <MapContainer
        center={center}
        zoom={14} // Zoom sedikit lebih jauh
        scrollWheelZoom={true} // Aktifkan zoom di halaman peta
        className="w-full h-full z-0"
        attributionControl={true} // Tetap aktif
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Loop dan render semua pin */}
        {pins.map((pin) => (
          <Marker 
            key={pin.id} 
            position={[pin.latitude, pin.longitude]}
            keyboard={true} // <-- TAMBAHKAN INI
          >
            <Popup>
              <div className="space-y-2">
                <h3 className="font-bold">{pin.name}</h3>
                <p className="text-sm text-muted-foreground">{pin.category.name}</p>
                <Button asChild size="sm" className="w-full">
                  <Link href={`/umkm/${pin.slug}`}>Lihat Detail</Link>
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
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