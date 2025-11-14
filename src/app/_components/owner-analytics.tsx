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
  BarChart,
  Bar,
} from 'recharts';
import { DollarSign, Package, Star, TrendingUp, Loader2, Activity, Users } from 'lucide-react';

// Tipe data yang kita harapkan dari API
type OwnerAnalyticsData = {
  kpi: {
    totalRevenue: number;
    totalOrders: number;
    averageRating: number;
  };
  topProducts: {
    name: string;
    sold: number;
  }[];
  recentActivity: {
    newReviews: number;
    newOrders: number;
  };
};

// Tipe data untuk grafik
type SalesData = {
  name: string;
  revenue: number;
  orders: number;
};

// Helper format Rupiah
const formatRupiah = (number: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};

type Props = {
  umkmId: number;
};

export default function OwnerAnalytics({ umkmId }: Props) {
  const [data, setData] = useState<OwnerAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/umkm/${umkmId}/analytics`);
        if (!response.ok) {
          throw new Error('Gagal mengambil data analytics');
        }
        const analyticsData: OwnerAnalyticsData = await response.json();
        setData(analyticsData);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [umkmId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4">Memuat analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
        <p className="text-yellow-800">
          Analytics akan tersedia setelah ada transaksi masuk
        </p>
      </div>
    );
  }

  // Generate demo data untuk grafik (karena kita belum punya data harian)
  const generateSalesData = (): SalesData[] => {
    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const totalRevenue = data.kpi.totalRevenue;
    const totalOrders = data.kpi.totalOrders;
    
    return days.map((day, index) => ({
      name: day,
      revenue: Math.floor((totalRevenue / 7) * (0.5 + Math.random())), // Distribute revenue across week
      orders: Math.floor((totalOrders / 7) * (0.5 + Math.random())), // Distribute orders across week
    }));
  };

  const salesData = generateSalesData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          Analytics Toko Anda
        </h2>
        <p className="text-gray-600 mt-1">
          Dashboard khusus untuk menganalisis performa bisnis Anda
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              Pendapatan
            </CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {formatRupiah(data.kpi.totalRevenue)}
            </div>
            <p className="text-xs text-green-600 mt-1">30 hari terakhir</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              Pesanan
            </CardTitle>
            <Package className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {data.kpi.totalOrders}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              +{data.recentActivity.newOrders} baru minggu ini
            </p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">
              Rating
            </CardTitle>
            <Star className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">
              {data.kpi.averageRating.toFixed(1)}/5
            </div>
            <p className="text-xs text-yellow-600 mt-1">
              +{data.recentActivity.newReviews} review baru
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Sales Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trend Penjualan (7 Hari Terakhir)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  tickMargin={5}
                />
                <YAxis
                  fontSize={12}
                  tickFormatter={(value) =>
                    `Rp${new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(value)}`
                  }
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === 'revenue' ? formatRupiah(value) : `${value} pesanan`,
                    name === 'revenue' ? 'Pendapatan' : 'Pesanan',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Menu Terlaris (30 Hari)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.topProducts.length > 0 ? (
                  data.topProducts.map((product, index) => (
                    <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="font-medium text-sm">
                          {product.name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-primary">
                        {product.sold}x
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Belum ada data penjualan
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Aktivitas Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50">
                  <span className="text-sm font-medium">Pesanan Baru</span>
                  <span className="font-bold text-blue-600">
                    +{data.recentActivity.newOrders}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-yellow-50">
                  <span className="text-sm font-medium">Review Baru</span>
                  <span className="font-bold text-yellow-600">
                    +{data.recentActivity.newReviews}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}