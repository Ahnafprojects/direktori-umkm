// src/app/_components/category-filter.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // <-- IMPORT
import { Label } from '@/components/ui/label'; // <-- IMPORT
import { Category } from '@prisma/client';

type Props = {
  categories: Category[];
};

export default function CategoryFilter({ categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';

  const handleFilter = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (slug === 'all') {
      params.delete('category');
    } else {
      params.set('category', slug);
    }
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  // Kita pakai RadioGroup agar bisa dinavigasi dengan panah (lebih aksesibel)
  return (
    <RadioGroup
      value={activeCategory}
      onValueChange={handleFilter}
      className="flex gap-2 overflow-x-auto pb-2"
      aria-label="Filter Kategori UMKM"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="all" id="cat-all" />
        <Label htmlFor="cat-all" className="cursor-pointer">Semua</Label>
      </div>
      {categories.map((cat) => (
        <div key={cat.id} className="flex items-center space-x-2">
          <RadioGroupItem value={cat.slug} id={`cat-${cat.slug}`} />
          <Label htmlFor={`cat-${cat.slug}`} className="cursor-pointer">{cat.name}</Label>
        </div>
      ))}
    </RadioGroup>
  );
}