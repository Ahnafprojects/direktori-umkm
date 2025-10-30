"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { db } from "./prisma";
import { isUmkmOpen } from "./time-helper";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

// ... (semua fungsi 'get' kamu tidak berubah, jadi saya salin langsung)
export async function getCategories() {
    try {
        const categories = await db.category.findMany();
        return categories;
    } catch (error) {
        console.error("Gagal mengambil kategori:", error);
        return [];
    }
}

export async function getUmkms(params: {
    search?: string;
    category?: string;
    lat?: string;
    long?: string;
    openNow?: string;
}) {
    const { search, category, lat, long, openNow } = params;
    let filteredUmkms: any[] = [];

    try {
        if (!lat || !long) {
            const whereCondition: any = {};
            if (search) {
                whereCondition.name = { contains: search, mode: "insensitive" };
            }
            if (category && category !== "semua" && category !== "all" && category !== "") {
                whereCondition.Category = { slug: category };
            }
            const umkms = await db.umkm.findMany({
                where: whereCondition,
                include: {
                    Category: true,
                    ProductCategory: {
                        include: {
                            Product: { where: { isFeatured: true }, take: 2 },
                        },
                    },
                },
                orderBy: { isRecommended: "desc" },
            });
            filteredUmkms = umkms.map((umkm: any) => ({
                ...umkm,
                rating: umkm.rating ? Number(umkm.rating) : null,
            }));
        } else {
            const latitude = parseFloat(lat!);
            const longitude = parseFloat(long!);
            let whereCondition = "";
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
            const sortedResults = (await db.$queryRawUnsafe(
                `SELECT u.id, ( 6371 * acos( cos( radians($1) ) * cos( radians( u.latitude ) ) * cos( radians( u.longitude ) - radians($2) ) + sin( radians($1) ) * sin( radians( u.latitude ) ) ) ) AS distance FROM "Umkm" u LEFT JOIN "Category" c ON u."categoryId" = c.id WHERE u.latitude IS NOT NULL AND u.longitude IS NOT NULL ${whereCondition} ORDER BY distance ASC LIMIT 50`,
                ...queryParams
            )) as Array<{ id: number; distance: number }>;
            const sortedIds = sortedResults.map((u) => u.id);
            if (sortedIds.length === 0) return [];
            const umkmsData = await db.umkm.findMany({
                where: { id: { in: sortedIds } },
                include: {
                    Category: true,
                    ProductCategory: {
                        include: {
                            Product: { where: { isFeatured: true }, take: 2 },
                        },
                    },
                },
            });
            const umkmsMap = new Map(umkmsData.map((u: any) => [u.id, u]));
            const sortedUmkms = sortedIds.map((id: any) => umkmsMap.get(id)).filter(Boolean);
            filteredUmkms = sortedUmkms.map((umkm: any) => ({
                ...umkm,
                rating: umkm.rating ? Number(umkm.rating) : null,
            }));
        }

        if (openNow === "true" && filteredUmkms.length > 0) {
            return filteredUmkms.filter((umkm) => isUmkmOpen(umkm.openingHours));
        }
        return filteredUmkms;
    } catch (error) {
        console.error("Gagal mengambil UMKM:", error);
        return [];
    }
}

export async function getUmkmBySlug(slug: string) {
    try {
        const umkm = await db.umkm.findUnique({
            where: { slug: slug },
            include: {
              Product: {
                // <-- Kemudian ambil Product dari ProductCategory
                take: 3, // Ambil 3 saja
              },
                Category: true,
                Review: {
                    orderBy: { createdAt: "desc" },
                    include: { user: true },
                },
                ProductCategory: {
                    orderBy: { id: "asc" },
                    include: { Product: { orderBy: { isFeatured: "desc" } } },
                },
            },
        });
        return umkm;
    } catch (error) {
        console.error("Gagal mengambil detail UMKM:", error);
        return null;
    }
}

export async function getUmkmSuggestions(query: string) {
    if (!query) return [];
    try {
        return await db.umkm.findMany({
            where: { name: { contains: query, mode: "insensitive" } },
            select: { id: true, name: true, slug: true },
            take: 5,
        });
    } catch (error) {
        console.error("Gagal mengambil saran:", error);
        return [];
    }
}

