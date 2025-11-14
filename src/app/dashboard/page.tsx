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

  // Cek apakah user adalah UMKM owner
  if (session.user.role !== 'PENGUSAHA') {
    redirect('/'); // Redirect ke home jika bukan owner
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
