// src/app/_components/ai-recommendation-carousel.tsx
"use client";

import { useState, useEffect } from "react";
import { getUmkms } from "@/lib/actions";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import UmkmCard from "@/components/umkm-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

export default function AiRecommendationCarousel() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    const fetchRecommendations = async () => {
      setIsLoading(true);

      try {
        // Ambil UMKM berdasarkan popularitas (paling banyak di-favorit)
        const response = await fetch("/api/recommendations/popular");

        if (!response.ok) {
          console.warn("Popular recommendations API failed, using fallback");
          // Fallback: ambil UMKM random sebagai rekomendasi
          const randomUmkms = await getUmkms({});
          setRecommendations(randomUmkms.slice(0, 6));
          setIsLoading(false);
          return;
        }

        const popularUmkms = await response.json();
        setRecommendations(popularUmkms);
      } catch (error) {
        console.error("Gagal mendapatkan rekomendasi populer:", error);
        // Fallback: ambil UMKM random
        const randomUmkms = await getUmkms({});
        setRecommendations(randomUmkms.slice(0, 6));
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []); // Hanya jalankan sekali saat component mount

  // Tampilkan Skeleton saat loading
  if (isLoading) {
    return (
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Rekomendasi Terpopuler
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  // Jangan tampilkan apa-apa jika tidak ada rekomendasi
  if (recommendations.length === 0) {
    return null;
  }

  // Tampilkan Carousel UMKM Terpopuler
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-primary" />
        Rekomendasi Terpopuler
      </h2>
      <p className="text-sm text-muted-foreground mb-3">
        UMKM favorit pilihan banyak orang
      </p>
      <Carousel 
        opts={{ 
          align: "start", 
          loop: true 
        }} 
        plugins={[
          Autoplay({
            delay: 3000,
            stopOnInteraction: false,
          })
        ]}
        className="w-full"
      >
        <CarouselContent>
          {recommendations.map((umkm, index) => (
            <CarouselItem key={umkm.slug || index} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <UmkmCard umkm={umkm} />
                {/* Tampilkan badge popularitas */}
                <p className="text-xs text-muted-foreground mt-2 text-center italic">
                  {umkm._count?.favorites || 0} orang menyukai ini
                </p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
