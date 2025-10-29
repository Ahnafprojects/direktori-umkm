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
  'makanan': '/images/category/makanan.jpg',
  'minuman': '/images/category/minuman.jpg',
  'belanja': '/images/category/belanja.jpg',
  'jasa': '/images/category/jasa.jpg',
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
      <h3 className="text-base sm:text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
        Kategori
      </h3>
      <div className="flex gap-4 sm:gap-6 overflow-x-auto py-3 px-2 scrollbar-hide">
        {/* Tombol Semua */}
        <button
          onClick={() => handleFilter("all")}
          className="group relative flex flex-col items-center gap-2 flex-shrink-0"
        >
          <div className={`relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden transition-all duration-300 group-hover:scale-110 ${
            activeCategory === "all"
              ? "ring-4 ring-green-500 ring-offset-2 dark:ring-offset-gray-900"
              : "ring-2 ring-gray-200 dark:ring-gray-700"
          }`}>
            <Image
              src="/images/category/semua.jpg"
              alt="Semua Kategori"
              fill
              className="object-cover"
            />
          </div>
          <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-center text-gray-800 dark:text-gray-200 whitespace-nowrap">
            Semua
          </span>
          {activeCategory === "all" && (
            <span className="absolute top-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full animate-pulse ring-2 ring-white dark:ring-gray-900" />
          )}
        </button>

        {/* Tombol Kategori dengan Logo */}
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleFilter(cat.slug)}
            className="group relative flex flex-col items-center gap-2 flex-shrink-0"
          >
            <div className={`relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden transition-all duration-300 group-hover:scale-110 ${
              activeCategory === cat.slug
                ? "ring-4 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900"
                : "ring-2 ring-gray-200 dark:ring-gray-700"
            }`}>
              {categoryLogos[cat.slug] ? (
                <Image
                  src={categoryLogos[cat.slug]}
                  alt={cat.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center">
                  <span className="text-xl sm:text-2xl">📦</span>
                </div>
              )}
            </div>
            <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-center text-gray-800 dark:text-gray-200 whitespace-nowrap max-w-[70px] sm:max-w-[80px]">
              {cat.name}
            </span>
            {activeCategory === cat.slug && (
              <span className="absolute top-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full animate-pulse ring-2 ring-white dark:ring-gray-900" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
