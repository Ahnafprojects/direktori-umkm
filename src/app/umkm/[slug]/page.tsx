// src/app/umkm/[slug]/page.tsx
import { getUmkmBySlug } from "@/lib/actions";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Phone, Star, Navigation, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import MapWrapper from "@/components/map-wrapper";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
// import { Prisma } from "@prisma/client"; // <-- 1. IMPORT PRISMA (ga kanggo)
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // <-- 2. IMPORT AVATAR
import { Separator } from "@/components/ui/separator"; // <-- 3. IMPORT SEPARATOR
import ShareButton from "@/components/share-button";
import FavoriteToggleButton from "@/components/favorite-toggle-button"; // <-- 1. IMPORT
import ClientHydrator from "@/components/client-hydrator"; // <-- 2. IMPORT
type DetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function UmkmDetailPage({ params }: DetailPageProps) {
  const { slug } = await params;
  // 5. GUNAKAN TIPE YANG BARU
  const umkm = await getUmkmBySlug(slug);

  // Jika slug tidak ditemukan, tampilkan 404
  if (!umkm) {
    notFound();
  }

  // Buat URL Google Maps untuk rute
  // Format ini akan membuka Google Maps dan meminta rute
  // dari lokasi pengguna (atau meminta input) ke tujuan.
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${umkm.latitude},${umkm.longitude}`;

  return (
    <main className="container mx-auto p-4">
      {/* Bagian Galeri Foto dengan Carousel */}
      <div className="w-full mb-6">
        <Carousel className="w-full rounded-lg overflow-hidden relative">
          <CarouselContent>
            {/* Cek jika ada foto, jika tidak tampilkan placeholder */}
            {umkm.photos && umkm.photos.length > 0 ? (
              umkm.photos.map((photoUrl: string, index: number) => (
                <CarouselItem key={index}>
                  <div className="w-full h-64 md:h-96 relative">
                    <Image
                      src={photoUrl}
                      alt={`${umkm.name} - Foto galeri ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </CarouselItem>
              ))
            ) : (
              // Fallback jika tidak ada foto
              <CarouselItem>
                <div className="w-full h-64 md:h-96 relative bg-secondary">
                  <Image
                    src={"/images/placeholder-umkm.jpg"} // Sediakan placeholder
                    alt="Placeholder"
                    fill
                    className="object-cover"
                  />
                </div>
              </CarouselItem>
            )}
          </CarouselContent>
          {/* Tombol Navigasi Carousel */}
          <CarouselPrevious
            className="absolute left-4"
            aria-label="Geser ke foto sebelumnya" // <-- TAMBAHKAN INI
          />
          <CarouselNext
            className="absolute right-4"
            aria-label="Geser ke foto selanjutnya" // <-- TAMBAHKAN INI
          />

          {/* Badge Promo tetap di sini */}
          {umkm.hasPromo && (
            <Badge className="absolute top-4 left-4 z-10 text-base">
              PROMO
            </Badge>
          )}
        </Carousel>
      </div>

      {/* Bagian Informasi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Kolom Kiri: Info Utama */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <Badge variant="outline">{umkm.Category.name}</Badge>
              <h1 className="text-4xl font-bold mt-2">{umkm.name}</h1>
              <div className="flex items-center gap-2 text-yellow-500 mt-2">
                <Star className="h-5 w-5" />
                <span className="text-xl font-bold text-black dark:text-white">
                  {umkm.rating ? Number(umkm.rating).toFixed(1) : "4.0"}
                </span>
              </div>
            </div>
            {/* 2. GABUNGKAN TOMBOL SHARE & FAVORITE */}
            <div className="flex items-center gap-2">
              <ClientHydrator>
                {" "}
                {/* 3. BUNGKUS DENGAN HYDRATOR */}
                <FavoriteToggleButton umkmId={umkm.id} umkmName={umkm.name} />
              </ClientHydrator>

              {/* PASTIKAN BARIS INI ADA: */}
              <ShareButton
                title={umkm.name}
                text={`Cek ${umkm.name}, UMKM keren di LokalKeren!`}
              />
            </div>
          </div>
          <p className="text-lg text-muted-foreground">{umkm.description}</p>

          {/* 6. TAMBAHKAN BLOK ULASAN DI SINI */}
          <Separator className="my-8" />
          <h3 className="text-2xl font-semibold mb-4">
            Ulasan Pengguna ({umkm.Review?.length || 0})
          </h3>
          <div className="space-y-8">
            {umkm.Review && umkm.Review.length > 0 ? (
              umkm.Review.map((review: any) => (
                <div key={review.id} className="flex gap-4">
                  <Avatar>
                    {/* Ambil 2 huruf depan untuk inisial */}
                    <AvatarFallback>
                      {review.author.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">{review.author}</p>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                    {/* Tampilkan Rating Bintang */}
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-400 dark:text-gray-500" // <-- UBAH INI
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground mt-2">
                      {review.comment}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">
                Jadilah yang pertama memberi ulasan untuk UMKM ini!
              </p>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Info Kontak & Peta */}
        <div className="space-y-4 rounded-lg border p-4 h-fit">
          <h3 className="text-xl font-semibold">Lokasi & Info</h3>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 mt-1 text-muted-foreground" />
            <span>{umkm.address}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span>{umkm.openingHours || "Jam buka tidak tersedia"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <span>{umkm.phone || "Telepon tidak tersedia"}</span>
          </div>

          {/* Peta Interaktif dengan Dynamic Loading */}
          {/* PENTING: Hanya render peta jika ada data latitude & longitude.
            Jangan lupa isi data lat/long di database (pgAdmin) saat kamu riset!
          */}
          {umkm.latitude && umkm.longitude ? (
            <MapWrapper
              latitude={umkm.latitude}
              longitude={umkm.longitude}
              popupText={umkm.name}
            />
          ) : (
            // Fallback jika data lat/long tidak ada
            <div className="w-full h-64 bg-gray-200 rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">(Peta tidak tersedia)</p>
            </div>
          )}

          {/* Tambahkan Tombol Rute */}
          {/* Kita pakai `asChild` agar Button di-render sebagai Link */}
          {umkm.latitude && umkm.longitude && (
            <Button asChild className="w-full">
              <Link
                href={googleMapsUrl}
                target="_blank" // Buka di tab baru (wajib untuk link eksternal)
                rel="noopener noreferrer"
              >
                <Navigation className="mr-2 h-4 w-4" />
                Dapatkan Rute
              </Link>
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
