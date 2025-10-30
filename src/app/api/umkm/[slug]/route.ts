// src/app/api/umkm/[slug]/route.ts
import { db } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const umkm = await db.umkm.findUnique({
      where: { slug },
      include: {
        Category: true,
        ProductCategory: {
          include: {
            Product: {
              where: { isFeatured: true },
              take: 2,
            },
          },
        },
      },
    });

    if (!umkm) {
      return new Response(JSON.stringify({ error: "UMKM not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Serialize Decimal fields to numbers
    const serializedUmkm = {
      ...umkm,
      rating: umkm.rating ? Number(umkm.rating) : null,
    };

    return new Response(JSON.stringify(serializedUmkm), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching UMKM:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
