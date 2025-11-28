"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  ShoppingBag,
  Star,
  Search,
  Heart,
  X,
  MessageCircle,
  Info,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function GuestWelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has seen this modal before
    const hasSeenWelcome = localStorage.getItem("hasSeenGuestWelcome");

    if (!hasSeenWelcome) {
      // Show modal after a short delay to ensure page is loaded
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Mark that user has seen the welcome modal
    localStorage.setItem("hasSeenGuestWelcome", "true");
  };

  const handleStartExploring = () => {
    handleClose();
    // Scroll to UMKM directory section
    const directorySection = document.getElementById("umkm-directory");
    if (directorySection) {
      directorySection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          localStorage.setItem("hasSeenGuestWelcome", "true");
        }
      }}
    >
      <DialogContent className="w-[95vw] max-w-[400px] sm:max-w-[420px] lg:max-w-[480px] mx-auto p-3 sm:p-6 lg:p-8 bg-background border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-2 sm:space-y-4">
          {/* Logo and Title */}
          <div className="flex justify-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-md">
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-primary-foreground" />
            </div>
          </div>

          <DialogTitle className="text-lg sm:text-2xl font-bold text-foreground leading-tight px-2">
            Selamat Datang di LokalKeren
          </DialogTitle>

          <DialogDescription className="text-muted-foreground text-xs sm:text-base leading-relaxed px-2">
            Platform direktori UMKM terpercaya untuk menemukan dan mendukung
            bisnis lokal di sekitar Anda
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-5 lg:space-y-4 mt-3 sm:mt-6">
          {/* Features Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-2">
            <div className="flex flex-col items-center p-2 sm:p-3 lg:p-2 rounded-lg bg-accent/30 text-center">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 lg:w-5 lg:h-5 text-primary mb-1" />
              <h4 className="font-semibold text-xs sm:text-sm lg:text-xs text-foreground leading-tight">
                Temukan UMKM
              </h4>
              <p className="text-[10px] sm:text-xs lg:text-[10px] text-muted-foreground leading-tight hidden sm:block lg:hidden">
                Cari berdasarkan lokasi
              </p>
            </div>

            <div className="flex flex-col items-center p-2 sm:p-3 lg:p-2 rounded-lg bg-accent/30 text-center">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 lg:w-5 lg:h-5 text-primary mb-1" />
              <h4 className="font-semibold text-xs sm:text-sm lg:text-xs text-foreground leading-tight">
                Belanja Langsung
              </h4>
              <p className="text-[10px] sm:text-xs lg:text-[10px] text-muted-foreground leading-tight hidden sm:block lg:hidden">
                Pesan produk favorit
              </p>
            </div>

            <div className="flex flex-col items-center p-2 sm:p-3 lg:p-2 rounded-lg bg-accent/30 text-center">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 lg:w-5 lg:h-5 text-primary mb-1" />
              <h4 className="font-semibold text-xs sm:text-sm lg:text-xs text-foreground leading-tight">
                Review & Rating
              </h4>
              <p className="text-[10px] sm:text-xs lg:text-[10px] text-muted-foreground leading-tight hidden sm:block lg:hidden">
                Baca ulasan pembeli
              </p>
            </div>

            <div className="flex flex-col items-center p-2 sm:p-3 lg:p-2 rounded-lg bg-accent/30 text-center">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 lg:w-5 lg:h-5 text-primary mb-1" />
              <h4 className="font-semibold text-xs sm:text-sm lg:text-xs text-foreground leading-tight">
                Simpan Favorit
              </h4>
              <p className="text-[10px] sm:text-xs lg:text-[10px] text-muted-foreground leading-tight hidden sm:block lg:hidden">
                Koleksi UMKM suka
              </p>
            </div>

            <div className="flex flex-col items-center p-2 sm:p-3 lg:p-2 rounded-lg bg-accent/30 text-center">
              <Info className="w-5 h-5 sm:w-6 sm:h-6 lg:w-5 lg:h-5 text-primary mb-1" />
              <h4 className="font-semibold text-xs sm:text-sm lg:text-xs text-foreground leading-tight">
                Tentang Kami
              </h4>
              <p className="text-[10px] sm:text-xs lg:text-[10px] text-muted-foreground leading-tight hidden sm:block lg:hidden">
                Kenali lebih dekat
              </p>
            </div>

            <div className="flex flex-col items-center p-2 sm:p-3 lg:p-2 rounded-lg bg-accent/30 text-center">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 lg:w-5 lg:h-5 text-primary mb-1" />
              <h4 className="font-semibold text-xs sm:text-sm lg:text-xs text-foreground leading-tight">
                Blog UMKM
              </h4>
              <p className="text-[10px] sm:text-xs lg:text-[10px] text-muted-foreground leading-tight hidden sm:block lg:hidden">
                Tips & artikel
              </p>
            </div>
          </div>

          {/* AI Assistant Info - Highlight Feature */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-2.5 sm:p-3 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-primary rounded-lg">
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-xs sm:text-sm text-foreground mb-0.5 sm:mb-1">
                  AI Assistant Tersedia
                </h4>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Punya pertanyaan? Tanya langsung ke AI Assistant kami kapan
                  saja!
                </p>
              </div>
            </div>
          </div>

          {/* What's Available */}
          <div className="space-y-1.5 sm:space-y-2">
            <h4 className="font-semibold text-xs sm:text-sm text-foreground text-center">
              Kategori Tersedia & Bantuan AI
            </h4>
            <div className="flex flex-wrap gap-1 justify-center">
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-0 text-xs px-2 py-0.5"
              >
                Makanan
              </Badge>
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-0 text-xs px-2 py-0.5"
              >
                Fashion
              </Badge>
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-0 text-xs px-2 py-0.5"
              >
                Jasa
              </Badge>
              <Badge
                variant="secondary"
                className="bg-primary/20 text-primary border-0 text-xs px-2 py-0.5 font-semibold"
              >
                🤖 AI Assistant
              </Badge>
            </div>
          </div>

          {/* CTA Section */}
          <div className="space-y-2 sm:space-y-3 pt-0.5 sm:pt-1">
            <Button
              onClick={handleStartExploring}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg shadow-md transition-all duration-200"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
              Mulai Jelajahi UMKM
            </Button>

            <div className="text-center pb-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground"
              >
                Punya UMKM? Daftar di sini
              </Button>
            </div>
          </div>

          {/* Bottom Note */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
