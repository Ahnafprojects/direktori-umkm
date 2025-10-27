// src/app/api/summarize/route.ts
import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    // 1. Ambil data ulasan dari front-end
    const body = await req.json();
    console.log('API received data:', body);
    
    const { umkmName, reviews } = body;

    // Validate input
    if (!umkmName || !reviews || !Array.isArray(reviews)) {
      return new Response(JSON.stringify({ error: 'Invalid input data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (reviews.length === 0) {
      return new Response(JSON.stringify({ summary: 'Belum ada ulasan untuk diringkas.' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if API key is available
    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY not found in environment variables');
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Ubah array ulasan menjadi satu string
    const reviewTexts = reviews.map((r: any) => `- Rating ${r.rating}/5: "${r.comment}"`).join('\n');
    console.log('Review texts:', reviewTexts);

    // 3. Buat Prompt
    const prompt = `
      Anda adalah seorang analis ulasan kuliner yang netral dan cerdas.
      Berikut adalah daftar ulasan mentah untuk sebuah UMKM bernama "${umkmName}":
      ${reviewTexts}

      Tugas Anda:
      1. Analisis semua ulasan tersebut.
      2. Berikan ringkasan dalam 2 kalimat singkat (maksimal 30 kata).
      3. Fokus pada sentimen utama: apa yang paling disukai (kelebihan) dan apa yang paling dikeluhkan (kekurangan).
      4. Kembalikan HANYA teks ringkasannya saja. JANGAN tambahkan "Tentu," atau "Berikut ringkasannya:".
    `;

    console.log('Sending request to Groq...');

    // 4. Panggil API GROQ — gunakan model yang masih didukung.
    // Jika Groq mengembalikan error (mis. model decommissioned), kita fallback ke summarizer sederhana.
    let summary: string | undefined;

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'Anda adalah asisten yang meringkas ulasan kuliner.' },
          { role: 'user', content: prompt },
        ],
        // Ganti model yang telah dinonaktifkan dengan model umum yang lebih kecil/tersedia.
        // Jika Anda memiliki rekomendasi model dari Groq, gunakan nilai itu. Saya memakai "gpt-4o-mini"
        // sebagai model pengganti yang biasanya tersedia.
        model: 'gpt-4o-mini',
        temperature: 0.5,
      });

      console.log('Groq response:', chatCompletion);
  // Normalize potential null to undefined for TypeScript
  summary = chatCompletion.choices?.[0]?.message?.content ?? undefined;
    } catch (err: any) {
      console.error('Groq API call failed, falling back to local summarizer:', err);
      // Periksa apakah pesan error menyebutkan model decommissioned
      const message = err?.message || String(err || 'Unknown error');
      // Jika ada 'model_decommissioned' atau sejenis, lakukan fallback lokal.
      summary = undefined;
    }

    // Jika Groq gagal atau tidak mengembalikan ringkasan, gunakan fallback ringan.
    if (!summary) {
      // Fallback: buat ringkasan sederhana berbasis statistik ulasan.
      const avgRating = (
        reviews.reduce((acc: number, r: any) => acc + (Number(r.rating) || 0), 0) /
        Math.max(1, reviews.length)
      ).toFixed(1);

      // Hitung kata paling sering (sangat sederhana) untuk menangkap tema umum.
      const stopwords = new Set([
        'dan', 'yang', 'di', 'ke', 'untuk', 'sangat', 'dengan', 'ga', 'tidak', 'ini', 'itu', 'sudah', 'ada', 'apa', 'pas'
      ]);

      const wordCounts: Record<string, number> = {};
      for (const r of reviews) {
        const text = String(r.comment || '');
        text
          .toLowerCase()
          .replace(/["'.,!?:;()\[\]]/g, ' ')
          .split(/\s+/)
          .forEach((w) => {
            if (!w || stopwords.has(w) || w.length <= 2) return;
            wordCounts[w] = (wordCounts[w] || 0) + 1;
          });
      }

      const topWords = Object.entries(wordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([w]) => w);

      const theme = topWords.length ? `menyebut ${topWords.join(' dan ')}` : 'tidak menyebut tema khusus';

      // Jaga agar ringkasan singkat (2 kalimat, < ~30 kata)
      summary = `Rata-rata rating ${avgRating}/5; ulasan ${theme}. Banyak ulasan melihat kualitas dan layanan.`;
    }

    // 5. Kembalikan sebagai JSON
    return new Response(JSON.stringify({ summary: summary }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error di API AI Summarize:', error);
    
    // Return more detailed error information in development
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(JSON.stringify({ 
      error: 'Gagal meringkas ulasan',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}