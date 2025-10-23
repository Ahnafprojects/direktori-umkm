// src/app/_components/category-filter.tsx
'use client';

<<<<<<< Updated upstream
import { useRouter, useSearchParams } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // <-- IMPORT
import { Label } from '@/components/ui/label'; // <-- IMPORT
import { Category } from '@prisma/client';
=======
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Category } from "@prisma/client";
>>>>>>> Stashed changes

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

  return (
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
=======
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <Button
        variant={activeCategory === "all" ? "default" : "outline"}
        onClick={() => handleFilter("all")}
        className={`whitespace-nowrap transition-all duration-200 ${
          activeCategory === "all"
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
        }`}
      >
        Semua
      </Button>
      {categories.map((cat) => (
=======
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <Button
        variant={activeCategory === "all" ? "default" : "outline"}
        onClick={() => handleFilter("all")}
        className={`whitespace-nowrap transition-all duration-200 ${
          activeCategory === "all"
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
        }`}
      >
        Semua
      </Button>
      {categories.map((cat) => (
>>>>>>> Stashed changes
=======
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <Button
        variant={activeCategory === "all" ? "default" : "outline"}
        onClick={() => handleFilter("all")}
        className={`whitespace-nowrap transition-all duration-200 ${
          activeCategory === "all"
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
        }`}
      >
        Semua
      </Button>
      {categories.map((cat) => (
>>>>>>> Stashed changes
        <Button
          key={cat.id}
          variant={activeCategory === cat.slug ? "default" : "outline"}
          onClick={() => handleFilter(cat.slug)}
          className={`whitespace-nowrap transition-all duration-200 ${
            activeCategory === cat.slug
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
          }`}
        >
          {cat.name}
        </Button>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
      ))}
    </div>
  );
}