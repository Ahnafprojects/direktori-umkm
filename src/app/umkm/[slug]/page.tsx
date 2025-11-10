// src/app/umkm/[slug]/page.tsx
import { getUmkmBySlug } from "@/lib/actions";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Phone, Star, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ShareButton from "@/components/share-button";
import FavoriteToggleButton from "@/components/favorite-toggle-button";
import ClientHydrator from "@/components/client-hydrator";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Prisma } from "@prisma/client";
import ProductCard from "@/components/product-card"; // Kita pakai ulang komponen ini
import MapWrapper from "@/components/map-wrapper"; // Gunakan MapWrapper yang sudah ada
import ReviewSummarizer from "@/app/_components/review-summarizer";
import AddReviewForm from "@/app/_components/add-review-form";
import OwnerReplyForm from "@/app/_components/owner-reply-form";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// Tipe data baru yang MENCERMINKAN DATABASE BARU KITA
type UmkmWithDetails = Prisma.UmkmGetPayload<{
  include: {
    Category: true;
    Review: {
      include: {
        user: {
          select: { 
            id: true;
            name: true;
          };
        };
        replier: {
          select: { 
            id: true;
            name: true;
          };
        };
      };
    };
    ProductCategory: {
      include: {
        Product: true;
      };
    };
  };
}>;

type DetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function UmkmDetailPage({ params }: DetailPageProps) {
  const { slug } = await params;
  
  console.log('Looking for UMKM with slug:', slug);
  const umkm: UmkmWithDetails | null = await getUmkmBySlug(slug);
  
  console.log('UMKM found:', umkm ? 'Yes' : 'No');
  
  if (!umkm) {
    console.log('UMKM not found, returning 404 for slug:', slug);
    notFound();
  }

  // --- DAPATKAN USER ID DARI SESSION ---
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id || null;
  // --------------------------------------

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${umkm.latitude},${umkm.longitude}`;

  // Cek apakah UMKM ini punya produk (bukan Jasa murni)
  const hasProducts = umkm.ProductCategory.length > 0;

  return (
    <main className="container mx-auto p-4 pb-24">
      {/* --- BAGIAN HEADER UMKM (INFO, FOTO, PETA) --- */}
      <div className="space-y-4">
        {/* Info Dasar */}
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
          <div className="flex-1">
            <Badge variant="outline">{umkm.Category.name}</Badge>
            <h1 className="text-2xl md:text-4xl font-bold mt-2">{umkm.name}</h1>
            <div className="flex items-center gap-2 text-yellow-500 mt-2">
              <Star className="h-5 w-5" />
              <span className="text-xl font-bold text-black dark:text-white">
                {umkm.rating ? Number(umkm.rating).toFixed(1) : "4.0"}
              </span>
              <span className="text-muted-foreground">
                ({umkm.Review.length} ulasan)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ClientHydrator>
              <FavoriteToggleButton umkmId={umkm.id} umkmName={umkm.name} />
            </ClientHydrator>
            <ClientHydrator>
              <ReviewSummarizer umkmName={umkm.name} reviews={umkm.Review} />
            </ClientHydrator>
            <ShareButton
              title={umkm.name}
              text={`Cek ${umkm.name}, UMKM keren di LokalKeren!`}
            />
          </div>
        </div>

        {/* Carousel Foto */}
        <Carousel className="w-full rounded-lg overflow-hidden relative">
          <CarouselContent>
            {umkm.photos && umkm.photos.length > 0 ? (
              umkm.photos.map((photoUrl, index) => (
                <CarouselItem key={index}>
                  <div className="w-full h-64 md:h-96 relative">
                    <Image
                      src={photoUrl}
                      alt={`${umkm.name} - Foto ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </CarouselItem>
              ))
            ) : (
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

        {/* Info Detail & Peta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-2xl font-semibold">Deskripsi</h3>
            <p className="text-lg text-muted-foreground">{umkm.description}</p>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span>{umkm.openingHours || "Jam buka tidak tersedia"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <span>{umkm.phone || "Telepon tidak tersedia"}</span>
            </div>
          </div>
          <div className="space-y-4 rounded-lg border p-4 h-fit">
            <h3 className="text-xl font-semibold">Lokasi</h3>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 mt-1 text-muted-foreground" />
              <span>{umkm.address}</span>
            </div>
            <div className="w-full h-64 rounded-md overflow-hidden">
              {umkm.latitude && umkm.longitude ? (
                <MapWrapper
                  latitude={umkm.latitude}
                  longitude={umkm.longitude}
                  popupText={umkm.name}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <p className="text-muted-foreground">(Peta tidak tersedia)</p>
                </div>
              )}
            </div>
            {umkm.latitude && umkm.longitude && (
              <Button asChild className="w-full">
                <Link
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  Dapatkan Rute
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      {/* --- BAGIAN DAFTAR PRODUK (ALUR GOFOOD) --- */}
      {hasProducts && (
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-center">Menu</h2>
          {/* Loop untuk Kategori Produk */}
          {umkm.ProductCategory.map((category: any) => (
            <section key={category.id}>
              <h3 className="text-2xl font-semibold mb-4">{category.name}</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Loop untuk Produk */}
                {category.Product.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <Separator className="my-8" />

      {/* --- BAGIAN ULASAN (TETAP SAMA) --- */}
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold mb-4">
          Ulasan Pengguna ({umkm.Review.length})
        </h3>
        <div className="space-y-8">
          {umkm.Review.length > 0 ? (
            umkm.Review.map((review: any) => (
              <div key={review.id} className="space-y-4">
                {/* Customer Review */}
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {review.user?.name
                        ? review.user.name.substring(0, 2).toUpperCase()
                        : "AN"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">
                        {review.user?.name || "Anonymous"}
                      </p>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-400 dark:text-gray-500"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground mt-2">{review.comment}</p>

                    {/* Owner Reply (jika ada) */}
                    {review.ownerReply && (
                      <div className="mt-4 ml-4 p-4 bg-muted/50 border-l-4 border-primary rounded-r-lg">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-semibold text-sm flex items-center gap-2">
                            <span className="text-primary">👨‍💼</span>
                            Balasan Pemilik UMKM
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {review.ownerReplyAt && new Date(review.ownerReplyAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.ownerReply}</p>
                      </div>
                    )}

                    {/* Owner Reply Form - hanya tampil untuk owner dan belum ada reply */}
                    <ClientHydrator>
                      {userId && userId === umkm.ownerId && !review.ownerReply && (
                        <OwnerReplyForm reviewId={review.id} />
                      )}
                    </ClientHydrator>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">
              Jadilah yang pertama memberi ulasan!
            </p>
          )}
        </div>

        {/* --- FORM TAMBAH ULASAN / ANALYTICS OWNER --- */}
        <ClientHydrator>
          {userId ? (
            // Cek apakah user yang login adalah pemilik UMKM
            userId === umkm.ownerId ? (
              // PEMILIK UMKM: Redirect ke Dashboard
              <div className="p-6 border rounded-lg bg-blue-50 border-blue-200 text-center">
                <h4 className="text-lg font-bold text-blue-800 mb-2">👨‍💼 Selamat Datang, Pemilik UMKM!</h4>
                <p className="text-sm text-blue-600 mb-4">
                  Kelola bisnis Anda di dashboard khusus owner
                </p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/dashboard">
                    � Buka Dashboard Analytics
                  </Link>
                </Button>
              </div>
            ) : (
              // CUSTOMER: Tampilkan form review normal
              <AddReviewForm umkmId={umkm.id} userId={userId} />
            )
          ) : (
            <div className="p-4 border rounded-lg text-center">
              <p className="text-muted-foreground mb-4">
                Silakan login untuk memberikan ulasan
              </p>
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            </div>
          )}
        </ClientHydrator>
        {/* ---------------------------------------------------------- */}
      </div>
    </main>
  );
}