export async function getUmkmForMap() {
    try {
        const umkms = await db.umkm.findMany({
            where: { latitude: { not: null }, longitude: { not: null } },
            select: {
                id: true, name: true, slug: true,
                latitude: true, longitude: true, photos: true,
                Category: { select: { name: true } },
            },
        });
        const cleanedUmkms = umkms.filter((umkm: any) => umkm.latitude !== null && umkm.longitude !== null);
        return cleanedUmkms.map((umkm: any) => ({
            id: umkm.id, name: umkm.name, slug: umkm.slug,
            latitude: umkm.latitude, longitude: umkm.longitude,
            photoUrl: (Array.isArray(umkm.photos) && umkm.photos[0]) || "/images/placeholder-umkm.jpg",
            category: { name: umkm.Category.name },
        }));
    } catch (error) {
        console.error("Gagal mengambil data peta:", error);
        return [];
    }
}

export async function getUmkmsByIds(ids: number[]) {
    if (ids.length === 0) return [];
    try {
        const umkms = await db.umkm.findMany({
            where: { id: { in: ids } },
            include: { Category: true },
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

export async function getAllUmkmsForAI() {
    try {
        return await db.umkm.findMany({
            select: { slug: true, name: true },
        });
    } catch (error) {
        return [];
    }
}

export async function getFavoriteUmkmsDetails(ids: number[]) {
    if (ids.length === 0) return [];
    try {
        return await db.umkm.findMany({
            where: { id: { in: ids } },
            select: { slug: true, name: true },
        });
    } catch (error) {
        return [];
    }
}

export async function getUmkmForEdit(slug: string) {
    try {
        const umkm = await db.umkm.findUnique({
            where: { slug },
            include: {
              Product: {
                // <-- Product ada di dalam ProductCategory
                take: 3,
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
                ProductCategory: {
                    include: {
                        Product: {
                            orderBy: { id: 'asc' }
                        }
                    }
                }
            }
        });

        if (!umkm) return null;

        const products = umkm.ProductCategory[0]?.Product.map(p => ({
            name: p.name,
            description: p.description || '',
            price: p.price ? String(p.price) : ''
        })) || [];

        return {
            id: umkm.id, ownerId: umkm.ownerId, name: umkm.name,
            description: umkm.description || '', address: umkm.address,
            phone: umkm.phone || '', openingHours: umkm.openingHours || '',
            photos: umkm.photos, latitude: umkm.latitude, longitude: umkm.longitude,
            categoryId: umkm.categoryId, products: products,
        };

    } catch (error) {
        console.error("Gagal mengambil data UMKM untuk diedit:", error);
        return null;
    }
}

// === PERUBAHAN UTAMA: Skema validasi untuk path lokal ===
const UmkmFormSchema = z.object({
  name: z.string().min(3, "Nama UMKM wajib diisi."),
  description: z.string().min(1, "Deskripsi wajib diisi."),
  address: z.string().min(5, "Alamat wajib diisi."),
  phone: z.string().optional(),
  openingHours: z.string().optional(),
  categoryId: z.string().min(1, "Kategori wajib dipilih."),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  // Hapus .url() agar bisa menerima path lokal seperti '/uploads/file.png'
  photos: z.array(z.string()).optional(),
  products: z.array(z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.string().min(1),
  })).optional()
});

// FUNGSI BARU: UNTUK MENGAMBIL SEMUA PIN PETA
export async function getUmkmForMap() {
  try {
    const umkms = await db.umkm.findMany({
      where: {
        // Pastikan hanya ambil yg punya koordinat
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        latitude: true,
        longitude: true,
        address: true,
        phone: true,
        openingHours: true,
        rating: true,
        photos: true,
        Category: {
          select: { name: true },
        },
      },
    });
    // Kita perlu membersihkan tipe data null sebelum mengirim ke klien
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
      address: umkm.address,
      phone: umkm.phone,
      openingHours: umkm.openingHours,
      rating: umkm.rating ? parseFloat(umkm.rating.toString()) : null,
      photoUrl:
        (Array.isArray(umkm.photos) && umkm.photos[0]) ||
        "/images/placeholder-umkm.jpg",
      category: { name: umkm.Category.name }, // Transform Category to category
    }));
  } catch (error) {
    console.error("Gagal mengambil data peta:", error);
    return [];
  }

function createSlug(name: string): string {
    const baseSlug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const uniqueSuffix = Date.now().toString().slice(-5);
    return `${baseSlug}-${uniqueSuffix}`;
}

// Tidak ada perubahan di 'createUmkm' dan 'updateUmkm', namun kodenya tetap disertakan
export async function createUmkm(data: any) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== 'PENGUSAHA') {
        return { success: false, message: 'Anda tidak memiliki akses.' };
    }

    const validationResult = UmkmFormSchema.safeParse(data);
    if (!validationResult.success) {
        const firstError = validationResult.error.issues[0].message;
        return { success: false, message: firstError };
    }
    const validatedData = validationResult.data;

    try {
        const slug = createSlug(validatedData.name);
        await db.$transaction(async (tx) => {
            const newUmkm = await tx.umkm.create({
                data: {
                    name: validatedData.name, slug: slug, description: validatedData.description,
                    address: validatedData.address, phone: validatedData.phone,
                    openingHours: validatedData.openingHours, categoryId: parseInt(validatedData.categoryId, 10),
                    latitude: validatedData.latitude, longitude: validatedData.longitude,
                    photos: validatedData.photos,
                    // @ts-ignore
                    ownerId: session.user.id,
                },
            });
            const productCategory = await tx.productCategory.create({
                data: { name: 'Menu Utama', umkmId: newUmkm.id },
            });
            if (validatedData.products && validatedData.products.length > 0) {
                await tx.product.createMany({
                    data: validatedData.products.map((p: any) => ({
                        name: p.name, description: p.description,
                        price: parseInt(p.price, 10), productCategoryId: productCategory.id,
                    })),
                });
            }
        });
        revalidatePath('/dashboard/umkm/saya');
        return { success: true, message: 'UMKM baru berhasil didaftarkan!' };
    } catch (error) {
        console.error("Create UMKM error:", error);
        return { success: false, message: 'Gagal mendaftarkan UMKM. Pastikan semua data terisi.' };
    }
}

