// src/app/_components/ai-recommendation-carousel.tsx
"use client";

import { useState, useEffect } from "react";
import { useFavoritesStore } from "@/store/favorites-store";
import {
  getAllUmkmsForAI,
  getFavoriteUmkmsDetails,
  getUmkms,
} from "@/lib/actions"; // Kita pakai ulang `getUmkms`
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import UmkmCard from "@/components/umkm-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

// Tipe data dari Server Action
type BasicUmkm = { slug: string; name: string };
// Tipe data dari API AI kita
type AiRecommendation = { slug: string; reason: string };

export default function AiRecommendationCarousel() {
  const favoriteIds = useFavoritesStore((s) => s.favoriteIds);
  const [recommendations, setRecommendations] = useState<AiRecommendation[]>(
    []
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Jangan jalankan jika pengguna belum punya favorit
    if (favoriteIds.length === 0) {
      setIsLoading(false);
      return;
    }

    const fetchRecommendations = async () => {
      setIsLoading(true);

      // 1. Ambil data favorit & semua UMKM
      const [favDetails, allUmkms] = await Promise.all([
        getFavoriteUmkmsDetails(favoriteIds),
        getAllUmkmsForAI(),
      ]);

      const favoriteNames = favDetails.map((u) => u.name);

      // 2. Panggil API AI kita
      try {
        const response = await fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ favoriteNames, allUmkms }),
        });

        if (!response.ok) {
          console.warn("AI recommendation API failed, using fallback");
          // Fallback: ambil UMKM random sebagai rekomendasi
          const randomUmkms = await getUmkms({});
          const fallbackRecommendations = randomUmkms.slice(0, 3);
          const fallbackReasons: Record<string, string> = {};
          fallbackRecommendations.forEach((umkm: any) => {
            fallbackReasons[umkm.slug] = "Rekomendasi populer";
          });

          setRecommendations(fallbackRecommendations);
          setReasons(fallbackReasons);
          setIsLoading(false);
          return;
        }

        const aiData: AiRecommendation[] = await response.json();

        // 3. Ambil data UMKM lengkap berdasarkan slug dari AI
        const slugs = aiData.map((r) => r.slug);

        // Gunakan query database langsung untuk mendapatkan UMKM berdasarkan slug
        const umkmPromises = slugs.map((slug) =>
          fetch(`/api/umkm/${slug}`).then((res) => (res.ok ? res.json() : null))
        );
        const umkmResults = await Promise.all(umkmPromises);
        const validUmkms = umkmResults.filter(Boolean);

        // Fallback jika tidak ada UMKM yang ditemukan
        if (validUmkms.length === 0) {
          const randomUmkms = await getUmkms({});
          const fallbackRecommendations = randomUmkms.slice(0, 3);
          const fallbackReasons: Record<string, string> = {};
          fallbackRecommendations.forEach((umkm: any) => {
            fallbackReasons[umkm.slug] = "Rekomendasi populer";
          });

          setRecommendations(fallbackRecommendations);
          setReasons(fallbackReasons);
        } else {
          // 4. Simpan alasan dari AI
          const reasonMap: Record<string, string> = {};
          aiData.forEach((r) => {
            reasonMap[r.slug] = r.reason;
          });

          setRecommendations(validUmkms);
          setReasons(reasonMap);
        }
      } catch (error) {
        console.error("Gagal mendapatkan rekomendasi AI:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [favoriteIds]); // <-- Jalankan ulang jika favorit berubah

  // Tampilkan Skeleton saat loading
  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Rekomendasi AI Untukmu
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  // Jangan tampilkan apa-apa jika tidak ada favorit
  if (recommendations.length === 0) {
    return null;
  }

  // Tampilkan Carousel Hasil AI
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-primary" />
        Rekomendasi AI Untukmu
      </h2>
      <Carousel opts={{ align: "start", loop: true }} className="w-full">
        <CarouselContent>
          {recommendations.map((umkm) => (
            <CarouselItem key={umkm.slug} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                {/* @ts-expect-error - Type mismatch with UmkmCard props */}
                <UmkmCard umkm={umkm} />
                {/* Tampilkan Alasan dari AI */}
                <p className="text-sm text-muted-foreground mt-2 text-center italic">
                  &ldquo;...&rdquo;
                </p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
