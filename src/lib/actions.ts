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
    console.error('Gagal mengambil kategori:', error);
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
      const umkms = await db.umkm.findMany({
        where: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
          Category: {
            slug: category,
          },
        },
        include: {
          Category: true,
        },
        orderBy: {
          isRecommended: 'desc',
        },
      });
      filteredUmkms = umkms.map((umkm: any) => ({
        ...umkm,
        rating: umkm.rating ? Number(umkm.rating) : null,
      }));
    } else {
        // --- SKENARIO 2: PENCARIAN TERDEKAT (DENGAN LOKASI) ---
        console.log('Mode: Pencarian Terdekat');
        const latitude = parseFloat(lat);
        const longitude = parseFloat(long);

        let whereCondition = '';
        const queryParams: any[] = [latitude, longitude];
        let paramIndex = 3;

        if (search) {
        whereCondition += ` AND u."name" ILIKE $${paramIndex}`;
        queryParams.push(`%${search}%`);
        paramIndex++;
        }
        if (category) {
        whereCondition += ` AND c."slug" = $${paramIndex}`;
        queryParams.push(category);
        paramIndex++;
        }

        const sortedResults = await db.$queryRawUnsafe(`
            SELECT u.id, ( 6371 * acos( cos( radians($1) ) * cos( radians( u.latitude ) ) * cos( radians( u.longitude ) - radians($2) ) + sin( radians($1) ) * sin( radians( u.latitude ) ) ) ) AS distance
            FROM "Umkm" u
            LEFT JOIN "Category" c ON u."categoryId" = c.id
            WHERE u.latitude IS NOT NULL AND u.longitude IS NOT NULL ${whereCondition}
            ORDER BY distance ASC
            LIMIT 50
        `, ...queryParams) as Array<{id: number, distance: number}>;

        const sortedIds = sortedResults.map((u) => u.id);

        if (sortedIds.length === 0) {
            return [];
        }

        const umkmsData = await db.umkm.findMany({
            where: { id: { in: sortedIds } },
            include: { Category: true },
        });

        const umkmsMap = new Map(umkmsData.map((u: any) => [u.id, u]));
        const sortedUmkms = sortedIds.map((id: any) => umkmsMap.get(id)).filter(Boolean);

        filteredUmkms = sortedUmkms.map((umkm: any) => ({
            ...umkm,
            rating: umkm.rating ? Number(umkm.rating) : null,
        }));
    }

    // --- TAHAP 2: FILTER "OPEN NOW" (SETELAH DATA DI AMBIL) ---
    if (openNow === 'true' && filteredUmkms.length > 0) {
      return filteredUmkms.filter(umkm => 
        isUmkmOpen(umkm.openingHours)
      );
    }

    return filteredUmkms;

  } catch (error) {
    console.error('Gagal mengambil UMKM:', error);
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
        Category: true,
        Review: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
    if (!umkm) return null;
    
    return {
      ...umkm,
      rating: umkm.rating ? Number(umkm.rating) : null,
    };
  } catch (error) {
    console.error('Gagal mengambil detail UMKM:', error);
    return null;
  }
}

// Mengambil SARAN PENCARIAN
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
          mode: 'insensitive',
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
    console.error('Gagal mengambil saran:', error);
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
    
    return cleanedUmkms.map((umkm: any) => ({
      id: umkm.id,
      name: umkm.name,
      slug: umkm.slug,
      latitude: umkm.latitude,
      longitude: umkm.longitude,
      category: { name: umkm.Category.name },
    }));
  } catch (error) {
    console.error('Gagal mengambil data peta:', error);
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
    console.error('Gagal mengambil UMKM by IDs:', error);
    return [];
  }
}