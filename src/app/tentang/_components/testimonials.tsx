"use client";

import { useState, useEffect } from "react";
import { Quote, ChevronLeft, ChevronRight, Star, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    id: 1,
    name: "Bu Siti Aminah",
    business: "Warung Nasi Bu Siti",
    category: "Makanan",
    rating: 5,
    text: "Sejak bergabung dengan LokalKeren, penjualan saya meningkat 3x lipat! Platform ini mudah digunakan dan banyak pelanggan baru yang menemukan warung saya melalui pencarian online.",
  },
  {
    id: 2,
    name: "Pak Budi Santoso",
    business: "Toko Batik Nusantara",
    category: "Fashion",
    rating: 5,
    text: "Fitur peta interaktif sangat membantu! Sekarang pelanggan dari luar kota bisa menemukan toko saya dengan mudah. Terima kasih LokalKeren!",
  },
  {
    id: 3,
    name: "Ibu Dewi Lestari",
    business: "Kue Rumahan Dewi",
    category: "Makanan",
    rating: 5,
    text: "Platform yang sangat membantu UMKM seperti saya. Dashboard owner jelas, sistem keranjang memudahkan pelanggan, dan fitur review membuat bisnis saya lebih terpercaya.",
  },
  {
    id: 4,
    name: "Pak Agus Wijaya",
    business: "Bengkel Motor Agus",
    category: "Jasa",
    rating: 5,
    text: "Saya tidak pernah menyangka teknologi bisa semudah ini! Pelanggan bisa langsung chat, lihat layanan, dan memberikan review. Mantap!",
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide setiap 6 detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const current = testimonials[currentIndex];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full mb-4">
            <Quote className="h-4 w-4 text-primary" />
            <span className="text-xs sm:text-sm font-medium text-primary">
              Testimonial
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
            Apa Kata Mereka?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Dengar cerita sukses dari pengusaha UMKM yang telah bergabung dengan
            platform kami
          </p>
        </div>

        {/* Testimonial Card */}
        <div className="max-w-4xl mx-auto relative">
          <Card className="overflow-hidden border-2 shadow-xl">
            <CardContent className="p-6 sm:p-8 lg:p-12">
              {/* Quote Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Quote className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
              </div>

              {/* Testimonial Content */}
              <div className="text-center space-y-4 sm:space-y-6">
                {/* Rating Stars */}
                <div className="flex justify-center gap-1">
                  {[...Array(current.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                {/* Text */}
                <blockquote className="text-base sm:text-lg lg:text-xl text-foreground/90 leading-relaxed italic min-h-[100px] sm:min-h-[120px] flex items-center justify-center">
                  "{current.text}"
                </blockquote>

                {/* Author Info */}
                <div className="flex flex-col items-center gap-3 pt-4 border-t">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20">
                    <User className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-base sm:text-lg">
                      {current.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {current.business}
                    </p>
                    <p className="text-xs text-primary font-medium mt-1">
                      {current.category}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 sm:-left-6 top-1/2 -translate-y-1/2 bg-background shadow-lg hover:bg-accent"
            onClick={prevTestimonial}
            aria-label="Testimonial sebelumnya"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 sm:-right-6 top-1/2 -translate-y-1/2 bg-background shadow-lg hover:bg-accent"
            onClick={nextTestimonial}
            aria-label="Testimonial selanjutnya"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-6 sm:mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-primary w-8"
                  : "bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Ke testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Counter */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          {currentIndex + 1} / {testimonials.length}
        </p>
      </div>
    </section>
  );
}
