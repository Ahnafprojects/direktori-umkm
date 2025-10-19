// src/components/share-button.tsx
'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Share2, Check } from 'lucide-react'; // Import ikon Check

type Props = {
  title: string;
  text: string;
};

export default function ShareButton({ title, text }: Props) {
  const pathname = usePathname();
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    // Dapatkan URL lengkap saat ini
    const url = window.location.origin + pathname;

    // 1. Coba gunakan Web Share API (umum di HP)
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: url,
        });
        return; // Selesai jika berhasil
      } catch (error) {
        console.warn('Gagal menggunakan Web Share API:', error);
      }
    }

    // 2. Fallback: Salin ke Clipboard (umum di Desktop)
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      // Reset ikon setelah 2 detik
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Gagal menyalin ke clipboard:', error);
    }
  };

  return (
    <Button variant="outline" onClick={handleShare}>
      {isCopied ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Link Disalin!
        </>
      ) : (
        <>
          <Share2 className="mr-2 h-4 w-4" />
          Bagikan
        </>
      )}
    </Button>
  );
}