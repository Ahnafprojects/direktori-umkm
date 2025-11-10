// src/app/dashboard/analytics-tab.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'; // <-- Import Recharts
import { DollarSign, Package, Star, Loader2 } from 'lucide-react';

// Tipe data yang kita harapkan dari API
type SalesData = {
  name: string;
  Pendapatan: number;
};

type TopProduct = {
  name: string;
  sold: number;
};

type KpiData = {
  totalRevenue: number;
  totalOrders: number;
  averageRating: number;
};

type AnalyticsData = {
  kpi: KpiData;
  topProducts: TopProduct[];
  salesData: SalesData[];
};

// Helper format Rupiah (kamu bisa pindahkan ini ke lib/utils.ts)
const formatRupiah = (number: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};

export default function AnalyticsTab() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ambil data dari API kita saat komponen dimuat
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/dashboard/analytics');
        if (!response.ok) {
          throw new Error('Gagal mengambil data analytics');
        }
        const analyticsData: AnalyticsData = await response.json();
        setData(analyticsData);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Memuat Laporan Bisnis...</p>
      </div>
    );
  }

  if (error || !data) {
    return <p>Gagal memuat data analytics. Coba lagi nanti.</p>;
  }

  return (
    <div className="space-y-6">
      {/* --- 1. Kartu KPI --- */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pendapatan (30 Hari)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatRupiah(data.kpi.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              dari {data.kpi.totalOrders} pesanan selesai
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pesanan Selesai (30 Hari)
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{data.kpi.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Status: DELIVERED
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating Rata-rata</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.kpi.averageRating.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Dari semua ulasan
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* --- 2. Grafik Penjualan --- */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Pendapatan per Hari (7 Hari Terakhir)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis
                  fontSize={12}
                  tickFormatter={(value) =>
                    `Rp${new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(value)}`
                  }
                />
                <Tooltip
                  formatter={(value: number) => [
                    formatRupiah(value),
                    'Pendapatan',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="Pendapatan"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* --- 3. Menu Terlaris --- */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Menu Terlaris (30 Hari)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topProducts.map((product, index) => (
                <div key={index} className="flex justify-between">
                  <span className="font-medium truncate pr-2">
                    {index + 1}. {product.name}
                  </span>
                  <span className="text-muted-foreground font-bold">
                    {product.sold}x
                  </span>
                </div>
              ))}
              {data.topProducts.length === 0 && (
                <p className="text-muted-foreground">Belum ada data penjualan.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}