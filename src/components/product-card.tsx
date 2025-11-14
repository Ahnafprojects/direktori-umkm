// src/components/product-card.tsx
'use client';

import Image from 'next/image';
import { Product } from '@prisma/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Info } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useSession } from 'next-auth/react';

// 1. GANTI IMPORT TOAST
import { toast } from 'react-hot-toast';

type Props = {
  product: Product;
  umkm?: {
    id: number;
    name: string;
    slug: string;
    ownerId?: string | null;
    rating?: number | null;
    Category?: {
      id: number;
      name: string;
      slug: string;
    } | null;
  };
};

// Helper untuk format Rupiah
const formatRupiah = (number: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};

export default function ProductCard({ product, umkm }: Props) {
  // 2. AMBIL AKSI DARI STORE
  const addProduct = useCartStore((state) => state.addProduct);
  const { data: session } = useSession();

  // Cek apakah ini produk milik user sendiri
  const isOwnProduct = session?.user?.id && umkm?.ownerId === session.user.id;
  
  // Cek apakah ini kategori jasa
  const isServiceCategory = umkm?.Category?.name?.toLowerCase().includes('jasa');
  
  // Tentukan apakah tombol beli bisa diklik
  const canPurchase = !isOwnProduct && !isServiceCategory;

  const handleAddToCart = () => {
    if (isOwnProduct) {
      toast.error('Anda tidak dapat membeli produk dari UMKM sendiri');
      return;
    }
    
    if (isServiceCategory) {
      toast.error('Produk jasa hanya untuk informasi, tidak dapat dibeli');
      return;
    }

    // 3. PANGGIL AKSI
    addProduct(product);

    // 4. TAMPILKAN NOTIFIKASI
    toast.success(`${product.name} ditambahkan!`);
  };
  return (
    <Card>
      <CardContent className="p-4 flex gap-4">
        {/* Foto Produk */}
        <div className="w-24 h-24 relative rounded-md overflow-hidden shrink-0">
          <Image
            src={product.photo || '/images/placeholder.jpg'}
            alt={`Foto ${product.name}`}
            fill
            className="object-cover"
          />
        </div>

        {/* Info Produk */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h4 className="font-semibold">{product.name}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description || ''}
            </p>
          </div>
          <p className="font-bold text-lg">
            {product.price ? formatRupiah(product.price) : 'Harga tidak tersedia'}
          </p>
        </div>

        {/* Tombol Add to Cart */}
        <div className="flex items-end">
          {isOwnProduct ? (
            <Button 
              size="icon" 
              variant="outline" 
              disabled
              className="border-gray-300 text-gray-400 cursor-not-allowed"
              title="Produk milik Anda sendiri"
            >
              <Info className="h-4 w-4" />
            </Button>
          ) : isServiceCategory ? (
            <Button 
              size="icon" 
              variant="outline" 
              disabled
              className="border-blue-300 text-blue-500 cursor-not-allowed"
              title="Produk jasa hanya untuk informasi"
            >
              <Info className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              size="icon" 
              variant="outline" 
              onClick={handleAddToCart}
              className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-600"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}