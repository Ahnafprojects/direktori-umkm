// src/app/status/[orderId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Loader2, Send, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

// 1. Dynamic import untuk Peta Live
const LiveMap = dynamic(() => import('@/components/live-tracking-map'), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full" />,
});

// 2. Data Status (Simulasi) - timing yang lebih realistis
const statusSteps = [
  { text: "Pesanan Diterima...", delay: 2000 },
  { text: "Mencari Driver...", delay: 5000 },
  { text: "Driver Ditemukan!", delay: 8000 },
  { text: "Driver Menuju Resto...", delay: 15000 },
  { text: "Driver Mengambil Pesanan...", delay: 60000 }, // 1 menit
  { text: "Driver Mengantar Pesananmu!", delay: 80000 }, // 1 menit 20 detik
  { text: "Pesanan Tiba! Selamat Menikmati!", delay: 200000 }, // 3+ menit (sesuai progress driver)
];

export default function StatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 3. State untuk Simulasi
  const [statusIndex, setStatusIndex] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState("15-20 menit");

  // 4. Ambil koordinat dan deliveryOption dari URL
  const restoParam = (searchParams.get('resto') || '-7.2711,112.7442').split(',');
  const userParam = (searchParams.get('user') || '-7.2797,112.7903').split(',');
  const deliveryOption = searchParams.get('deliveryOption') || 'pickup'; // Default pickup jika tidak ada
  const restoCoords: [number, number] = [parseFloat(restoParam[0]), parseFloat(restoParam[1])];
  const userCoords: [number, number] = [parseFloat(userParam[0]), parseFloat(userParam[1])];

  // 5. Efek Simulasi Status
  useEffect(() => {
    // Hentikan jika sudah selesai
    if (statusIndex >= statusSteps.length - 1) {
      toast.success('Pesanan Selesai!', { duration: 4000 });
      setTimeout(() => router.push('/'), 4000); // Balik ke home
      return;
    }

    // Update estimated time based on status
    if (statusIndex === 2) setEstimatedTime("10-15 menit");
    if (statusIndex === 4) setEstimatedTime("5-8 menit");
    if (statusIndex === 5) setEstimatedTime("2-3 menit");

    const currentStep = statusSteps[statusIndex];
    const timer = setTimeout(() => {
      setStatusIndex(statusIndex + 1);
    }, currentStep.delay - (statusSteps[statusIndex-1]?.delay || 0)); // Hitung durasi antar step

    return () => clearTimeout(timer);
  }, [statusIndex, router]);

  return (
    <main className="container mx-auto p-4 max-w-2xl">
      {/* Map hanya ditampilkan jika deliveryOption adalah 'delivery' */}
      {deliveryOption === 'delivery' && (
        <div className="w-full h-80 md:h-96 rounded-md overflow-hidden border mb-6">
          <LiveMap restoCoords={restoCoords} userCoords={userCoords} />
        </div>
      )}

      <div className="my-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <h2 className="text-2xl font-bold mt-4">
          {deliveryOption === 'delivery' 
            ? statusSteps[statusIndex].text 
            : statusIndex < 3 
              ? "Pesanan Sedang Diproses..." 
              : "Pesanan Siap Diambil!"}
        </h2>
        <p className="text-muted-foreground">ID Pesanan: LOKAL-123</p>
        {deliveryOption === 'delivery' && (
          <p className="text-sm text-blue-600 mt-2">
            ⏱️ Estimasi Tiba: {estimatedTime}
          </p>
        )}
        {deliveryOption === 'pickup' && (
          <p className="text-sm text-green-600 mt-2">
            📍 Silakan ambil di toko saat pesanan sudah siap
          </p>
        )}
      </div>

      {/* Chat Driver hanya ditampilkan jika deliveryOption adalah 'delivery' */}
      {deliveryOption === 'delivery' && (
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full" variant="outline" size="lg">
              <MessageSquare className="mr-2 h-5 w-5" />
              Chat Driver (Simulasi)
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chat dengan Driver</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 p-4">
              {/* Chat palsu */}
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                  <p className="font-semibold">Driver (Budi)</p>
                  <p>Siap kak, OTW ke resto!</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[80%]">
                  <p className="font-semibold">Kamu</p>
                  <p>Oke, ditunggu ya!</p>
                </div>
              </div>
              {/* Input Chat Palsu */}
              <div className="flex gap-2">
                <Input placeholder="Ketik pesan..." disabled />
                <Button disabled><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}