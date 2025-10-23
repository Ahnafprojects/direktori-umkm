// File: src/lib/actions.ts
'use server'; // Wajib ada untuk Server Actions
/* eslint-disable @typescript-eslint/no-explicit-any */

import { db } from './prisma';
import { isUmkmOpen } from './time-helper';
// =================================================================
// PERUBAHAN #1: Mengimpor fungsi `noStore` dari Next.js
// =================================================================
import { unstable_noStore as noStore } from 'next/cache';

// Mengambil SEMUA kategori untuk filter
export async function getCategories() {
  // Selalu ambil data kategori terbaru dari database
  noStore();
  try {
    const categories = await db.category.findMany();
    return categories;
  } catch (error) {
    console.error("Gagal mengambil kategori:", error);
    return [];
  }
}

// Mengambil daftar UMKM (untuk halaman utama)
export async function getUmkms(params: {
  search?: string;
  category?: string;
  lat?: string;
  long?: string;
  openNow?: string;
}) {
  // =================================================================
  // PERUBAHAN #2: Memaksa fungsi ini untuk tidak menggunakan cache
  // =================================================================
  noStore(); // Ini memastikan data UMKM selalu diambil langsung dari database

  const { search, category, lat, long, openNow } = params;
  let filteredUmkms: any[] = [];

  try {
    // --- SKENARIO 1: PENCARIAN BIASA (TANPA LOKASI) ---
    if (!lat || !long) {
      console.log('Mode: Pencarian Standar');
      
      // Build where condition for standard search
      const whereCondition: any = {};
      
      if (search) {
        whereCondition.name = {
          contains: search,
          mode: 'insensitive',
        };
      }
      
      // Only add category filter if category is not empty/undefined/"semua"/"all"
      if (category && category !== 'semua' && category !== 'all' && category !== '') {
        whereCondition.Category = {
          slug: category,
        };
      }
      
      const umkms = await db.umkm.findMany({
        where: whereCondition,
        include: {
          Category: true,
          ProductCategory: { // <-- UBAH INI: Ambil ProductCategory dulu
            include: {
              Product: { // <-- Kemudian ambil Product dari ProductCategory
                where: { isFeatured: true }, // Ambil yg andalan saja
                take: 2, // Ambil 2 saja
              },
            },
          },
        },
        orderBy: {
          isRecommended: "desc", // Urutkan berdasarkan rekomendasi
        },
      });
      
      // Serialize Decimal fields to numbers
      filteredUmkms = umkms.map((umkm: any) => ({
        ...umkm,
        rating: umkm.rating ? Number(umkm.rating) : null,
      }));
      
      // Debug: Log untuk cek data produk
      console.log('getUmkms result sample:', filteredUmkms[0]?.name, 'has product categories:', filteredUmkms[0]?.ProductCategory?.length);
    } else {

      const latitude = parseFloat(lat!);
      const longitude = parseFloat(long!);

      // 1. Buat kondisi WHERE untuk raw query
      let whereCondition = "";
      const params: any[] = [latitude, longitude];
      let paramIndex = 3; // Mulai dari $3 karena $1 dan $2 untuk latitude/longitude

      if (search) {
        whereCondition += ` AND u."name" ILIKE $${paramIndex}`;
        params.push(`%${search}%`);
        paramIndex++;
      }
      if (category) {
        whereCondition += ` AND c."slug" = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      // 2. Query Raw: Get ID & Hitung Jarak (Haversine Formula)
      // Ini adalah inti dari fitur "Cari Terdekat".
      const sortedResults = (await db.$queryRawUnsafe(
        `
      SELECT 
        u.id,
        ( 6371 * acos(
            cos( radians($1) )
            * cos( radians( u.latitude ) )
            * cos( radians( u.longitude ) - radians($2) )
            + sin( radians($1) )
            * sin( radians( u.latitude ) )
          )
        ) AS distance
      FROM "Umkm" u
      LEFT JOIN "Category" c ON u."categoryId" = c.id
      WHERE u.latitude IS NOT NULL AND u.longitude IS NOT NULL ${whereCondition}
      ORDER BY distance ASC
      LIMIT 50
    `,
        ...params
      )) as Array<{ id: number; distance: number }>;

      // 3. Ambil data lengkap UMKM berdasarkan ID yang sudah terurut
      const sortedIds = sortedResults.map((u) => u.id);

      if (sortedIds.length === 0) {
        return [];
      }

    // Ambil data lengkap dari DB
    const umkmsData = await db.umkm.findMany({
      where: {
        id: { in: sortedIds },
      },
      include: {
        Category: true,
        ProductCategory: { // <-- UBAH INI JUGA
          include: {
            Product: { // <-- Product ada di dalam ProductCategory
              where: { isFeatured: true },
              take: 2,
            },
          },
        },
      },
    });

      // 4. Urutkan ulang di JavaScript
      // (findMany...in[...] tidak menjamin urutan, jadi kita urutkan manual)
      const umkmsMap = new Map(umkmsData.map((u: any) => [u.id, u]));
      const sortedUmkms = sortedIds
        .map((id: any) => umkmsMap.get(id))
        .filter(Boolean);

    // Serialize Decimal fields to numbers
    filteredUmkms = sortedUmkms.map((umkm: any) => ({
      ...umkm,
      rating: umkm.rating ? Number(umkm.rating) : null,
    }));
    } // <-- TAMBAHKAN CLOSING BRACKET INI

    // --- TAHAP 2: FILTER "OPEN NOW" (SETELAH DATA DI AMBIL) ---
    // Jika parameter `openNow` adalah 'true', filter hasilnya
    if (openNow === "true" && filteredUmkms.length > 0) {
      return filteredUmkms.filter((umkm) => isUmkmOpen(umkm.openingHours));
    }

    return filteredUmkms;
  } catch (error) {
    console.error("Gagal mengambil UMKM:", error);
    return [];
  }
}

// Mengambil SATU UMKM untuk halaman detail
export async function getUmkmBySlug(slug: string) {
  noStore();
  try {
    const umkm = await db.umkm.findUnique({
      where: {
        slug: slug,
      },
      include: {
        Category: true, // Kategori UMKM (Makanan, Jasa, dll)
        Review: { // Ulasan
          orderBy: { createdAt: 'desc' },
          include: {
            user: true, // Include user data for review author
          },
        },
        // INI BAGIAN BARU (PENTING)
        ProductCategory: { // Ambil Kategori Produk (Minuman, Sate, dll)
          orderBy: { id: 'asc' }, // Urutkan berdasarkan ID
          include: {
            Product: { // Ambil Produk di dalam setiap kategori
              orderBy: { isFeatured: 'desc' }, // Tampilkan yg andalan dulu
            },
          },
        },
        // HAPUS: 'products: { ... }' (sudah tidak relevan)
      },
    });
    return umkm;
  } catch (error) {
    console.error("Gagal mengambil detail UMKM:", error);
    return null;
  }
}
// FUNGSI BARU: HANYA UNTUK MENGAMBIL SARAN PENCARIAN
export async function getUmkmSuggestions(query: string) {
  noStore();
  if (!query) {
    return [];
  }
  try {
    const suggestions = await db.umkm.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive", // Tidak peduli huruf besar/kecil
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      take: 5,
    });
    return suggestions;
  } catch (error) {
    console.error("Gagal mengambil saran:", error);
    return [];
  }
}

// Mengambil SEMUA PIN PETA
export async function getUmkmForMap() {
  noStore();
  try {
    const umkms = await db.umkm.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        latitude: true,
        longitude: true,
        Category: {
          select: { name: true },
        },
      },
    });
    const cleanedUmkms = umkms.filter(
      (umkm: any) => umkm.latitude !== null && umkm.longitude !== null
    );

    // Transform data to match expected interface
    return cleanedUmkms.map((umkm: any) => ({
      id: umkm.id,
      name: umkm.name,
      slug: umkm.slug,
      latitude: umkm.latitude,
      longitude: umkm.longitude,
      category: { name: umkm.Category.name },
    }));
  } catch (error) {
    console.error("Gagal mengambil data peta:", error);
    return [];
  }
}

// Mengambil UMKM BERDASARKAN ARRAY ID
export async function getUmkmsByIds(ids: number[]) {
  noStore();
  if (ids.length === 0) {
    return [];
  }
  try {
    const umkms = await db.umkm.findMany({
      where: {
        id: { in: ids },
      },
      include: {
        Category: true,
      },
    });

    const umkmsMap = new Map(umkms.map((u: any) => [u.id, u]));
    const sortedUmkms = ids.map((id) => umkmsMap.get(id)).filter(Boolean);

    return sortedUmkms.map((umkm: any) => ({
      ...umkm,
      rating: umkm.rating ? Number(umkm.rating) : null,
    }));
  } catch (error) {
    console.error("Gagal mengambil UMKM by IDs:", error);
    return [];
  }
}
}

// FUNGSI BARU: Ambil SEMUA UMKM (ringkas) untuk AI
export async function getAllUmkmsForAI() {
  try {
    const umkms = await db.umkm.findMany({
      select: {
        slug: true,
        name: true,
      },
    });
    return umkms;
  } catch (error) {
    return [];
  }
}


// FUNGSI BARU: Ambil SEMUA UMKM (ringkas) untuk AI
export async function getAllUmkmsForAI() {
  try {
    const umkms = await db.umkm.findMany({
      select: {
        slug: true,
        name: true,
      },
    });
    return umkms;
  } catch (error) {
    return [];
  }
}


// FUNGSI BARU: Ambil detail UMKM favorit berdasarkan ID
export async function getFavoriteUmkmsDetails(ids: number[]) {
  if (ids.length === 0) return [];
  try {
    const umkms = await db.umkm.findMany({
      where: { id: { in: ids } },
      select: {
        slug: true,
        name: true,
      },
    });
    return umkms;
  } catch (error) {
    return [];
  }
}

}

