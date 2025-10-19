// src/components/umkm-card.tsx
import Image from 'next/image';
import Link from 'next/link';
import type { Umkm, Category } from '@prisma/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

// Kita buat tipe data kustom yang menggabungkan UMKM dan Kategori
// karena kita melakukan `include` di server action kita
type UmkmWithCategory = Umkm & {
  category: Category;
};

type Props = {
  umkm: UmkmWithCategory;
};

export default function UmkmCard({ umkm }: Props) {
  return (
    <Link href={`/umkm/${umkm.slug}`} className="group">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="p-0">
          {/* FOTO UMKM */}
          <div className="relative w-full h-48">
            {/* FITUR "PROMO" (WOW FACTOR) */}
            {umkm.hasPromo && (
              <Badge className="absolute top-2 left-2 z-10 text-sm font-bold">
                PROMO
              </Badge>
            )}
            {/* FITUR "REKOMENDASI" (WOW FACTOR) */}
            {umkm.isRecommended && (
              <Badge variant="destructive" className="absolute top-2 right-2 z-10 text-sm font-bold">
                Pilihan Editor
              </Badge>
            )}

            <Image
              // Ambil foto pertama dari array, atau tampilkan placeholder
              src={umkm.photos[0] || '/images/placeholder.jpg'}
              alt={umkm.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-2">
          {/* NAMA UMKM */}
          <h3 className="text-lg font-bold truncate group-hover:text-primary">
            {umkm.name}
          </h3>
          
          {/* BADGE KATEGORI */}
          <Badge variant="outline">{umkm.category.name}</Badge>

          {/* FITUR RATING (WOW FACTOR) */}
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold">{umkm.rating ? Number(umkm.rating).toFixed(1) : '4.0'}</span>
            <span className="text-sm text-muted-foreground">(Ulasan)</span>
          </div>

          {/* ALAMAT (SINGKAT) */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {umkm.address}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}