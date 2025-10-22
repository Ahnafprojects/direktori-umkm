// src/components/product-card.tsx
'use client';

import Image from 'next/image';
import { Product } from '@prisma/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';

// 1. GANTI IMPORT TOAST
import { toast } from 'react-hot-toast';

type Props = {
  product: Product;
};

// Helper untuk format Rupiah
const formatRupiah = (number: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};

export default function ProductCard({ product }: Props) {
  // 2. AMBIL AKSI DARI STORE
  const addProduct = useCartStore((state) => state.addProduct);

  const handleAddToCart = () => {
    // 3. PANGGIL AKSI
    addProduct(product);

    // 4. TAMPILKAN NOTIFIKASI
    toast.success(`${product.name} ditambahkan!`, {
      icon: '🛒',
    });
  };
  return (
    <Card>
      <CardContent className="p-4 flex gap-4">
        {/* Foto Produk */}
        <div className="w-24 h-24 relative rounded-md overflow-hidden flex-shrink-0">
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
          <Button size="icon" variant="outline" onClick={handleAddToCart}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}