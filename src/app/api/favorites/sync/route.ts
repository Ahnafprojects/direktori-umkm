// src/app/api/favorites/sync/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/lib/prisma";

// POST - Sinkronisasi favorites dari localStorage ke database
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { favoriteIds } = await request.json();

    if (!Array.isArray(favoriteIds)) {
      return NextResponse.json(
        { error: "favoriteIds must be an array" },
        { status: 400 }
      );
    }

    // Validasi semua umkmId exists
    const validUmkmIds = await db.umkm.findMany({
      where: {
        id: { in: favoriteIds },
      },
      select: { id: true },
    });

    const validIds = validUmkmIds.map((umkm: any) => umkm.id);

    // Ambil favorites yang sudah ada di database untuk user ini
    const existingFavorites = await db.favorite.findMany({
      where: {
        userId: session.user.id,
      },
      select: { umkmId: true },
    });

    const existingIds = existingFavorites.map((fav: any) => fav.umkmId);

    // Tentukan yang perlu ditambah (ada di localStorage tapi belum di database)
    const toAdd = validIds.filter((id: any) => !existingIds.includes(id));

    // Tentukan yang perlu dihapus (ada di database tapi tidak di localStorage)
    const toRemove = existingIds.filter((id: any) => !validIds.includes(id));

    // Batch operations
    const operations = [];

    // Tambah favorites baru
    if (toAdd.length > 0) {
      operations.push(
        db.favorite.createMany({
          data: toAdd.map((umkmId: any) => ({
            userId: session.user.id,
            umkmId: umkmId,
          })),
          skipDuplicates: true,
        })
      );
    }

    // Hapus favorites yang tidak ada di localStorage
    if (toRemove.length > 0) {
      operations.push(
        db.favorite.deleteMany({
          where: {
            userId: session.user.id,
            umkmId: { in: toRemove },
          },
        })
      );
    }

    // Jalankan semua operasi
    if (operations.length > 0) {
      await db.$transaction(operations);
    }

    // Return favorites terbaru dari database
    const finalFavorites = await db.favorite.findMany({
      where: {
        userId: session.user.id,
      },
      select: { umkmId: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      message: "Favorites synchronized successfully",
      favoriteIds: finalFavorites.map((fav: any) => fav.umkmId),
      stats: {
        added: toAdd.length,
        removed: toRemove.length,
        total: finalFavorites.length,
      },
    });
  } catch (error) {
    console.error("Error syncing favorites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
