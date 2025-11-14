// src/app/_components/category-filter.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Category } from "@prisma/client";
import Image from "next/image";

type Props = {
  categories: Category[];
};

// Mapping category slug ke logo
const categoryLogos: Record<string, string> = {
  makanan: "/images/category/makanan.jpg",
  minuman: "/images/category/minuman.jpg",
  belanja: "/images/category/belanja.jpg",
  jasa: "/images/category/jasa.jpg",
  fashion: "/images/category/fashion.jpg",
  kerajinan: "/images/category/kerajinan.jpg",
};

export default function CategoryFilter({ categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";

  const handleFilter = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (slug === "all") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full">
      <h3 className="text-base sm:text-lg font-semibold mb-3 text-foreground">
        Kategori
      </h3>
      <div className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto py-3 px-2 scrollbar-hide" style={{ 
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {/* Tombol Semua */}
        <button
          onClick={() => handleFilter("all")}
          className="group relative flex flex-col items-center gap-1.5 shrink-0 min-w-[60px] sm:min-w-[70px]"
        >
          <div
            className={`relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full overflow-hidden transition-all duration-300 group-hover:scale-105 ${
              activeCategory === "all"
                ? "ring-3 ring-green-500 ring-offset-1 dark:ring-offset-gray-900"
                : "ring-2 ring-gray-200 dark:ring-gray-700"
            }`}
          >
            <Image
              src="/images/category/semua.jpg"
              alt="Semua Kategori"
              fill
              className="object-cover"
            />
          </div>
          <span className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-center text-foreground whitespace-nowrap">
            Semua
          </span>
          {activeCategory === "all" && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse ring-1 ring-white dark:ring-gray-900" />
          )}
        </button>

        {/* Tombol Kategori dengan Logo */}
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleFilter(cat.slug)}
            className="group relative flex flex-col items-center gap-1.5 shrink-0 min-w-[60px] sm:min-w-[70px]"
          >
            <div
              className={`relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full overflow-hidden transition-all duration-300 group-hover:scale-105 ${
                activeCategory === cat.slug
                  ? "ring-3 ring-blue-500 ring-offset-1 dark:ring-offset-gray-900"
                  : "ring-2 ring-gray-200 dark:ring-gray-700"
              }`}
            >
              {categoryLogos[cat.slug] ? (
                <Image
                  src={categoryLogos[cat.slug]}
                  alt={cat.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-400 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center">
                  <span className="text-sm sm:text-base font-bold">CAT</span>
                </div>
              )}
            </div>
            <span className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-center text-foreground whitespace-nowrap max-w-[55px] sm:max-w-[65px] leading-tight">
              {cat.name}
            </span>
            {activeCategory === cat.slug && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse ring-1 ring-white dark:ring-gray-900" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
