// src/app/_components/welcome-modal.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, ShoppingCart, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Building2, ScrollText } from 'lucide-react';

// Ini adalah "kunci" di memori browser
const LOCAL_STORAGE_KEY = 'hasVisitedLokalKeren';

export default function WelcomeModal() {
  // 1. State untuk mengontrol modal
  const [isOpen, setIsOpen] = useState(false);

  // 2. Efek ini berjalan SAAT PERTAMA KALI komponen dimuat di client
  useEffect(() => {
    // Cek apakah "kunci" sudah ada di memori browser
    const hasVisited = localStorage.getItem(LOCAL_STORAGE_KEY);

    // Jika BELUM PERNAH berkunjung
    if (!hasVisited) {
      // Tampilkan pop-up
      setIsOpen(true);
      // Tandai bahwa dia sudah berkunjung (agar tidak muncul lagi)
      localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
    }
  }, []); // Array kosong berarti "hanya jalankan sekali"

  // 3. Fungsi untuk menutup modal
  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg border shadow-lg bg-white rounded-lg">
        <DialogHeader>
          <div className="flex items-center justify-center gap-3 mb-4">
             
             
          <Building2 className="h-8 w-8 text-primary" />
          <span className='text-2xl  font-semibold'>LokalKeren</span>

          </div>
          <DialogTitle className=" text-center text-gray-900">
            Selamat Datang! 👋
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 leading-relaxed">
            Platform untuk menemukan dan mendukung UMKM lokal di sekitar Anda. 
            Jelajahi, favoritkan, dan pesan dari bisnis-bisnis lokal terpercaya.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <div className="p-2 rounded-lg bg-gray-200">
              <Search className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Pencarian Mudah</h3>
              <p className="text-sm text-gray-600">Temukan UMKM berdasarkan lokasi dan kategori</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <div className="p-2 rounded-lg bg-gray-200">
              <MapPin className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Peta Interaktif</h3>
              <p className="text-sm text-gray-600">Lihat lokasi UMKM di peta dengan mudah</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <div className="p-2 rounded-lg bg-gray-200">
              <ShoppingCart className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Belanja Online</h3>
              <p className="text-sm text-gray-600">Pesan produk langsung dari UMKM</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleClose} 
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 rounded-lg"
          >
            Mulai Jelajahi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}