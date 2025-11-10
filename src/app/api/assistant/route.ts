// src/app/api/assistant/route.ts
import { Groq } from 'groq-sdk';
import { db } from '@/lib/prisma';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export const runtime = 'nodejs';

// --- PENGETAHUAN STATIS TENTANG WEBSITE KITA ---
const STATIC_KNOWLEDGE = `
Cara Kerja Website LokalKeren:
- Pembayaran: Pembayaran di website ini adalah 100% simulasi. Setelah checkout, pesanan dianggap berhasil.
- Status Pesanan: Setelah bayar, pengguna akan masuk ke halaman /status untuk melihat simulasi driver.
- Histori: Semua pesanan yang berhasil akan tersimpan di halaman /history (Riwayat Pesanan).
- Favorit: Pengguna bisa menyimpan UMKM dengan mengklik ikon Hati. Jika login, data disimpan di akun. Jika tidak, disimpan di browser.
- Rekomendasi AI: Di Halaman Utama, ada rekomendasi AI yang mempelajari UMKM favorit pengguna.
- Ulasan: Pengguna yang sudah login bisa menulis ulasan di Halaman Detail UMKM.
- Ringkasan AI: Di Halaman Detail, ada tombol AI untuk meringkas semua ulasan.
`;
// ---------------------------------------------

