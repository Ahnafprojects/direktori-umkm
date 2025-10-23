// src/app/api/recommendations/route.ts
import { Groq } from 'groq-sdk'; // <-- 1. GANTI IMPORT
import { db } from '@/lib/prisma';

// 2. INISIALISASI GROQ
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export const runtime = 'edge'; // Groq SDK v2 sangat cepat & support edge

export async function POST(req: Request) {
  try {
    // 3. Ambil data (TIDAK BERUBAH)
    const { favoriteNames, allUmkms } = await req.json();

    // 4. Ambil data UMKM lengkap dari DB (TIDAK BERUBAH)
    const umkmDetails = await db.umkm.findMany({
      where: {
        slug: { in: allUmkms.map((u: any) => u.slug) },
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
      .map((u) => `SLUG: ${u.slug}, NAMA: ${u.name}, KATEGORI: ${u.Category.name}, DESKRIPSI: ${u.description}`)
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

    // 7. PANGGIL API GROQ
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Kamu adalah asisten ahli yang HANYA merespon dengan format JSON array yang valid, tanpa teks lain.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama3-8b-8192', // Model Llama 3 8B (Super Cepat)
      temperature: 0.7,
    });

    // 8. Ambil responnya
    const jsonResponse = chatCompletion.choices[0].message.content;

    if (!jsonResponse) {
      throw new Error("AI tidak memberikan respon.");
    }

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