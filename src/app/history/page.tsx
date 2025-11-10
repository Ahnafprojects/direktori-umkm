// src/app/history/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

// Helper (copy dari checkout)
const formatRupiah = (number: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};

// Format tanggal
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'COMPLETED':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

// Status label Indonesia
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'PAID':
      return 'Dibayar';
    case 'PENDING':
      return 'Menunggu';
    case 'CANCELLED':
      return 'Dibatalkan';
    case 'COMPLETED':
      return 'Selesai';
    default:
      return status;
  }
};

type OrderItem = {
  id: number;
  productId: number;
  quantity: number;
  pricePerItem: number;
  productName: string;
  product?: {
    photo: string;
  };
};

type Order = {
  id: number;
  orderCode: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  deliveryOption: string;
  deliveryAddress: string | null;
  paymentMethod: string | null;
  items: OrderItem[];
  umkm: {
    name: string;
  };
  user?: {
    name: string;
    email: string;
  };
};

export default function HistoryPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders from API
  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/login?redirect=' + encodeURIComponent('/history'));
      return;
    }

    // Hanya untuk pengusaha UMKM
    if (session?.user?.role !== 'PENGUSAHA') {
      router.push('/');
      return;
    }

    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/orders/my-purchases');
        
        if (!response.ok) {
          throw new Error('Gagal mengambil riwayat pembelian');
        }
        
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error('Error fetching purchases:', err);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [status, router, session]);

  // Loading state
  if (status === 'loading' || isLoading) {
    return (
      <main className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">🛒 Transaksi Pembelian</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Terjadi Kesalahan</h1>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Belum Ada Transaksi</h1>
        <p className="text-muted-foreground">
          Anda belum pernah membeli dari UMKM lain.
        </p>
        <Button asChild className="mt-4">
          <Link href="/?bypass=true">
            Mulai Belanja
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">🛒 Transaksi Pembelian</h1>
        <Badge variant="outline" className="text-sm">
          Pembelian Anda dari UMKM Lain
        </Badge>
      </div>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {order.umkm.name}
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDate(order.createdAt)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Kode: {order.orderCode}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {order.deliveryOption === 'delivery' ? '🚚 Diantar' : '🏪 Ambil Sendiri'}
                  </p>
                  {order.paymentMethod && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {order.paymentMethod.toUpperCase()}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Tidak perlu tampilkan info customer karena ini pembelian kita */}
              
              {/* Alamat pengiriman */}
              {order.deliveryAddress && (
                <div className="mt-3 p-3 bg-secondary rounded-lg">
                  <p className="text-sm font-medium">📍 Alamat Pengiriman:</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {order.deliveryAddress}
                  </p>
                </div>
              )}
            </CardHeader>
            
            <CardContent className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <Image
                    src={item.product?.photo || '/images/placeholder-product.jpg'}
                    alt={item.productName}
                    width={48}
                    height={48}
                    className="rounded-md object-cover w-12 h-12"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x {formatRupiah(item.pricePerItem)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatRupiah(item.quantity * item.pricePerItem)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
            
            <Separator />
            
            <CardFooter className="flex justify-between items-center pt-6">
              <div className="flex gap-2">
                {order.status === 'PAID' && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/status/${order.orderCode}`}>
                      <Clock className="h-4 w-4 mr-2" />
                      Lacak Pesanan
                    </Link>
                  </Button>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Pesanan</p>
                <p className="text-2xl font-bold">{formatRupiah(order.totalAmount)}</p>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