export async function POST(req: Request) {
  try {
    // 1. Ambil histori chat & pertanyaan baru dari user
    const { messages } = await req.json(); // messages adalah array [{ role: 'user', content: '...' }]

    // 2. Cek apakah ada pertanyaan user terakhir
    const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    
    // 3. Fallback responses untuk pertanyaan umum (tanpa perlu DB)
    if (lastUserMessage.includes('terdekat') || lastUserMessage.includes('lokasi') || lastUserMessage.includes('dekat saya')) {
      return new Response(JSON.stringify({ 
        response: "📍 **Mencari UMKM Terdekat:**\n\n🎯 **Cara Pakai Fitur Lokasi:**\n• Klik tombol **\"Find Nearest\"** 📍 di halaman utama\n• Izinkan akses lokasi di browser\n• Website akan otomatis urutkan UMKM berdasarkan jarak\n\n🗺️ **Lihat di Peta:**\n• Klik tab **\"Map\"** untuk melihat semua UMKM di peta\n• Zoom in/out untuk area yang diinginkan\n• Klik marker untuk detail UMKM\n\n📋 **Tips:**\n• Pastikan GPS aktif untuk akurasi terbaik\n• Filter berdasarkan kategori sambil pakai lokasi\n• Cek jam buka sebelum berkunjung\n\n📱 Semua UMKM menampilkan alamat lengkap dan estimasi jarak!" 
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (lastUserMessage.includes('jam') || lastUserMessage.includes('buka') || lastUserMessage.includes('tutup')) {
      return new Response(JSON.stringify({ 
        response: "🕐 **Jam Operasional UMKM:**\n\nUmumnya UMKM di LokalKeren buka dari **jam 10:00 - 21:00**. \n\n⏰ **Untuk jam buka spesifik:**\n• Cek detail setiap UMKM di halaman utama\n• Informasi jam buka ada di kartu UMKM\n• Beberapa warung buka lebih pagi (08:00)\n• Ada yang tutup lebih malam (22:00-23:00)\n\n💡 **Tips:** Selalu cek jam buka sebelum pesan, terutama saat weekend atau hari libur!" 
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (lastUserMessage.includes('cara kerja') || lastUserMessage.includes('gimana cara') || lastUserMessage.includes('cara website')) {
      return new Response(JSON.stringify({ 
        response: "🌟 **Cara Kerja Website LokalKeren:**\n\n📱 **Jelajahi UMKM:**\n• Lihat daftar UMKM di halaman utama\n• Filter berdasarkan kategori & lokasi\n• Baca review dari pengguna lain\n\n🛒 **Cara Pesan:**\n• Klik UMKM yang diinginkan\n• Pilih produk → Tambah ke keranjang\n• Checkout → Isi data pengiriman\n• Pilih metode pembayaran\n\n💰 **Pembayaran & Status:**\n• Pembayaran 100% SIMULASI\n• Setelah checkout → Lihat status pesanan\n• Tracking driver di halaman /status\n\n❤️ **Fitur Lainnya:**\n• Simpan UMKM favorit\n• Tulis review setelah pesan\n• Lihat riwayat pesanan\n• Chat dengan AI (ini!) untuk rekomendasi\n\n🎯 Semua transaksi adalah demo untuk showcase!" 
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (lastUserMessage.includes('cara') || lastUserMessage.includes('pesan') || lastUserMessage.includes('checkout')) {
      return new Response(JSON.stringify({ 
        response: "🛒 **Cara Pesan di LokalKeren:**\n\n1️⃣ **Pilih UMKM** yang menarik dari daftar\n2️⃣ **Tambahkan produk** ke keranjang belanja\n3️⃣ **Klik ikon keranjang** (pojok kanan atas)\n4️⃣ **Isi data pengiriman** lengkap\n5️⃣ **Pilih metode pembayaran** (QRIS, E-wallet, dll)\n6️⃣ **Klik Checkout** untuk menyelesaikan\n\n📍 **Opsi Pengiriman:**\n• 🏃‍♂️ **Pickup** - Ambil sendiri di lokasi UMKM\n• 🛵 **Delivery** - Diantar ke alamat Anda\n\n💡 **Catatan**: Pembayaran di website ini adalah **simulasi**, jadi pesanan langsung berhasil dan masuk ke tracking!" 
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // SMART AI - Bisa baca semua data UMKM dengan rating dan review
    try {
      // Ambil SEMUA data UMKM dengan rating, review, dan produk
      const allUmkms = await db.umkm.findMany({
        include: {
          Category: true,
          ProductCategory: {
            include: {
              Product: true // Ambil semua produk, bukan cuma featured
            }
          },
          Review: {
            select: {
              rating: true,
              comment: true,
              user: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 10 // Ambil 10 review terbaru untuk context
          },
          _count: {
            select: {
              favorites: true,
              Review: true
            }
          }
        }
      });

      // Hitung rata-rata rating untuk setiap UMKM
      const umkmsWithRating = allUmkms.map((umkm: any) => ({
        ...umkm,
        avgRating: umkm.Review.length > 0 
          ? (umkm.Review.reduce((sum: number, review: any) => sum + review.rating, 0) / umkm.Review.length).toFixed(1)
          : 0,
        allProducts: umkm.ProductCategory.flatMap((pc: any) => pc.Product)
      }));

      // Deteksi berbagai jenis pertanyaan - makanan & aktivitas
      const searchKeywords: Record<string, {keywords: string[], category?: string, description: string}> = {
        // Makanan spesifik
        'pecel': {keywords: ['pecel'], description: 'Pecel Enak'},
        'kebab': {keywords: ['kebab'], description: 'Kebab Lezat'},  
        'pizza': {keywords: ['pizza'], description: 'Pizza Favorit'},
        'nasi': {keywords: ['nasi', 'rice'], description: 'Nasi & Lauk'},
        'bakso': {keywords: ['bakso', 'baso'], description: 'Bakso Mantap'},
        'ayam': {keywords: ['ayam', 'chicken'], description: 'Ayam Crispy'},
        'sate': {keywords: ['sate', 'satay'], description: 'Sate Bakar'},
        'burger': {keywords: ['burger'], description: 'Burger Juicy'},
        'kopi': {keywords: ['kopi', 'coffee'], category: 'Minuman', description: 'Kopi Nikmat'},
        'teh': {keywords: ['teh', 'tea'], category: 'Minuman', description: 'Teh Segar'},
        
        // Aktivitas & suasana
        'nongkrong': {keywords: ['nongkrong', 'hangout', 'santai', 'bersantai'], category: 'Minuman', description: 'Tempat Nongkrong Asik'},
        'nugas': {keywords: ['nugas', 'tugaskuliah', 'belajar', 'study', 'ngerjain tugas'], category: 'Minuman', description: 'Tempat Buat Nugas'},
        'kerja': {keywords: ['kerja', 'work', 'freelance', 'meeting'], category: 'Minuman', description: 'Tempat Kerja Nyaman'},
        'wifi': {keywords: ['wifi', 'internet', 'online'], category: 'Minuman', description: 'Tempat dengan WiFi'},
        'coworking': {keywords: ['coworking', 'workspace', 'kantor'], category: 'Minuman', description: 'Coworking Space'},
        
        // Suasana
        'tenang': {keywords: ['tenang', 'sepi', 'quiet'], description: 'Tempat Tenang'},
        'ramai': {keywords: ['ramai', 'rame', 'crowded', 'lively'], description: 'Tempat Ramai & Seru'},
        'romantis': {keywords: ['romantis', 'date', 'pacaran'], description: 'Tempat Romantis'},
        'keluarga': {keywords: ['keluarga', 'family', 'anak'], description: 'Tempat Family Friendly'}
      };

      let searchResults: any[] = [];
      let searchFood = '';
      let searchCategory = '';

      // Cari berdasarkan kata kunci yang diperluas
      for (const [type, config] of Object.entries(searchKeywords)) {
        if (config.keywords.some((keyword: string) => lastUserMessage.includes(keyword))) {
          searchFood = config.description;
          searchCategory = config.category || '';
          
          // Filter UMKM berdasarkan kategori atau kata kunci
          searchResults = umkmsWithRating.filter((umkm: any) => {
            // Jika ada kategori spesifik, filter berdasarkan kategori
            if (searchCategory && umkm.Category.name.toLowerCase().includes(searchCategory.toLowerCase())) {
              return true;
            }
            
            // Cek nama UMKM
            if (umkm.name.toLowerCase().includes(type.toLowerCase())) return true;
            
            // Cek nama produk
            const hasProductMatch = umkm.allProducts.some((product: any) => 
              config.keywords.some((keyword: string) => 
                product.name.toLowerCase().includes(keyword.toLowerCase())
              )
            );
            if (hasProductMatch) return true;
            
            // Cek deskripsi UMKM  
            if (umkm.description && config.keywords.some((keyword: string) => 
              umkm.description.toLowerCase().includes(keyword.toLowerCase())
            )) return true;
            
            return false;
          });
          break;
        }
      }

      // Jika tidak ada makanan spesifik, cari yang populer
      if (searchResults.length === 0 && (lastUserMessage.includes('rekomendasi') || lastUserMessage.includes('enak'))) {
        searchResults = umkmsWithRating.slice(0, 5);
        searchFood = 'UMKM populer';
      }

      if (searchResults.length > 0) {
        // Sort berdasarkan rating tertinggi, lalu favorit terbanyak
        searchResults.sort((a: any, b: any) => {
          if (parseFloat(b.avgRating) !== parseFloat(a.avgRating)) {
            return parseFloat(b.avgRating) - parseFloat(a.avgRating);
          }
          return b._count.favorites - a._count.favorites;
        });

        const topResults = searchResults.slice(0, 3);
        
        // Respons yang lebih kontekstual
        let responseIntro = '';
        if (searchFood.includes('Nongkrong') || searchFood.includes('Nugas') || searchFood.includes('Kerja')) {
          responseIntro = `☕ **${searchFood}** - Rekomendasi Tempat Asik:\n\n`;
        } else if (searchFood.includes('Tenang') || searchFood.includes('WiFi')) {
          responseIntro = `🤫 **${searchFood}** - Tempat yang Cocok:\n\n`;
        } else {
          responseIntro = `🔍 **${searchFood}** - Hasil Pencarian:\n\n`;
        }
        
        let response = responseIntro;
        
        topResults.forEach((umkm: any, index: number) => {
          // Ambil produk yang relevan dengan pencarian
          const relevantProducts = umkm.allProducts.filter((product: any) => {
            // Jika pencarian umum, tampilkan semua produk
            if (searchFood.includes('populer') || searchFood.includes('Populer')) return true;
            
            // Cari produk yang cocok dengan kata kunci pencarian
            const searchType = Object.entries(searchKeywords).find(([_, config]) => 
              config.description === searchFood
            );
            
            if (searchType) {
              return searchType[1].keywords.some((keyword: string) => 
                product.name.toLowerCase().includes(keyword.toLowerCase())
              );
            }
            
            return true; // Default tampilkan semua
          }).slice(0, 3);

          const recentReview = umkm.Review[0];
          
          response += `${index + 1}. **${umkm.name}** ⭐ ${umkm.avgRating}/5\n`;
          response += `   📍 ${umkm.address}\n`;
          response += `   ❤️ ${umkm._count.favorites} favorit • 📝 ${umkm._count.Review} review\n`;
          response += `   🏷️ ${umkm.Category.name}\n`;
          
          if (relevantProducts.length > 0) {
            response += `   🍽️ Menu: ${relevantProducts.map((p: any) => p.name).join(', ')}\n`;
          }
          
          if (recentReview) {
            response += `   � "${recentReview.comment}" - ${recentReview.user.name}\n`;
          }
          
          response += '\n';
        });

        // Tips kontekstual berdasarkan jenis pencarian
        if (searchFood.includes('Nongkrong')) {
          response += '💡 **Tips Nongkrong**: Cari tempat dengan suasana santai, harga terjangkau, dan WiFi stabil!';
        } else if (searchFood.includes('Nugas')) {
          response += '📚 **Tips Nugas**: Pilih tempat tenang dengan colokan listrik dan WiFi kenceng. Jangan lupa beli minuman biar betah!';
        } else if (searchFood.includes('Kerja')) {
          response += '� **Tips Kerja**: Cari tempat dengan WiFi stabil, tidak terlalu berisik, dan nyaman untuk laptop!';
        } else {
          response += '�💡 Rekomendasi berdasarkan rating tertinggi dan review terbanyak!';
        }

        return new Response(JSON.stringify({ response }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

    } catch (error) {
      console.error('Smart AI error:', error);
      
      // FALLBACK: Query database langsung untuk rekomendasi
      if (lastUserMessage.includes('rekomendasi') || lastUserMessage.includes('enak') || lastUserMessage.includes('bagus')) {
        try {
          const popularUmkms = await db.umkm.findMany({
            include: {
              Category: true,
              ProductCategory: {
                include: { Product: true }
              },
              _count: { select: { favorites: true } }
            },
            orderBy: {
              favorites: { _count: 'desc' }
            },
            take: 10
          });
          
          if (popularUmkms.length > 0) {
            
            // Deteksi makanan yang dicari
            let searchFood = 'UMKM terpopuler';
            let filteredResults = popularUmkms;
            
            if (lastUserMessage.includes('pecel')) {
              searchFood = 'Pecel';
              filteredResults = popularUmkms.filter((u: any) => 
                u.name.toLowerCase().includes('pecel') ||
                (u.ProductCategory && u.ProductCategory.some((pc: any) => 
                  pc.Product.some((p: any) => p.name.toLowerCase().includes('pecel'))
                ))
              );
            } else if (lastUserMessage.includes('kebab')) {
              searchFood = 'Kebab';
              filteredResults = popularUmkms.filter((u: any) => 
                u.name.toLowerCase().includes('kebab') ||
                (u.ProductCategory && u.ProductCategory.some((pc: any) => 
                  pc.Product.some((p: any) => p.name.toLowerCase().includes('kebab'))
                ))
              );
            } else if (lastUserMessage.includes('pizza')) {
              searchFood = 'Pizza';
              filteredResults = popularUmkms.filter((u: any) => 
                u.name.toLowerCase().includes('pizza') ||
                (u.ProductCategory && u.ProductCategory.some((pc: any) => 
                  pc.Product.some((p: any) => p.name.toLowerCase().includes('pizza'))
                ))
              );
            } else if (lastUserMessage.includes('nasi')) {
              searchFood = 'Nasi';
              filteredResults = popularUmkms.filter((u: any) => 
                u.name.toLowerCase().includes('nasi') ||
                (u.ProductCategory && u.ProductCategory.some((pc: any) => 
                  pc.Product.some((p: any) => p.name.toLowerCase().includes('nasi'))
                ))
              );
            }
            
            if (filteredResults.length > 0) {
              let responseText = `🍽️ **${searchFood} Terbaik** berdasarkan popularitas:\n\n`;
              
              filteredResults.slice(0, 3).forEach((umkm: any, index: number) => {
                responseText += `**${index + 1}. ${umkm.name}**\n`;
                responseText += `📍 ${umkm.address}\n`;
                responseText += `❤️ ${umkm._count?.favorites || 0} favorit\n`;
                responseText += `🏷️ ${umkm.Category?.name || 'Makanan'}\n\n`;
              });
              
              responseText += `💡 Data diambil dari database LokalKeren berdasarkan jumlah favorit pengguna!`;
              
              return new Response(JSON.stringify({ response: responseText }), {
                headers: { 'Content-Type': 'application/json' },
              });
            }
          }
        } catch (dbError) {
          console.error('Database fallback failed:', dbError);
        }
      }
    }

    // Final fallback untuk rekomendasi umum
    if (lastUserMessage.includes('rekomendasi') || lastUserMessage.includes('enak') || lastUserMessage.includes('bagus') || 
        lastUserMessage.includes('pecel') || lastUserMessage.includes('kebab') || lastUserMessage.includes('pizza') || lastUserMessage.includes('nasi')) {
      
      const foodRequested = lastUserMessage.includes('pecel') ? 'pecel' : 
                           lastUserMessage.includes('kebab') ? 'kebab' : 
                           lastUserMessage.includes('pizza') ? 'pizza' : 
                           lastUserMessage.includes('nasi') ? 'nasi' : 'makanan enak';
      
      return new Response(JSON.stringify({ 
        response: `🔍 Maaf, saya sedang mengalami kendala dalam mengakses database untuk mencari ${foodRequested} yang enak.

💡 **Sementara ini, silakan coba:**
🌟 Buka halaman utama dan lihat 'Rekomendasi Terpopuler'
🔍 Gunakan fitur pencarian dengan kata kunci "${foodRequested}"
📂 Filter berdasarkan kategori makanan
📍 Cek UMKM terdekat dari lokasi Anda

Semua UMKM diurutkan berdasarkan jumlah favorit dan review pengguna LokalKeren! 

🚀 Coba tanya lagi nanti, sistem sedang diperbaiki.` 
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 4. Coba ambil data UMKM dari DB (jika berhasil, lanjut ke AI)
    let umkmData = [];
    try {
      umkmData = await db.umkm.findMany({
        select: {
          name: true,
          description: true,
          address: true,
          openingHours: true,
          Category: { select: { name: true } },
          ProductCategory: {
            select: {
              name: true,
              Product: { select: { name: true, price: true } },
            },
          },
        },
        take: 20 // Batasi untuk performance
      });
    } catch (dbError) {
      console.error('Database error, using fallback response:', dbError);
      
      // Fallback response jika database error
      return new Response(JSON.stringify({ 
        response: "Maaf, sistem sedang mengalami gangguan database. Tapi saya tetap bisa membantu!\n\n🏪 Silakan jelajahi UMKM di halaman utama\n⭐ Cek bagian rekomendasi populer\n📱 Gunakan fitur pencarian untuk menemukan UMKM\n\nAda yang bisa saya bantu lainnya?" 
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 5. Format data DB menjadi teks sederhana (jika ada data)
    const dynamicContext = umkmData.length > 0 ? umkmData
      .map(
        (umkm: any) =>
          `UMKM: ${umkm.name}\nKategori: ${umkm.Category?.name || 'Tidak ada kategori'}\nAlamat: ${umkm.address}\nJam Buka: ${umkm.openingHours || 'Tidak disebutkan'}\nDeskripsi: ${umkm.description}\nProduk: ${umkm.ProductCategory?.map((pcat: any) => pcat.Product?.map((p: any) => p.name).join(', ')).join('; ') || 'Tidak ada produk'}\n---`
      )
      .join('\n') : 'Data UMKM tidak tersedia saat ini.';

    // 6. Jika ada GROQ API key, coba panggil AI
    if (process.env.GROQ_API_KEY && groq) {
      try {
        // Bangun "Mega-Prompt"
        const systemPrompt = `
          Anda adalah "LokalKeren AI", asisten virtual yang sangat membantu.
          Tugas Anda adalah menjawab pertanyaan pengguna HANYA BERDASARKAN konteks yang saya berikan.
          JANGAN PERNAH menjawab pertanyaan di luar konteks. Jika ditanya (misal: "Siapa presiden?", "berita hari ini"), jawab dengan "Maaf, saya hanya bisa membantu dengan pertanyaan seputar UMKM di LokalKeren."
          Selalu jawab dalam Bahasa Indonesia yang ramah dan gunakan emoji untuk menarik.

          KONTEKS STATIS (Cara Kerja Website):
          ${STATIC_KNOWLEDGE}

          KONTEKS DINAMIS (Daftar UMKM dari Database):
          ${dynamicContext}
        `;

        // Panggil API GROQ
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            // Kirim instruksi sistem
            { role: 'system', content: systemPrompt },
            // Kirim histori chat sebelumnya (jika ada)
            ...messages,
          ],
          model: 'llama3-8b-8192',
          max_tokens: 500,
          temperature: 0.7,
        });

        const responseMessage =
          chatCompletion.choices[0].message.content || 'Maaf, saya tidak bisa merespon saat ini.';

        // Kembalikan jawaban AI
        return new Response(JSON.stringify({ response: responseMessage }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (groqError) {
        console.error('GROQ API Error:', groqError);
        // Fallback ke smart response
      }
    }

    // 7. Jika sampai sini berarti AI tidak available, beri smart fallback
    return new Response(JSON.stringify({ 
      response: "🤖 Sistem AI sedang maintenance, tapi saya tetap bisa membantu!\n\n💡 Coba:\n• Jelajahi UMKM di halaman utama\n• Gunakan fitur pencarian\n• Lihat rekomendasi populer\n• Cek kategori yang tersedia\n\nAda yang spesifik ingin ditanyakan?" 
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error di API AI Assistant:', error);
    return new Response(JSON.stringify({ error: 'Gagal mendapatkan respon AI' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}