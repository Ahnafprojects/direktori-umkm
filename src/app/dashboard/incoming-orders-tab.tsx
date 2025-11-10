// src/app/dashboard/incoming-orders-tab.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Clock, CheckCircle, XCircle, Loader2, Users, MapPin, Truck, ChefHat } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

// Helper functions (copy dari history page)
const formatRupiah = (number: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};

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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'PAID':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
    case 'PREPARING':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'SHIPPING':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'DELIVERED':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'Menunggu';
    case 'PAID':
      return 'Sudah Bayar';
    case 'PREPARING':
      return 'Sedang Diproses';
    case 'SHIPPING':
      return 'Siap Diambil/Diantar';
    case 'DELIVERED':
      return 'Selesai';
    case 'CANCELLED':
      return 'Dibatalkan';
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

export default function IncomingOrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrders, setUpdatingOrders] = useState<Set<number>>(new Set());

  // Function untuk update status order
  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    setUpdatingOrders(prev => new Set(prev).add(orderId));
    
    try {
      const response = await fetch('/api/orders/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, newStatus }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, status: newStatus }
              : order
          )
        );
        toast.success(result.message);
      } else {
        toast.error(result.error || 'Gagal mengubah status pesanan');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Terjadi kesalahan saat mengubah status pesanan');
    } finally {
      setUpdatingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  // Function untuk mendapatkan status selanjutnya yang valid
  const getNextStatuses = (currentStatus: string) => {
    switch (currentStatus) {
      case 'PENDING':
        return [
          { value: 'PREPARING', label: 'Konfirmasi & Mulai Proses', icon: ChefHat },
          { value: 'CANCELLED', label: 'Batalkan Pesanan', icon: XCircle }
        ];
      case 'PAID':
        return [
          { value: 'PREPARING', label: 'Konfirmasi & Mulai Proses', icon: ChefHat },
          { value: 'CANCELLED', label: 'Batalkan Pesanan', icon: XCircle }
        ];
      case 'PREPARING':
        return [
          { value: 'SHIPPING', label: 'Siap Diambil/Diantar', icon: Package },
        ];
      case 'SHIPPING':
        return [
          { value: 'DELIVERED', label: 'Selesai', icon: Truck },
        ];
      default:
        return [];
    }
  };

  // Fetch incoming orders from API
  useEffect(() => {
    const fetchIncomingOrders = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/orders/incoming');
        
        if (!response.ok) {
          throw new Error('Gagal mengambil pesanan masuk');
        }
        
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error('Error fetching incoming orders:', err);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setIsLoading(false);
      }
    };

    fetchIncomingOrders();
  }, []);

  // Loading state
  if (isLoading) {
    return (
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
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-8">
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold">Terjadi Kesalahan</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-8">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Belum Ada Pesanan Masuk</h3>
          <p className="text-muted-foreground text-center">
            Belum ada pelanggan yang memesan dari UMKM Anda. <br />
            Tingkatkan promosi untuk menarik lebih banyak customer!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">📦 Pesanan Masuk</h3>
        <Badge variant="outline" className="text-xs">
          <Package className="h-3 w-3 mr-1" />
          {orders.length} Pesanan
        </Badge>
      </div>
      
      <div className="space-y-3">
        {orders.map((order) => (
          <Card key={order.id} className="border-l-4 border-l-blue-500 p-3">
            {/* Header Kompak */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm truncate">🏪 {order.umkm.name}</h4>
                  <Badge className={`${getStatusColor(order.status)} text-xs px-2 py-0.5`}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(order.createdAt)}
                  </span>
                  <span>#{order.orderCode}</span>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <span className="text-xs font-medium">
                  {order.deliveryOption === 'delivery' ? '🚚 Diantar' : '🏪 Ambil'}
                </span>
                {order.paymentMethod && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {order.paymentMethod.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            
            {/* Info customer & alamat dalam row kompak */}
            <div className="space-y-2 mb-3">
              {order.user && (
                <div className="flex items-center gap-2 text-xs bg-blue-50 dark:bg-blue-950 p-2 rounded">
                  <Users className="h-3 w-3 text-blue-600" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    {order.user.name}
                  </span>
                  <span className="text-blue-700 dark:text-blue-300">
                    ({order.user.email})
                  </span>
                </div>
              )}
              
              {order.deliveryAddress && (
                <div className="flex items-start gap-2 text-xs bg-green-50 dark:bg-green-950 p-2 rounded">
                  <MapPin className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-green-700 dark:text-green-300 text-wrap break-words">
                    {order.deliveryAddress}
                  </span>
                </div>
              )}
            </div>
            
            {/* Items dalam format kompak */}
            <div className="bg-muted/30 p-2 rounded mb-3">
              <h5 className="text-xs font-medium mb-2">Detail Pesanan:</h5>
              <div className="space-y-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 py-1">
                    <Image
                      src={item.product?.photo || '/images/placeholder-product.jpg'}
                      alt={item.productName}
                      width={32}
                      height={32}
                      className="rounded object-cover w-8 h-8 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs truncate">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} x {formatRupiah(item.pricePerItem)}
                      </p>
                    </div>
                    <p className="font-semibold text-xs text-right">
                      {formatRupiah(item.quantity * item.pricePerItem)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Footer dengan total dan actions */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                {getNextStatuses(order.status).length > 0 && (
                  <>
                    {getNextStatuses(order.status).map((statusOption) => {
                      const Icon = statusOption.icon;
                      return (
                        <Button
                          key={statusOption.value}
                          variant={statusOption.value === 'CANCELLED' ? 'destructive' : 'default'}
                          size="sm"
                          className="text-xs h-8 px-2"
                          onClick={() => updateOrderStatus(order.id, statusOption.value)}
                          disabled={updatingOrders.has(order.id)}
                        >
                          {updatingOrders.has(order.id) ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Icon className="h-3 w-3 mr-1" />
                          )}
                          {statusOption.label}
                        </Button>
                      );
                    })}
                  </>
                )}
                
                {order.status === 'DELIVERED' && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    <span className="text-xs font-medium">Selesai</span>
                  </div>
                )}
                
                {order.status === 'CANCELLED' && (
                  <div className="flex items-center gap-1 text-red-600">
                    <XCircle className="h-3 w-3" />
                    <span className="text-xs font-medium">Dibatalkan</span>
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-bold text-green-600">
                  {formatRupiah(order.totalAmount)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}