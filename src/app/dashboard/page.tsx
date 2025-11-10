// src/app/dashboard/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Impor shadcn Tabs
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Impor komponen tab baru kita
import AnalyticsTab from './analytics-tab';
import IncomingOrdersTab from './incoming-orders-tab';

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
        
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics">📊Analytics</TabsTrigger>
            <TabsTrigger value="orders">📦 Pesanan</TabsTrigger>
            <TabsTrigger value="products">🏢 Kelola UMKM</TabsTrigger>
          </TabsList>
          
          {/* --- Tab Analytics --- */}
          <TabsContent value="analytics" className="mt-6">
            <AnalyticsTab />
          </TabsContent>
          
          {/* --- Tab Pesanan Masuk --- */}
          <TabsContent value="orders" className="mt-6">
            <div className="bg-card rounded-lg border border-border shadow-sm">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-card-foreground">Pesanan Masuk</h3>
                <p className="text-sm text-muted-foreground mt-1">Kelola pesanan dari pelanggan UMKM Anda</p>
              </div>
              <div className="p-6">
                <IncomingOrdersTab />
              </div>
            </div>
          </TabsContent>
          
          {/* --- Tab Kelola UMKM --- */}
          <TabsContent value="products" className="mt-6">
            <div className="bg-card rounded-lg border border-border">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-card-foreground">🏢 Kelola UMKM</h3>
                <p className="text-sm text-muted-foreground mt-1">Kelola dan edit informasi UMKM Anda</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-card-foreground">🏪 Kelola UMKM</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button asChild className="w-full justify-start" variant="outline">
                      <Link href="/dashboard/umkm/saya">
                        ✏️ Edit UMKM Saya
                      </Link>
                    </Button>
                    <Button asChild className="w-full justify-start" variant="outline">
                      <Link href="/dashboard/umkm/baru">
                        ➕ Tambah UMKM Baru
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    💡 <strong>Tip:</strong> Maksimal 3 UMKM per akun. Kelola informasi bisnis dan produk dari satu tempat.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}