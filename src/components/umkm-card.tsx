// src/components/umkm-card.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Clock, Phone } from 'lucide-react';
import FavoriteToggleButton from './favorite-toggle-button'; // <-- 1. IMPORT
import ClientHydrator from './client-hydrator'; // <-- 2. IMPORT

// Tipe data yang sesuai dengan return dari getUmkms yang include category
type UmkmData = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  phone: string | null;
  openingHours: string | null;
  photos: string[];
  latitude: number | null;
  longitude: number | null;
  rating: any; // Decimal type dari Prisma
  hasPromo: boolean | null;
  isRecommended: boolean | null;
  categoryId: number;
  Category: {
    id: number;
    name: string;
    slug: string;
  };
};

type UmkmCardProps = {
  umkm: UmkmData;
};

export default function UmkmCard({ umkm }: UmkmCardProps) {
  const firstPhoto = umkm.photos[0] || '/images/placeholder-umkm.jpg';
  const rating = umkm.rating ? Number(umkm.rating) : 4.0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative">
      {/* 3. WRAPPER UNTUK POSISI TOMBOL */}
      <div className="absolute top-2 right-2 z-10">
        <ClientHydrator> {/* 4. BUNGKUS DENGAN HYDRATOR */}
          <FavoriteToggleButton umkmId={umkm.id} umkmName={umkm.name} />
        </ClientHydrator>
      </div>

      {/* Image */}
      <div className="relative h-48">
        <Image
          src={firstPhoto}
          alt={`Foto tampilan depan ${umkm.name}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-2">
          {umkm.isRecommended && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
              Rekomendasi
            </span>
          )}
          {umkm.hasPromo && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
              Promo
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* Title and Category */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{umkm.name}</h3>
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
            {umkm.Category.name}
          </span>
        </div>

        {/* Description */}
        {umkm.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {umkm.description}
          </p>
        )}

        {/* Address */}
        <div className="flex items-start gap-2 mb-2">
          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-gray-600 text-sm line-clamp-2">{umkm.address}</p>
        </div>

        {/* Opening Hours */}
        {umkm.openingHours && (
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <p className="text-gray-600 text-sm">{umkm.openingHours}</p>
          </div>
        )}

        {/* Phone */}
        {umkm.phone && (
          <div className="flex items-center gap-2 mb-3">
            <Phone className="h-4 w-4 text-gray-400" />
            <p className="text-gray-600 text-sm">{umkm.phone}</p>
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium">{rating.toFixed(1)}</span>
          <span className="text-gray-400 text-sm">({Math.floor(Math.random() * 100) + 10} ulasan)</span>
        </div>

        {/* Action Button */}
        <Link 
          href={`/umkm/${umkm.slug}`}
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded transition-colors duration-200"
        >
          Lihat Detail
        </Link>
      </div>
    </div>
  );
}