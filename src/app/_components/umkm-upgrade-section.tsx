"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Check, Star, TrendingUp, Users } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UmkmUpgradeSection() {
  const { data: session, update } = useSession();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const router = useRouter();

  // If user is already PENGUSAHA, show different content
  if (session?.user?.role === "PENGUSAHA") {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-primary">Akun Pengusaha UMKM</CardTitle>
          </div>
          <CardDescription>
            Anda sudah memiliki akun pengusaha dan dapat mengelola UMKM Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-4 w-4 text-primary" />
                <span className="font-medium text-primary">Akun Aktif</span>
              </div>
              <p className="text-sm text-foreground/80">
                Selamat! Anda dapat mengelola UMKM, melihat analytics, dan
                menerima pesanan.
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
    toast.success("Mari daftarkan UMKM Anda!");
    router.push("/dashboard/umkm/baru");
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <CardTitle className="text-foreground">Daftarkan UMKM Anda</CardTitle>
        </div>
        <CardDescription>
          Upgrade akun Anda menjadi Pengusaha UMKM dan mulai berjualan secara
          online
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Benefits Section */}
          <div className="grid gap-4">
            <h4 className="font-medium text-foreground">
              Keuntungan menjadi Pengusaha UMKM:
            </h4>

            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h5 className="font-medium text-foreground">
                    Toko Online Gratis
                  </h5>
                  <p className="text-sm text-muted-foreground">
                    Buat profil UMKM dengan foto produk dan informasi lengkap
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 border border-accent">
                <div className="p-2 rounded-lg bg-accent">
                  <TrendingUp className="h-4 w-4 text-accent-foreground" />
                </div>
                <div>
                  <h5 className="font-medium text-foreground">
                    Analytics Real-time
                  </h5>
                  <p className="text-sm text-muted-foreground">
                    Pantau performa penjualan dan pelanggan
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h5 className="font-medium text-foreground">
                    Kelola Pesanan
                  </h5>
                  <p className="text-sm text-muted-foreground">
                    Terima dan kelola pesanan dari pelanggan
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Upgrade Button */}
          <div className="border-t border-border pt-4">
            <Button
              onClick={handleUpgrade}
              className="w-full font-medium py-2.5"
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