export async function updateUmkm(umkmId: number, data: any) {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session || session.user?.role !== 'PENGUSAHA') {
        return { success: false, message: 'Anda tidak memiliki akses.' };
    }

    const umkm = await db.umkm.findUnique({ where: { id: umkmId }, select: { ownerId: true, slug: true } });
    // @ts-ignore
    if (!umkm || umkm.ownerId !== session.user.id) {
        return { success: false, message: 'UMKM tidak ditemukan atau Anda bukan pemiliknya.' };
    }
    
    const validationResult = UmkmFormSchema.safeParse(data);
    if (!validationResult.success) {
        const firstError = validationResult.error.issues[0].message;
        return { success: false, message: firstError };
    }
    const validatedData = validationResult.data;

    try {
        await db.$transaction(async (tx) => {
            await tx.umkm.update({
                where: { id: umkmId },
                data: {
                    name: validatedData.name, description: validatedData.description,
                    address: validatedData.address, phone: validatedData.phone,
                    openingHours: validatedData.openingHours, categoryId: parseInt(validatedData.categoryId, 10),
                    latitude: validatedData.latitude, longitude: validatedData.longitude,
                    photos: validatedData.photos,
                },
            });
            const productCategory = await tx.productCategory.findFirst({ where: { umkmId: umkmId } });
            if (productCategory) {
                await tx.product.deleteMany({ where: { productCategoryId: productCategory.id } });
                if (validatedData.products && validatedData.products.length > 0) {
                    await tx.product.createMany({
                        data: validatedData.products.map((p: any) => ({
                            name: p.name, description: p.description || '',
                            price: parseInt(p.price, 10), productCategoryId: productCategory.id,
                        }))
                    });
                }
            }
        });
        revalidatePath('/dashboard/umkm/saya');
        revalidatePath(`/umkm/${umkm.slug}`);
        return { success: true, message: 'UMKM berhasil diperbarui!' };
    } catch (error) {
        console.error("Update UMKM error:", error);
        return { success: false, message: 'Terjadi kesalahan pada server.' };
    }
}

export async function deleteUmkm(umkmId: number) {
    const session = await getServerSession(authOptions);
    try {
        // @ts-ignore
        if (!session || session.user?.role !== 'PENGUSAHA') {
            throw new Error('Akses tidak diizinkan.');
        }
        const umkmToDelete = await db.umkm.findUnique({
            where: { id: umkmId },
            select: { ownerId: true },
        });
        // @ts-ignore
        if (!umkmToDelete || umkmToDelete.ownerId !== session.user.id) {
            throw new Error('Anda tidak memiliki izin untuk menghapus UMKM ini.');
        }
        await db.umkm.delete({ where: { id: umkmId } });
        revalidatePath('/dashboard/umkm/saya');
        return { success: true, message: 'UMKM berhasil dihapus.' };
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, message: error.message };
        }
        return { success: false, message: 'Terjadi kesalahan server.' };
    }
}