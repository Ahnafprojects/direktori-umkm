// src/components/umkm-bulk-map.tsx
"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { Button } from "./ui/button";

// --- Perbaikan Ikon Leaflet dengan kategori ---
// Fungsi untuk mendapatkan icon URL berdasarkan kategori
const getIconUrl = (categoryName: string) => {
  const category = categoryName.toLowerCase();
  if (category.includes("makanan")) return "/images/icon/makanan-icon.svg";
  if (category.includes("minuman")) return "/images/icon/minuman-icon.svg";
  if (category.includes("jasa")) return "/images/icon/jasa-icon.svg";
  if (category.includes("belanja")) return "/images/icon/belanja-icon.svg";
  return "/images/icon/makanan-icon.svg"; // Default
};

// Fungsi untuk membuat DivIcon dengan ikon + nama UMKM
const createCustomMarker = (umkmName: string, categoryName: string) => {
  const iconUrl = getIconUrl(categoryName);

  return new L.DivIcon({
    className: "custom-marker", // Kita akan style ini di CSS
    html: `
      <div class="marker-wrapper">
        <div class="marker-pin">
          <img src="${iconUrl}" alt="${categoryName}" class="marker-icon" />
        </div>
        <div class="marker-label">${umkmName}</div>
      </div>
    `,
    iconSize: [200, 70], // Lebih besar untuk label
    iconAnchor: [24, 48], // Anchor di ujung pin
    popupAnchor: [76, -30], // Popup muncul di atas label
  });
};
// --- Akhir Perbaikan Ikon ---

// Tipe data untuk pin
type MapPin = {
  id: number;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
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
            keyboard={true}
            icon={createCustomMarker(pin.name, pin.category.name)} // Icon dengan nama UMKM
          >
            <Popup>
              <div className="space-y-2">
                {/* Gambar UMKM */}
                <div className="w-full">
                  <img
                    src={pin.photoUrl || "/images/placeholder-umkm.jpg"}
                    alt={`Foto ${pin.name}`}
                    className="w-full h-28 object-cover rounded-md mb-2"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-bold">{pin.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {pin.category.name}
                </p>
                <Button asChild size="sm" className="w-full">
                  <Link href={`/umkm/${pin.slug}`}>Lihat Detail</Link>
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Custom CSS untuk styling attribution dan marker */}
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

        /* Styling untuk custom marker dengan nama */
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }

        .marker-wrapper {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          position: relative;
        }

        .marker-pin {
          width: 48px;
          height: 48px;
          background: white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
          border: 3px solid #f97316; /* orange-500 */
          position: relative;
          z-index: 1;
        }

        .marker-icon {
          width: 28px;
          height: 28px;
          object-fit: contain;
          transform: rotate(45deg);
          /* Recolor black SVG to orange for better contrast */
          filter: brightness(0) saturate(100%) invert(58%) sepia(93%)
            saturate(1506%) hue-rotate(359deg) brightness(98%) contrast(102%);
        }

        .marker-label {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 700;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
          white-space: nowrap;
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          position: relative;
          margin-left: 10px;
          letter-spacing: 0.3px;
        }

        .marker-label::before {
          content: "";
          position: absolute;
          left: -6px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          border-right: 6px solid #f97316; /* orange-500 */
        }

        /* Hover effect untuk marker */
        .marker-wrapper:hover .marker-pin {
          transform: rotate(-45deg) scale(1.1);
          border-color: #ea580c; /* orange-600 */
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
          transition: all 0.2s ease;
        }

        .marker-wrapper:hover .marker-label {
          background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
          transition: all 0.2s ease;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .marker-pin {
            background: white;
            border-color: #fb923c; /* orange-400 */
          }

          .marker-label {
            background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
          }

          .marker-label::before {
            border-right-color: #ea580c;
          }
        }
      `}</style>
    </>
  )};
