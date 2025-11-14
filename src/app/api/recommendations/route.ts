// src/app/api/recommendations/route.ts
// TEMPORARILY DISABLED - groq-sdk removed from dependencies
import { db } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // 3. Ambil data (TIDAK BERUBAH)
    const { favoriteNames, allUmkms } = await req.json();

    // 4. Ambil data UMKM lengkap dari DB (TIDAK BERUBAH)
    const umkmDetails = await db.umkm.findMany({
      where: {
        slug: { in: allUmkms.map((u: any) => u.slug) },
        isActive: true,
      },
      select: {
        slug: true,
        name: true,
        description: true,
        Category: { select: { name: true } },
      },
    });

    // 5. Buat "Konteks" untuk AI (TIDAK BERUBAH)
    const umkmContext = umkmDetails
      .map((u: any) => `SLUG: ${u.slug}, NAMA: ${u.name}, KATEGORI: ${u.Category.name}, DESKRIPSI: ${u.description}`)
      .join('\n');

    // 6. BUAT PROMPT (SEDIKIT TWEAK UNTUK LLAMA)
    const prompt = `
      Anda adalah asisten kuliner lokal Surabaya yang sangat ahli.
      Seorang pengguna menyukai UMKM berikut: ${favoriteNames.join(', ')}.

      Berikut adalah daftar LENGKAP UMKM yang ada (jangan rekomendasikan yang sudah disukai):
      ${umkmContext}

      Tugas Anda:
      1. Pilih 3 UMKM dari daftar LENGKAP di atas yang paling mungkin disukai pengguna.
      2. Berikan alasan singkat (maksimal 10 kata) untuk setiap rekomendasi.
      3. Kembalikan HANYA dalam format JSON array yang valid. JANGAN tambahkan teks pembuka/penutup, penjelasan, atau markdown \`\`\`json.
      Format: [{\"slug\": \"slug-umkm\", \"reason\": \"Alasan singkat...\"}]
    `;

    // 7. FALLBACK IMPLEMENTATION (AI temporarily disabled)
    // Simple recommendation based on category matching
    const favoriteCategories = new Set<string>();
    
    // Get categories from user's favorites
    const favoriteUmkms = await db.umkm.findMany({
      where: { name: { in: favoriteNames } },
      include: { Category: true }
    });
    
    favoriteUmkms.forEach((umkm: any) => {
      if (umkm.Category) favoriteCategories.add(umkm.Category.name);
    });
    
    // Find similar UMKMs by category
    const similarUmkms = umkmDetails
      .filter((umkm: any) => 
        favoriteCategories.has(umkm.Category.name) && 
        !favoriteNames.includes(umkm.name)
      )
      .slice(0, 3)
      .map((umkm: any) => ({
        slug: umkm.slug,
        reason: `Kategori ${umkm.Category.name} seperti favorit Anda`
      }));
    
    // If not enough, add random ones
    if (similarUmkms.length < 3) {
      const remaining = umkmDetails
        .filter((umkm: any) => 
          !favoriteNames.includes(umkm.name) && 
          !similarUmkms.some((s: any) => s.slug === umkm.slug)
        )
        .slice(0, 3 - similarUmkms.length)
        .map((umkm: any) => ({
          slug: umkm.slug,
          reason: `UMKM populer di area Anda`
        }));
      
      similarUmkms.push(...remaining);
    }
    
    const jsonResponse = JSON.stringify(similarUmkms);

    // 9. Kembalikan JSON ke front-end (TIDAK BERUBAH)
    return new Response(jsonResponse, {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error di API AI Groq:', error);
    return new Response(JSON.stringify({ error: 'Gagal mendapatkan rekomendasi' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
