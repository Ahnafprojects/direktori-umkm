"use server";
"use server"; // Wajib ada untuk Server Actions
/* eslint-disable @typescript-eslint/no-explicit-any */

import { db } from "./prisma";
import { isUmkmOpen } from "./time-helper"; // <-- 1. IMPORT HELPER
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";

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
      if (
        category &&
        category !== "semua" &&
        category !== "all" &&
        category !== ""
      ) {
        whereCondition.Category = { slug: category };
      }
      const umkms = await db.umkm.findMany({
        where: {
          ...whereCondition,
          isActive: true, // Hanya tampilkan UMKM yang aktif
        },
        include: {
          Category: true,
          ProductCategory: {
            include: {
              Product: { take: 3 },
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
        where: { 
          id: { in: sortedIds },
          isActive: true 
        },
        include: {
          Category: true,
          ProductCategory: {
            include: {
              Product: { take: 3 },
            },
          },
        },
      });
      const umkmsMap = new Map(umkmsData.map((u: any) => [u.id, u]));
      const sortedUmkms = sortedIds
        .map((id: any) => umkmsMap.get(id))
        .filter(Boolean);
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
    console.log('Searching for UMKM with slug:', slug);
    
    // Cari semua UMKM untuk debug
    const allUmkms = await db.umkm.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true }
    });
    console.log('All UMKM in database:', allUmkms.map((u: any) => ({ id: u.id, name: u.name, slug: u.slug })));
    
    const umkm = await db.umkm.findFirst({
      where: { 
        slug: slug,
        isActive: true 
      },
      include: {
        Category: true,
        Review: {
          orderBy: { createdAt: "desc" },
          include: { 
            user: {
              select: {
                id: true,
                name: true
              }
            },
            replier: {
              select: {
                id: true,
                name: true
              }
            }
          },
        },
        ProductCategory: {
          orderBy: { id: "asc" },
          include: { 
            Product: { 
              orderBy: { isFeatured: "desc" }
            } 
          },
        },
      },
    });
    
    console.log('UMKM found by slug:', umkm ? `Found: ${umkm.name}` : 'Not found');
    return umkm;
  } catch (error) {
    console.error("Gagal mengambil detail UMKM:", error);
    console.error("Database connection error:", error);
    return null;
  }
}

