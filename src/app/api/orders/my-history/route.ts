// src/app/api/orders/my-history/route.ts
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
// --- IMPORT FUNGSI AUTENTIKASI DARI SISTEM LOGIN-MU ---
// import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    // --- DAPATKAN USER YANG LOGIN ---
    // const user = await getCurrentUser();
    // if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // const userId = user.id;

    // --- GANTI DENGAN USER ID DUMMY ---
    const userId = "1"; // HAPUS INI

    const orders = await db.order.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: true, // Ambil detail item
        umkm: {
          // Ambil info UMKM
          select: { name: true, slug: true },
        },
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { error: "Gagal mengambil riwayat" },
      { status: 500 }
    );
  }
}
