// src/app/dashboard/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/authOptions";
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';



// Impor komponen tab baru kita
import DashboardTabs from './dashboard-tabs';

export default async function DashboardPage() {
  // --- 1. LINDUNGI HALAMAN INI ---
  const session = await getServerSession(authOptions);
  
  // Cek apakah user sudah login
  if (!session?.user) {
    redirect('/login?redirect=/dashboard');
  }

  // Import prisma untuk cek role dari database
  const { db } = await import('@/lib/prisma');
  
  // Cek role dari database untuk data terbaru (penting untuk user yang baru upgrade)
  const userFromDb = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  // Cek role user (prioritas dari database karena lebih up-to-date)
  const userRole = userFromDb?.role || session.user.role;
  const isPengusaha = userRole === 'PENGUSAHA';
  
  // Jika user bukan PENGUSAHA, tampilkan halaman upgrade
  if (!isPengusaha) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto p-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Selamat Datang di Dashboard!</h1>
            <p className="text-muted-foreground">Untuk mengakses fitur dashboard penuh, mari upgrade akun Anda menjadi Pengusaha UMKM.</p>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Keuntungan Menjadi Pengusaha UMKM:</h2>
            <ul className="text-sm text-muted-foreground space-y-1 text-left">
              <li>• Daftarkan dan kelola toko Anda</li>
              <li>• Pantau penjualan dan analytics</li>
              <li>• Kelola produk dan inventori</li>
              <li>• Terima dan balas review pelanggan</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/dashboard/umkm/baru">Upgrade ke Pengusaha & Daftar UMKM</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">Kembali ke Beranda</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8 border-b border-border pb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard UMKM</h1>
              <p className="text-muted-foreground mt-2">Kelola dan pantau performa bisnis Anda</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/?bypass=true">Lihat Semua UMKM</Link>
              </Button>
            </div>
          </div>
        </div>
        
        <DashboardTabs />
      </div>
    </div>
  );
}