export async function getUmkmSuggestions(query: string) {
  if (!query) return [];
  try {
    return await db.umkm.findMany({
      where: { 
        name: { contains: query, mode: "insensitive" },
        isActive: true 
      },
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
      where: { 
        latitude: { not: null }, 
        longitude: { not: null },
        isActive: true 
      },
      select: {
        id: true,
        name: true,
        slug: true,
        latitude: true,
        longitude: true,
        photos: true,
        Category: { select: { name: true } },
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
      photoUrl:
        (Array.isArray(umkm.photos) && umkm.photos[0]) ||
        "/images/placeholder-umkm.jpg",
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
      where: { 
        id: { in: ids },
        isActive: true 
      },
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
      where: { isActive: true },
      select: { slug: true, name: true },
    });
  } catch {
    return [];
  }
}

export async function getFavoriteUmkmsDetails(ids: number[]) {
  if (ids.length === 0) return [];
  try {
    return await db.umkm.findMany({
      where: { 
        id: { in: ids },
        isActive: true 
      },
      select: { slug: true, name: true },
    });
  } catch {
    return [];
  }
}

export async function getUmkmForEdit(slug: string) {
  try {
    const umkm = await db.umkm.findUnique({
      where: { slug },
      include: {
        ProductCategory: {
          include: {
            Product: {
              orderBy: { id: "asc" },
            },
          },
        },
      },
    });

    if (!umkm) return null;

    const products =
      umkm.ProductCategory[0]?.Product.map((p: any) => ({
        name: p.name,
        description: p.description || "",
        price: p.price ? String(p.price) : "",
        costPrice: p.costPrice ? String(p.costPrice) : "",
        photo: p.photo || "", // Tambahkan field photo
      })) || [];

    return {
      id: umkm.id,
      ownerId: umkm.ownerId,
      name: umkm.name,
      description: umkm.description || "",
      address: umkm.address,
      phone: umkm.phone || "",
      openingHours: umkm.openingHours || "",
      photos: umkm.photos,
      latitude: umkm.latitude,
      longitude: umkm.longitude,
      categoryId: umkm.categoryId,
      products: products,
    };
  } catch (error) {
    console.error("Gagal mengambil data UMKM untuk diedit:", error);
    return null;
  }
}

// Basic validation function
function validateUmkmData(data: any) {
  if (!data.name || data.name.length < 3) {
    return { success: false, message: "Nama UMKM wajib diisi." };
  }
  if (!data.description || data.description.length < 1) {
    return { success: false, message: "Deskripsi wajib diisi." };
  }
  if (!data.address || data.address.length < 5) {
    return { success: false, message: "Alamat wajib diisi." };
  }
  if (!data.categoryId) {
    return { success: false, message: "Kategori wajib dipilih." };
  }
  return { success: true, data };
}

function createSlug(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
  const uniqueSuffix = Date.now().toString().slice(-5);
  return `${baseSlug}-${uniqueSuffix}`;
}

// Tidak ada perubahan di 'createUmkm' dan 'updateUmkm', namun kodenya tetap disertakan
export async function createUmkm(data: any) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { success: false, message: "Anda harus login terlebih dahulu." };
  }

  // Cek role dari database untuk memastikan data terbaru
  const user = await db.user.findUnique({
    where: { id: (session.user as any).id },
    select: { role: true }
  });

  if (!user || user.role !== "PENGUSAHA") {
    return { success: false, message: "Anda tidak memiliki akses. Hanya pengusaha yang dapat mendaftarkan UMKM." };
  }

  const validationResult = validateUmkmData(data);
  if (!validationResult.success) {
    return { success: false, message: validationResult.message };
  }
  const validatedData = data;

  try {
    const slug = createSlug(validatedData.name);
    await db.$transaction(async (tx: any) => {
      const newUmkm = await tx.umkm.create({
        data: {
          name: validatedData.name,
          slug: slug,
          description: validatedData.description,
          address: validatedData.address,
          phone: validatedData.phone,
          openingHours: validatedData.openingHours,
          categoryId: parseInt(validatedData.categoryId, 10),
          latitude: validatedData.latitude,
          longitude: validatedData.longitude,
          photos: validatedData.photos,
          ownerId: (session.user as any).id,
        },
      });
      const productCategory = await tx.productCategory.create({
        data: { name: "Menu Utama", umkmId: newUmkm.id },
      });
      if (validatedData.products && validatedData.products.length > 0) {
        await tx.product.createMany({
          data: validatedData.products.map((p: any) => ({
            name: p.name,
            description: p.description,
            price: parseInt(p.price, 10),
            costPrice: p.costPrice ? parseInt(p.costPrice, 10) : null,
            photo: p.photo || null, // Tambahkan field photo
            productCategoryId: productCategory.id,
          })),
        });
      }
    });
    revalidatePath("/dashboard/umkm/saya");
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true, message: "UMKM baru berhasil didaftarkan!" };
  } catch (error) {
    console.error("Create UMKM error:", error);
    return {
      success: false,
      message: "Gagal mendaftarkan UMKM. Pastikan semua data terisi.",
    };
  }
}

