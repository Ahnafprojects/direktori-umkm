// src/components/umkm-bulk-map.tsx
"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { Button } from "./ui/button";
import { MapPin, Star, Clock, Phone } from "lucide-react";

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
  address?: string;
  phone?: string;
  openingHours?: string;
  rating?: number;
  category: { name: string };
};

type Props = {
  pins: MapPin[];
  center: [number, number]; // [lat, long]
};

// Fungsi untuk mengelompokkan marker yang berdekatan
const groupNearbyMarkers = (pins: MapPin[], threshold = 0.0001) => {
  const grouped: Array<{ pins: MapPin[]; center: [number, number] }> = [];
  const processed = new Set<number>();

  pins.forEach((pin) => {
    if (processed.has(pin.id)) return;

    const group = [pin];
    processed.add(pin.id);

    // Cari pin lain yang berdekatan
    pins.forEach((otherPin) => {
      if (
        !processed.has(otherPin.id) &&
        Math.abs(pin.latitude - otherPin.latitude) < threshold &&
        Math.abs(pin.longitude - otherPin.longitude) < threshold
      ) {
        group.push(otherPin);
        processed.add(otherPin.id);
      }
    });

    // Hitung center dari group
    const centerLat =
      group.reduce((sum, p) => sum + p.latitude, 0) / group.length;
    const centerLng =
      group.reduce((sum, p) => sum + p.longitude, 0) / group.length;

    grouped.push({
      pins: group,
      center: [centerLat, centerLng],
    });
  });

  return grouped;
};

// Fungsi untuk membuat marker cluster
const createClusterMarker = (count: number, categoryName: string) => {
  const iconUrl = getIconUrl(categoryName);

  return new L.DivIcon({
    className: "cluster-marker",
    html: `
      <div class="cluster-wrapper">
        <div class="cluster-pin">
          <img src="${iconUrl}" alt="${categoryName}" class="cluster-icon" />
          <div class="cluster-badge">${count}</div>
        </div>
      </div>
    `,
    iconSize: [60, 60],
    iconAnchor: [30, 60],
    popupAnchor: [0, -60],
  });
};

// Komponen untuk popup single UMKM
const SingleUmkmPopup = ({ umkm }: { umkm: MapPin }) => (
  <div className="w-72 space-y-3 bg-card p-3 rounded-lg">
    {/* Header dengan gambar */}
    <div className="relative">
      <img
        src={umkm.photoUrl || "/images/placeholder-umkm.jpg"}
        alt={`Foto ${umkm.name}`}
        className="w-full h-32 object-cover rounded-lg"
        loading="lazy"
      />
      <div className="absolute top-2 right-2 bg-primary/95 backdrop-blur-sm border-2 border-primary px-3 py-1 rounded-full text-xs font-extrabold text-primary-foreground shadow-lg">
        {umkm.category.name}
      </div>
    </div>

    {/* Info UMKM */}
    <div className="space-y-3 bg-muted/30 p-3 rounded-lg">
      <h3 className="font-black text-xl text-foreground leading-tight">
        {umkm.name}
      </h3>

      {/* Rating */}
      {umkm.rating && (
        <div className="flex items-center gap-1 bg-background/50 px-2 py-1 rounded-md w-fit">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-base font-black text-foreground">
            {umkm.rating}
          </span>
          <span className="text-xs text-foreground/80 font-bold">/ 5.0</span>
        </div>
      )}

      {/* Alamat */}
      {umkm.address && (
        <div className="flex items-start gap-2 bg-background/50 p-2 rounded-md">
          <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <span className="text-sm text-foreground leading-relaxed font-bold">
            {umkm.address}
          </span>
        </div>
      )}

      {/* Jam buka */}
      {umkm.openingHours && (
        <div className="flex items-center gap-2 bg-background/50 p-2 rounded-md">
          <Clock className="w-5 h-5 text-primary" />
          <span className="text-sm text-foreground font-bold">
            {umkm.openingHours}
          </span>
        </div>
      )}

      {/* Telepon */}
      {umkm.phone && (
        <div className="flex items-center gap-2 bg-background/50 p-2 rounded-md">
          <Phone className="w-5 h-5 text-primary" />
          <span className="text-sm text-foreground font-bold">
            {umkm.phone}
          </span>
        </div>
      )}
    </div>

    {/* Tombol aksi */}
    <div className="pt-2">
      <Button
        asChild
        className="w-full bg-primary hover:bg-primary/90 text-white font-black text-base shadow-lg"
      >
        <Link href={`/umkm/${umkm.slug}`}>Lihat Detail</Link>
      </Button>
    </div>
  </div>
);

