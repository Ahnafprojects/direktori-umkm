// src/app/history/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useHistoryStore, OrderHistory } from '@/store/history-store';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

// Helper (copy dari checkout)
const formatRupiah = (number: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};

export default function HistoryPage() {
  // Kita pakai state lokal agar aman dari Hydration Error
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);
  const orders = useHistoryStore((state) => state.orders);

  useEffect(() => {
    // Pindahkan data dari store ke state setelah client-side siap
    setOrderHistory(orders);
  }, [orders]);

  if (orderHistory.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold">Riwayat Pesanan Kosong</h1>
        <p className="text-muted-foreground">Kamu belum pernah memesan apapun.</p>
        <Button asChild className="mt-4">
          <Link href="/">Mulai Belanja</Link>
        </Button>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Riwayat Pesanan</h1>
      <div className="space-y-6">
        {orderHistory.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <CardTitle className="text-lg">Pesanan pada {order.date}</CardTitle>
              <p className="text-sm text-muted-foreground">ID: {order.id}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <Image
                    src={item.photo || '/images/placeholder.jpg'}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="rounded-md object-cover w-12 h-12"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x {formatRupiah(item.price || 0)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-end">
              <div className="text-right">
                <p className="text-muted-foreground">Total Pesanan</p>
                <p className="text-xl font-bold">{formatRupiah(order.totalPrice)}</p>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}