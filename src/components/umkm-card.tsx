// src/components/umkm-card.tsx
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import FavoriteToggleButton from "./favorite-toggle-button";
import ClientHydrator from "./client-hydrator";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Prisma } from "@prisma/client";

type ProductData = {
  id: number;
  name: string;
  isFeatured?: boolean | null;
  photo?: string | null;
};

type ProductCategoryData = {
  id: number;
  products: ProductData[];
};

type UmkmWithDetails = Prisma.UmkmGetPayload<{
  include: {
    Category: true;
    productCategories: {
      include: {
        products: {
          // Untuk mendapatkan produk di dalamnya
          // Optional: Hanya ambil yang featured untuk efisiensi
          where: { isFeatured: true };
          take: 5; // Ambil beberapa saja
        };
      };
    };
  };
}>;

type UmkmCardProps = {
  umkm: UmkmWithDetails;
};

export default function UmkmCard({ umkm }: UmkmCardProps) {
  // Support both shapes: API may return ProductCategory (capitalized) or productCategories
  const rawProductCats =
    (umkm as any).productCategories ?? (umkm as any).ProductCategory;
  const productCats = rawProductCats as ProductCategoryData[] | undefined;
  const allProducts =
    productCats?.flatMap((cat: any) => {
      // Support both Product (capitalized) and products (lowercase)
      const products = cat.products ?? cat.Product ?? [];
      return Array.isArray(products) ? products : [];
    }) ?? [];

  const displayPhoto =
    allProducts.find((p: ProductData) => p.isFeatured && p.photo)?.photo ||
    umkm.photos?.[0] ||
    "/images/placeholder-umkm.jpg";

  // --- LOGIKA UNTUK FEATURED PRODUCTS ---
  const featuredList = allProducts
    .filter((p: ProductData) => !!p.isFeatured)
    .map((p: ProductData) => p.name);

  // If there are no explicitly featured items, fall back to first products
  const candidateList =
    featuredList.length > 0
      ? featuredList
      : allProducts.map((p: ProductData) => p.name);

  const featuredProducts = candidateList.slice(0, 3).join(", ");
  const hasMoreFeatured = candidateList.length > 3;

  const rating = umkm.rating ? Number(umkm.rating) : 0;
  const umkmIdAsNumber =
    typeof umkm.id === "string" ? parseInt(umkm.id, 10) : umkm.id;

  return (
    <Link href={`/umkm/${umkm.slug}`} className="group block h-full">
      <div className="flex lg:block bg-card rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 relative border border-border h-full">
        {/* Bagian Gambar */}
        <div className="relative w-2/5 sm:w-1/3 lg:w-full h-auto min-h-[140px] sm:min-h-[160px] lg:h-48 flex-shrink-0">
          <Image
            src={displayPhoto}
            alt={`Foto ${umkm.name}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 40vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Tombol Favorit - Desktop (di kanan atas gambar) */}
          <div className="absolute top-2 right-2 z-10 hidden lg:block">
            <ClientHydrator>
              <FavoriteToggleButton
                umkmId={umkmIdAsNumber}
                umkmName={umkm.name}
              />
            </ClientHydrator>
          </div>
        </div>

        {/* Bagian Konten Teks */}
        <div className="p-2.5 sm:p-3 lg:p-4 flex flex-col justify-between lg:justify-start w-3/5 sm:w-2/3 lg:w-full relative">
          {/* Tombol Favorit - Mobile/Tablet (di pojok kanan atas konten) */}
          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 lg:hidden">
            <ClientHydrator>
              <FavoriteToggleButton
                umkmId={umkmIdAsNumber}
                umkmName={umkm.name}
              />
            </ClientHydrator>
          </div>

          <div>
            {/* Nama & Kategori */}
            <div className="mb-1 pr-7 sm:pr-8 lg:pr-0">
              {/* Kategori hanya tampil di desktop */}
              <Badge
                variant="secondary"
                className="mb-1 text-[10px] sm:text-xs hidden lg:inline-block"
              >
                {umkm.Category.name}
              </Badge>
              <h3 className="font-semibold text-xs sm:text-sm md:text-base lg:text-lg line-clamp-2 lg:line-clamp-2 text-card-foreground group-hover:text-primary transition-colors leading-tight">
                {umkm.name}
              </h3>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-0.5 sm:gap-1 mb-1.5 sm:mb-2 text-[11px] sm:text-xs lg:text-sm">
              <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 text-yellow-400 fill-current flex-shrink-0" />
              <span className="font-medium text-card-foreground">
                {rating.toFixed(1)}
              </span>
            </div>

            {/* Alamat */}
            <div className="flex items-start gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
              <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground text-[10px] sm:text-xs line-clamp-2 lg:line-clamp-2 leading-tight">
                {umkm.address}
              </p>
            </div>

            {/* Menu Unggulan - Selalu tampil di semua device */}
            {featuredProducts && featuredProducts.length > 0 && (
              <>
                {/* Separator hanya tampil di desktop */}
                <Separator className="my-2 hidden lg:block" />
                <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1 mt-1 lg:mt-0 leading-tight">
                  <span className="font-medium">
                    {umkm.Category.name.toLowerCase().includes("makanan") ||
                    umkm.Category.name.toLowerCase().includes("minuman")
                      ? "Menu:"
                      : "Produk:"}
                  </span>{" "}
                  {featuredProducts}
                  {hasMoreFeatured && (
                    <span className="text-muted-foreground ml-1">
                      …selengkapnya
                    </span>
                  )}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
