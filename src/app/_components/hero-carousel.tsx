"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const slides = [
  {
    id: 1,
    image: "/img/belanjalokal.png",
    alt: "Belanja Lokal, Dukung UMKM Indonesia",
    link: "/login",
  },
  {
    id: 2,
    image: "/img/mulaijualan.png",
    alt: "Mulai Jualan di Platform Kami",
    link: "/tentang",
  },
];

function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide setiap 5 detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full h-[120px] sm:h-[200px] md:h-[240px] lg:h-[300px] rounded-lg overflow-hidden mb-6 sm:mb-8 group bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
      {/* Images */}
      {slides.map((slide, index) => (
        <Link
          key={slide.id}
          href={slide.link}
          className={`absolute inset-0 transition-opacity duration-700 cursor-pointer ${
            index === currentSlide
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            className="object-cover object-center"
            priority={index === 0}
            quality={100}
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
          />
        </Link>
      ))}

      {/* Navigation Buttons - tampil saat hover */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-1 sm:left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 sm:h-9 sm:w-9"
        onClick={prevSlide}
        aria-label="Slide sebelumnya"
      >
        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-1 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 sm:h-9 sm:w-9"
        onClick={nextSlide}
        aria-label="Slide selanjutnya"
      >
        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-1.5 sm:bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
              index === currentSlide
                ? "bg-white w-4 sm:w-6"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Ke slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroCarousel;