export async function updateUmkm(umkmId: number, data: any) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { success: false, message: "Anda harus login terlebih dahulu." };
  }

  // Cek role dari database untuk memastikan data terbaru
  const user = await db.user.findUnique({
    where: { id: (session.user as any).id },
    select: { role: true }
  });

  if (!user || user.role !== "PENGUSAHA") {
    return { success: false, message: "Anda tidak memiliki akses. Hanya pengusaha yang dapat mengedit UMKM." };
  }

  const umkm = await db.umkm.findUnique({
    where: { id: umkmId },
    select: { ownerId: true, slug: true },
  });
  if (!umkm || umkm.ownerId !== (session.user as any).id) {
    return {
      success: false,
      message: "UMKM tidak ditemukan atau Anda bukan pemiliknya.",
    };
  }

  const validationResult = validateUmkmData(data);
  if (!validationResult.success) {
    return { success: false, message: validationResult.message };
  }
  const validatedData = data;

  try {
    await db.$transaction(async (tx: any) => {
      await tx.umkm.update({
        where: { id: umkmId },
        data: {
          name: validatedData.name,
          description: validatedData.description,
          address: validatedData.address,
          phone: validatedData.phone,
          openingHours: validatedData.openingHours,
          categoryId: parseInt(validatedData.categoryId, 10),
          latitude: validatedData.latitude,
          longitude: validatedData.longitude,
          photos: validatedData.photos,
        },
      });
      const productCategory = await tx.productCategory.findFirst({
        where: { umkmId: umkmId },
        include: {
          Product: {
            orderBy: { id: "asc" },
          },
        },
      });

      if (productCategory) {
        const existingProducts = productCategory.Product;
        const incomingProducts = validatedData.products || [];

        // Update atau create produk berdasarkan index
        for (let i = 0; i < incomingProducts.length; i++) {
          const productData = {
            name: incomingProducts[i].name,
            description: incomingProducts[i].description || "",
            price: parseInt(incomingProducts[i].price, 10),
            costPrice: incomingProducts[i].costPrice ? parseInt(incomingProducts[i].costPrice, 10) : null,
            photo: incomingProducts[i].photo || null,
            productCategoryId: productCategory.id,
          };

          if (existingProducts[i]) {
            // Update produk yang sudah ada
            await tx.product.update({
              where: { id: existingProducts[i].id },
              data: productData,
            });
          } else {
            // Create produk baru jika tidak ada
            await tx.product.create({
              data: productData,
            });
          }
        }

        // Hapus produk yang berlebih (jika incoming products lebih sedikit)
        // HANYA hapus produk yang TIDAK pernah dipesan
        if (existingProducts.length > incomingProducts.length) {
          const productsToDelete = existingProducts.slice(
            incomingProducts.length
          );
          for (const product of productsToDelete) {
            // Cek apakah produk pernah dipesan
            const hasOrders = await tx.orderItem.findFirst({
              where: { productId: product.id },
            });

            if (!hasOrders) {
              // Aman untuk dihapus karena tidak ada order
              await tx.product.delete({
                where: { id: product.id },
              });
            }
            // Jika ada orders, biarkan produk tetap ada (tidak dihapus)
          }
        }
      }
    });
    revalidatePath("/dashboard/umkm/saya");
    revalidatePath(`/umkm/${umkm.slug}`);
    return { success: true, message: "UMKM berhasil diperbarui!" };
  } catch (error) {
    console.error("Update UMKM error:", error);
    return { success: false, message: "Terjadi kesalahan pada server." };
  }
}

export async function deactivateUmkm(umkmId: number) {
  const session = await getServerSession(authOptions);
  try {
    if (!session) {
      throw new Error("Anda harus login terlebih dahulu.");
    }
    
    // Cek role dari database untuk memastikan data terbaru
    const user = await db.user.findUnique({
      where: { id: (session.user as any).id },
      select: { role: true }
    });
    
    if (!user || user.role !== "PENGUSAHA") {
      throw new Error("Akses tidak diizinkan.");
    }
    const umkmToDeactivate = await db.umkm.findUnique({
      where: { id: umkmId },
      select: { ownerId: true },
    });
    if (!umkmToDeactivate || umkmToDeactivate.ownerId !== (session.user as any).id) {
      throw new Error("Anda tidak memiliki izin untuk menonaktifkan UMKM ini.");
    }
    await db.umkm.update({ 
      where: { id: umkmId },
      data: { isActive: false }
    });
    revalidatePath("/dashboard/umkm/saya");
    return { success: true, message: "UMKM berhasil dinonaktifkan." };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Terjadi kesalahan server." };
  }
}

export async function activateUmkm(umkmId: number) {
  const session = await getServerSession(authOptions);
  try {
    if (!session) {
      throw new Error("Anda harus login terlebih dahulu.");
    }
    
    // Cek role dari database untuk memastikan data terbaru
    const user = await db.user.findUnique({
      where: { id: (session.user as any).id },
      select: { role: true }
    });
    
    if (!user || user.role !== "PENGUSAHA") {
      throw new Error("Akses tidak diizinkan.");
    }
    const umkmToActivate = await db.umkm.findUnique({
      where: { id: umkmId },
      select: { ownerId: true },
    });
    if (!umkmToActivate || umkmToActivate.ownerId !== (session.user as any).id) {
      throw new Error("Anda tidak memiliki izin untuk mengaktifkan UMKM ini.");
    }
    await db.umkm.update({ 
      where: { id: umkmId },
      data: { isActive: true }
    });
    revalidatePath("/dashboard/umkm/saya");
    return { success: true, message: "UMKM berhasil diaktifkan." };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Terjadi kesalahan server." };
  }
}