// Komponen untuk popup multiple UMKM
const MultipleUmkmPopup = ({ umkms }: { umkms: MapPin[] }) => (
  <div className="w-80 space-y-3 bg-card p-3 rounded-lg">
    <div className="flex items-center gap-2 pb-3 border-b-2 border-border bg-muted/30 p-2 rounded-md">
      <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-black text-base shadow-lg">
        {umkms.length}
      </div>
      <h3 className="font-black text-foreground text-base">
        UMKM di Lokasi Ini
      </h3>
    </div>

    <div className="max-h-64 overflow-y-auto space-y-2">
      {umkms.map((umkm) => (
        <div
          key={umkm.id}
          className="flex gap-3 p-3 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors border-2 border-border"
        >
          <img
            src={umkm.photoUrl || "/images/placeholder-umkm.jpg"}
            alt={`Foto ${umkm.name}`}
            className="w-16 h-16 object-cover rounded-lg shrink-0 border-2 border-primary"
            loading="lazy"
          />

          <div className="flex-1 min-w-0 space-y-1">
            <h4 className="font-black text-sm text-foreground truncate">
              {umkm.name}
            </h4>
            <p className="text-xs text-foreground/80 font-bold bg-background/50 px-2 py-0.5 rounded w-fit">
              {umkm.category.name}
            </p>

            {umkm.rating && (
              <div className="flex items-center gap-1 bg-background/50 px-1.5 py-0.5 rounded w-fit">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-black text-foreground">
                  {umkm.rating}
                </span>
              </div>
            )}

            <Button
              asChild
              size="sm"
              className="w-full mt-1 h-8 text-xs font-black bg-primary hover:bg-primary/90 text-white border-2 border-primary shadow-md"
            >
              <Link href={`/umkm/${umkm.slug}`}>Detail</Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function UmkmBulkMap({ pins, center }: Props) {
  const groupedMarkers = groupNearbyMarkers(pins);

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

        {/* Render grouped markers */}
        {groupedMarkers.map((group, index) => (
          <Marker
            key={`group-${index}`}
            position={group.center}
            keyboard={true}
            icon={
              group.pins.length === 1
                ? createCustomMarker(
                    group.pins[0].name,
                    group.pins[0].category.name
                  )
                : createClusterMarker(
                    group.pins.length,
                    group.pins[0].category.name
                  )
            }
          >
            <Popup maxWidth={320} className="custom-popup">
              <div className="p-1">
                {group.pins.length === 1 ? (
                  // Single UMKM popup
                  <SingleUmkmPopup umkm={group.pins[0]} />
                ) : (
                  // Multiple UMKM popup
                  <MultipleUmkmPopup umkms={group.pins} />
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Custom CSS untuk styling attribution, marker, dan popup */}
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

        /* Custom Popup Styling */
        .leaflet-popup-content-wrapper {
          background: hsl(var(--background)) !important;
          border-radius: 16px !important;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4) !important;
          border: 3px solid hsl(var(--primary)) !important;
          padding: 0 !important;
          overflow: hidden;
        }

        .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
          color: hsl(var(--foreground)) !important;
        }

        .leaflet-popup-tip {
          background: hsl(var(--background)) !important;
          border: 3px solid hsl(var(--primary)) !important;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3) !important;
        }

        .leaflet-popup-close-button {
          top: 12px !important;
          right: 12px !important;
          font-size: 20px !important;
          font-weight: 900 !important;
          color: hsl(var(--foreground)) !important;
          width: 32px !important;
          height: 32px !important;
          background: hsl(var(--background)) !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border: 3px solid hsl(var(--foreground)) !important;
          backdrop-filter: blur(8px) !important;
          transition: all 0.2s ease !important;
          opacity: 1 !important;
          z-index: 1000 !important;
        }

        .leaflet-popup-close-button:hover {
          background: hsl(var(--destructive)) !important;
          color: hsl(var(--destructive-foreground)) !important;
          border-color: hsl(var(--destructive)) !important;
          transform: scale(1.1) !important;
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
          /* Recolor SVG to primary color */
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
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
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

        /* Cluster Marker Styling */
        .cluster-marker {
          background: transparent !important;
          border: none !important;
        }

        .cluster-wrapper {
          position: relative;
        }

        .cluster-pin {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
          border: 4px solid white;
          position: relative;
          cursor: pointer;
        }

        .cluster-icon {
          width: 24px;
          height: 24px;
          object-fit: contain;
          filter: brightness(0) saturate(100%) invert(100%);
        }

        .cluster-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #dc2626; /* red-600 */
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        /* Hover effects */
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

        .cluster-wrapper:hover .cluster-pin {
          transform: scale(1.1);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
          transition: all 0.2s ease;
        }

        /* Scrollbar styling untuk popup */
        .leaflet-popup-content ::-webkit-scrollbar {
          width: 8px;
        }

        .leaflet-popup-content ::-webkit-scrollbar-track {
          background: hsl(var(--muted));
          border-radius: 4px;
        }

        .leaflet-popup-content ::-webkit-scrollbar-thumb {
          background: hsl(var(--primary));
          border-radius: 4px;
        }

        .leaflet-popup-content ::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary) / 0.8);
        }

        /* Ensure maximum contrast and readability */
        .leaflet-popup-content * {
          text-shadow: none !important;
        }

        /* Force high contrast text */
        .leaflet-popup-content h3,
        .leaflet-popup-content h4 {
          font-weight: 900 !important;
          color: hsl(var(--foreground)) !important;
          letter-spacing: -0.02em !important;
        }

        .leaflet-popup-content span,
        .leaflet-popup-content p {
          font-weight: 700 !important;
          color: hsl(var(--foreground)) !important;
        }

        /* Add background to all text containers for better contrast */
        .leaflet-popup-content > div {
          background: hsl(var(--card)) !important;
        }

        /* Special styling for theme-ocean to improve contrast */
        .theme-ocean .leaflet-popup-content-wrapper {
          background: oklch(0.14 0.03 216) !important;
          border-color: oklch(0.6 0.15 217) !important;
          border-width: 3px !important;
        }

        .theme-ocean .leaflet-popup-tip {
          background: oklch(0.14 0.03 216) !important;
          border-color: oklch(0.6 0.15 217) !important;
        }

        .theme-ocean .leaflet-popup-close-button {
          background: oklch(0.25 0.03 216) !important;
          border-color: oklch(0.98 0.02 210) !important;
          color: oklch(0.98 0.02 210) !important;
        }

        .theme-ocean .leaflet-popup-content h3,
        .theme-ocean .leaflet-popup-content h4,
        .theme-ocean .leaflet-popup-content span,
        .theme-ocean .leaflet-popup-content p {
          color: oklch(0.98 0.02 210) !important;
        }

        /* Extra contrast layers for ocean theme */
        .theme-ocean .bg-card {
          background: oklch(0.19 0.03 216) !important;
        }

        .theme-ocean .bg-muted\/30 {
          background: oklch(0.24 0.03 216) !important;
        }

        .theme-ocean .bg-background\/50 {
          background: oklch(0.22 0.04 216) !important;
        }

        .theme-ocean .border-border {
          border-color: oklch(0.4 0.05 216) !important;
        }

        .theme-ocean .border-primary {
          border-color: oklch(0.6 0.15 217) !important;
        }

        .theme-ocean .text-primary {
          color: oklch(0.65 0.18 217) !important;
        }

        .theme-ocean .bg-primary {
          background: oklch(0.6 0.15 217) !important;
        }

        /* Force white text on buttons */
        .leaflet-popup-content button,
        .leaflet-popup-content a {
          color: white !important;
        }

        .theme-ocean .leaflet-popup-content button,
        .theme-ocean .leaflet-popup-content a {
          color: white !important;
        }
      `}</style>
    </>
  );
}
