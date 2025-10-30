// src/app/page.tsx
import { getCategories, getUmkms } from "@/lib/actions";
import AutocompleteSearch from "./_components/autocomplete-search";
import CategoryFilter from "./_components/category-filter";
import UmkmCard from "@/components/umkm-card";
import { Suspense } from "react";
import UmkmGridSkeleton from "./loading";
import AnimatedGrid from "@/components/animated-grid";
import AnimatedGridItem from "@/components/animated-grid-item";
import AiRecommendationCarousel from "./_components/ai-recommendation-carousel";
import ClientHydrator from "@/components/client-hydrator";
import FeatureButtons from "./_components/feature-buttons";

// Ini adalah tipe untuk searchParams
type HomePageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    lat?: string; // <-- TAMBAH INI
    long?: string; // <-- TAMBAH INI
    openNow?: string; // <-- TAMBAH PARAMETER OPEN NOW
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { search, category, lat, long, openNow } = await searchParams; // <-- AMBIL lat, long, dan openNow

  // 1. Ambil data kategori (untuk tombol filter)
  const categories = await getCategories();

  return (
    // Kita bungkus dengan 'relative' agar dropdown tidak terpotong
    <main className="container mx-auto p-4 relative">
      <h1 className="text-3xl font-bold mb-4">Direktori UMKM Lokal</h1>
      <p className="text-muted-foreground mb-6">
        Temukan dan dukung bisnis lokal di sekitarmu!
      </p>
      <ClientHydrator>
        <AiRecommendationCarousel />
      </ClientHydrator>

      {/* Fitur Buttons dengan Logo */}
      <ClientHydrator>
        <FeatureButtons />
      </ClientHydrator>

      {/* Area Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <AutocompleteSearch />
      </div>
      
      {/* Category Filter dengan Logo */}
      <div className="mb-8">
        <CategoryFilter categories={categories} />
      </div>

      {/* Area Grid UMKM */}
      {/* Tampilkan judul dinamis */}
      <h2 className="text-2xl font-semibold mb-4">
        {lat ? "UMKM Terdekat Darimu" : "Hasil Pencarian"}
      </h2>

      {/* Suspense: Tampilkan Skeleton saat data UMKM dimuat */}
      <Suspense
        fallback={<UmkmGridSkeleton />}
        key={`${search}-${category}-${lat}-${long}-${openNow}`}
      >
        {/* Komponen ini akan mengambil data UMKM berdasarkan filter */}
        <UmkmList
          search={search}
          category={category}
          lat={lat} // <-- OPER lat
          long={long} // <-- OPER long
          openNow={openNow} // <-- OPER openNow
        />
      </Suspense>
    </main>
  );
}

// 3. MODIFIKASI FUNGSI UmkmList
async function UmkmList({
  search,
  category,
  lat,
  long,
  openNow,
}: {
  search?: string;
  category?: string;
  lat?: string;
  long?: string;
  openNow?: string;
}) {
  const umkms = await getUmkms({ search, category, lat, long, openNow });

  if (umkms.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-10">
        Yah, UMKM tidak ditemukan... Coba ganti filter atau lokasimu.
      </p>
    );
  }

  return (
    // 4. BUNGKUS DIV DENGAN AnimatedGrid
    <AnimatedGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {umkms.map((umkm: any) => (
        // 5. BUNGKUS UmkmCard DENGAN AnimatedGridItem
        <AnimatedGridItem key={umkm.id}>
          <UmkmCard umkm={umkm} />
        </AnimatedGridItem>
      ))}
    </AnimatedGrid>
  );
}
