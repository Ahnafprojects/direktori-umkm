// src/app/api/favorites/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { db } from "@/lib/prisma";

// GET - Ambil semua favorites user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await db.favorite.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        umkmId: true,
        createdAt: true,
        umkm: {
          select: {
            id: true,
            name: true,
            slug: true,
            photos: true,
            rating: true,
            address: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Return hanya array umkmId untuk kompatibilitas dengan store
    const favoriteIds = favorites.map((fav: any) => fav.umkmId);

    return NextResponse.json({
      favoriteIds,
      favorites: favorites.map((fav: any) => ({
        umkmId: fav.umkmId,
        createdAt: fav.createdAt,
        umkm: fav.umkm,
      })),
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Toggle favorite
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { umkmId } = await request.json();

    if (!umkmId || typeof umkmId !== "number") {
      return NextResponse.json({ error: "Invalid umkmId" }, { status: 400 });
    }

    // Cek apakah UMKM exists
    const umkm = await db.umkm.findUnique({
      where: { id: umkmId },
    });

    if (!umkm) {
      return NextResponse.json({ error: "UMKM not found" }, { status: 404 });
    }

    // Cek apakah sudah difavorite
    const existingFavorite = await db.favorite.findUnique({
      where: {
        userId_umkmId: {
          userId: session.user.id,
          umkmId: umkmId,
        },
      },
    });

    if (existingFavorite) {
      // Jika sudah ada, hapus (unfavorite)
      await db.favorite.delete({
        where: {
          userId_umkmId: {
            userId: session.user.id,
            umkmId: umkmId,
          },
        },
      });

      return NextResponse.json({
        success: true,
        action: "removed",
        message: "Removed from favorites",
      });
    } else {
      // Jika belum ada, tambah (favorite)
      await db.favorite.create({
        data: {
          userId: session.user.id,
          umkmId: umkmId,
        },
      });

      return NextResponse.json({
        success: true,
        action: "added",
        message: "Added to favorites",
      });
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
