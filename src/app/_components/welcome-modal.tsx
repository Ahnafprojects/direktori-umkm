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
import { useSession } from 'next-auth/react';

// Ini adalah "kunci" di memori browser untuk welcome UMKM
const LOCAL_STORAGE_KEY = 'hasSeenUmkmWelcome';
const LOCAL_STORAGE_DATE_KEY = 'lastUmkmWelcomeDate';

// Function to check if should show based on time elapsed
const shouldShowBasedOnTime = (): boolean => {
  const lastShownDate = localStorage.getItem(LOCAL_STORAGE_DATE_KEY);
  if (!lastShownDate) return true;
  
  const lastDate = new Date(lastShownDate);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Show again after 30 days
  return daysDiff > 30;
};

export default function WelcomeModal() {
  // 1. State untuk mengontrol modal
  const [isOpen, setIsOpen] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const { data: session, status } = useSession();

  // 2. Efek ini berjalan untuk user yang baru login/register dengan delay
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) return;

    // Check conditions
    const urlParams = new URLSearchParams(window.location.search);
    const justRegistered = urlParams.get('registered') === 'true';
    const hasSeenUmkmWelcome = localStorage.getItem(LOCAL_STORAGE_KEY);
    const shouldShowBasedOnTimePassed = shouldShowBasedOnTime();
    
    // Only show for PELANGGAN role, not PENGUSAHA
    const isPelanggan = session.user.role === 'PELANGGAN';
    const shouldShowModal = isPelanggan && (justRegistered || (!hasSeenUmkmWelcome || shouldShowBasedOnTimePassed));
    
    if (shouldShowModal) {
      setShouldShow(true);
      
      // Add delay so user can see the homepage first
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000); // 3 second delay to let page load and user see content

      return () => clearTimeout(timer);
    }
  }, [session, status]);

  // 3. Fungsi untuk menutup modal
  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
    localStorage.setItem(LOCAL_STORAGE_DATE_KEY, new Date().toISOString());
    
    // Clean up URL if needed
    const url = new URL(window.location.href);
    url.searchParams.delete('registered');
    window.history.replaceState({}, document.title, url.toString());
  };

  const handleStartSelling = () => {
    handleClose();
    // Will be redirected by the Link component
  };

  if (status === 'loading' || !session || !shouldShow) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg border shadow-lg bg-white rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-center">Selamat Datang di LokalKeren!</DialogTitle>
          <DialogDescription className="text-center">
            Halo <span className="font-semibold">{session.user.name}</span>! 
            Terima kasih sudah bergabung dengan komunitas lokal kami.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Punya UMKM?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Mulai berjualan dan jangkau lebih banyak pelanggan dengan mendaftarkan UMKM Anda di platform kami!
            </p>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Gratis mendaftarkan toko</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Kelola pesanan dengan mudah</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Analytics penjualan real-time</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button 
            asChild 
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            onClick={handleStartSelling}
          >
            <Link href="/profil?section=umkm">
              Daftarkan UMKM Saya
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full" 
            onClick={handleClose}
          >
            Nanti Saja
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}