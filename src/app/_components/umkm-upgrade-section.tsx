'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Check, Star, TrendingUp, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UmkmUpgradeSection() {
  const { data: session, update } = useSession();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const router = useRouter();

  // If user is already PENGUSAHA, show different content
  if (session?.user?.role === 'PENGUSAHA') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-600">Akun Pengusaha UMKM</CardTitle>
          </div>
          <CardDescription>
            Anda sudah memiliki akun pengusaha dan dapat mengelola UMKM Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">
                  Akun Aktif
                </span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-300">
                Selamat! Anda dapat mengelola UMKM, melihat analytics, dan menerima pesanan.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button asChild className="flex-1">
                <Link href="/dashboard">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Buka Dashboard
                </Link>
              </Button>

            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // For PELANGGAN users, redirect to UMKM registration form
  const handleUpgrade = () => {
    toast.success('Mari daftarkan UMKM Anda!');
    router.push('/dashboard/umkm/baru');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-orange-600" />
          <CardTitle>Daftarkan UMKM Anda</CardTitle>
        </div>
        <CardDescription>
          Upgrade akun Anda menjadi Pengusaha UMKM dan mulai berjualan secara online
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Benefits Section */}
          <div className="grid gap-4">
            <h4 className="font-medium text-foreground">Keuntungan menjadi Pengusaha UMKM:</h4>
            
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
                  <Building2 className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <h5 className="font-medium text-orange-800 dark:text-orange-200">Toko Online Gratis</h5>
                  <p className="text-sm text-orange-600 dark:text-orange-300">Buat profil UMKM dengan foto produk dan informasi lengkap</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h5 className="font-medium text-blue-800 dark:text-blue-200">Analytics Real-time</h5>
                  <p className="text-sm text-blue-600 dark:text-blue-300">Pantau performa penjualan dan pelanggan</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h5 className="font-medium text-green-800 dark:text-green-200">Kelola Pesanan</h5>
                  <p className="text-sm text-green-600 dark:text-green-300">Terima dan kelola pesanan dari pelanggan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upgrade Button */}
          <div className="border-t pt-4">
            <Button 
              onClick={handleUpgrade}
              className="w-full bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-2.5"
            >
              <Star className="h-4 w-4 mr-2" />
              Daftarkan UMKM Saya
            </Button>
            
            <p className="text-xs text-muted-foreground text-center mt-2">
              Gratis selamanya • Tidak ada biaya tersembunyi
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}