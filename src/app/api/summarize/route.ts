// src/app/api/summarize/route.ts
// TEMPORARILY DISABLED - groq-sdk removed from dependencies

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

    // AI summarization temporarily disabled - using fallback

    // 2. Ubah array ulasan menjadi satu string
    const reviewTexts = reviews.map((r: any) => `- Rating ${r.rating}/5: "${r.comment}"`).join('\n');
    console.log('Review texts:', reviewTexts);

    // 3. Buat Prompt yang lebih spesifik
    const prompt = `
      Analisis ulasan berikut untuk UMKM "${umkmName}":
      ${reviewTexts}

      Buat ringkasan 2 kalimat yang SPESIFIK tentang:
      1. Apa yang DIPUJI customer (enak/tidak, aspek tertentu)
      2. Apa yang DIKRITIK atau bisa diperbaiki (jika ada)
      
      Contoh bagus: "Bumbu pecelnya sangat enak dan porsinya besar. Hanya saja tempatnya agak sempit dan pelayanannya lambat."
      
      Jangan gunakan kata umum seperti "kualitas dan layanan". Sebutkan hal spesifik seperti rasa, harga, porsi, kebersihan.
      
      Jawab LANGSUNG tanpa pembuka:
    `;

    // 4. Use local summarization (AI temporarily disabled)
    let summary: string | undefined;
    
    // Skip AI and go directly to local summarizer
    summary = undefined;

    // Buat ringkasan manual yang SPESIFIK
    if (!summary) {
      const avgRating = (
        reviews.reduce((acc: number, r: any) => acc + (Number(r.rating) || 0), 0) /
        Math.max(1, reviews.length)
      ).toFixed(1);

      // Analisis aspek spesifik yang dipuji/dikritik
      const aspectKeywords = {
        bumbu: ['bumbu', 'sambel', 'sambal', 'pedas', 'gurih', 'asin', 'manis'],
        lauk: ['lauk', 'ayam', 'tempe', 'tahu', 'sayur', 'kerupuk', 'rempeyek'],
        rasa: ['enak', 'lezat', 'mantap', 'segar', 'hambar', 'tawar', 'keasinan'],
        porsi: ['porsi', 'banyak', 'sedikit', 'besar', 'kecil', 'kenyang'],
        harga: ['murah', 'mahal', 'terjangkau', 'hemat', 'worth', 'sebanding'],
        pelayanan: ['ramah', 'cepat', 'lambat', 'lama', 'baik', 'buruk'],
        tempat: ['bersih', 'kotor', 'nyaman', 'sempit', 'luas', 'panas', 'sejuk']
      };

      let foundAspects: { [key: string]: string[] } = {};

      // Analisis setiap aspek
      Object.entries(aspectKeywords).forEach(([aspect, keywords]) => {
        foundAspects[aspect] = [];
        reviews.forEach((r: any) => {
          const comment = String(r.comment || '').toLowerCase();
          keywords.forEach(keyword => {
            if (comment.includes(keyword) && !foundAspects[aspect].includes(keyword)) {
              foundAspects[aspect].push(keyword);
            }
          });
        });
      });

      // Buat ringkasan berdasarkan aspek yang ditemukan
      let sentence1 = '';
      let sentence2 = '';

      // Cari aspek yang paling sering dipuji
      const praisedAspects: string[] = [];
      const criticizedAspects: string[] = [];

      // Analisis aspek yang dipuji vs dikritik
      Object.entries(foundAspects).forEach(([aspect, keywords]) => {
        if (keywords.length === 0) return;
        
        const positiveKeywords = keywords.filter(k => 
          ['enak', 'lezat', 'mantap', 'segar', 'murah', 'bersih', 'ramah', 'cepat', 'banyak', 'besar', 'terjangkau', 'nyaman'].includes(k)
        );
        const negativeKeywords = keywords.filter(k => 
          ['hambar', 'mahal', 'kotor', 'lambat', 'sedikit', 'kecil', 'sempit', 'lama', 'buruk'].includes(k)
        );

        if (positiveKeywords.length > negativeKeywords.length) {
          praisedAspects.push(`${aspect}nya ${positiveKeywords[0]}`);
        } else if (negativeKeywords.length > 0) {
          criticizedAspects.push(`${aspect}nya ${negativeKeywords[0]}`);
        }
      });

      // Buat kalimat pertama
      if (praisedAspects.length > 0) {
        sentence1 = `Customer memuji ${praisedAspects.slice(0, 2).join(' dan ')} dengan rating ${avgRating}/5.`;
      } else {
        sentence1 = `Mendapat rating rata-rata ${avgRating}/5 dari ${reviews.length} ulasan.`;
      }

      // Buat kalimat kedua
      if (criticizedAspects.length > 0) {
        sentence2 = `Ada keluhan tentang ${criticizedAspects.slice(0, 2).join(' dan ')}.`;
      } else if (praisedAspects.length > 2) {
        sentence2 = `Juga dipuji ${praisedAspects.slice(2, 4).join(' dan ')}.`;
      } else {
        sentence2 = `Umumnya mendapat respon positif dari pengunjung.`;
      }

      summary = `${sentence1} ${sentence2}`;
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
