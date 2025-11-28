// src/app/api/assistant/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/prisma";

// Initialize Gemini AI
console.log("Initializing Gemini AI...");
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export const runtime = "nodejs";

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
    const lastUserMessage =
      messages[messages.length - 1]?.content?.toLowerCase() || "";

    // 3. Fallback responses untuk pertanyaan umum (tanpa perlu DB)

    // Pertanyaan tentang PETA / MENCARI UMKM
    if (
      lastUserMessage.includes("peta") ||
      lastUserMessage.includes("map") ||
      (lastUserMessage.includes("cara") &&
        lastUserMessage.includes("mencari")) ||
      (lastUserMessage.includes("bagaimana") &&
        lastUserMessage.includes("mencari"))
    ) {
      return new Response(
        JSON.stringify({
          response:
            '🗺️ **Cara Mencari UMKM di Peta:**\n\n✨ **Di halaman utama, ada 3 fitur unggulan:**\n1. **"Buka Sekarang"** - Lihat UMKM yang sedang buka\n2. **"Lokasi Terdekat"** - Temukan UMKM di sekitar Anda\n3. **"Lihat Peta UMKM"** - Buka peta interaktif lengkap\n\n🗺️ **Cara menggunakan peta:**\n• Klik **"Lihat Peta UMKM"** di halaman utama\n• Pilih **filter kategori** (Makanan, Minuman, Jasa, Fashion, dll)\n• Klik **marker UMKM** di peta untuk detail & navigasi\n• Gunakan **"Dapatkan Arah"** untuk GPS navigation\n\n📍 **Tips**: Aktifkan lokasi browser untuk hasil yang lebih akurat!',
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Pertanyaan tentang LIVE TRACKING / NAVIGASI
    if (
      lastUserMessage.includes("tracking") ||
      lastUserMessage.includes("navigasi") ||
      lastUserMessage.includes("fitur live") ||
      (lastUserMessage.includes("live") && lastUserMessage.includes("track"))
    ) {
      return new Response(
        JSON.stringify({
          response:
            '📍 **Fitur Live Tracking & Navigasi:**\n\n🚚 **Live Tracking Pesanan:**\n• Setelah checkout, buka halaman **/status**\n• Lihat simulasi driver yang sedang mengantar\n• Tracking real-time dengan peta interaktif\n• Estimasi waktu kedatangan ditampilkan\n\n🗺️ **Navigasi ke UMKM:**\n• Klik UMKM di peta atau halaman detail\n• Pilih **"Dapatkan Arah"** atau **"Navigasi"**\n• Website akan buka Google Maps untuk navigasi\n• Bisa pakai GPS untuk rute tercepat\n\n📱 **Tips:**\n• Aktifkan GPS untuk tracking akurat\n• Gunakan mode fullscreen untuk peta yang lebih besar\n• Refresh halaman jika tracking tidak update',
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Pertanyaan tentang DAFTAR PEMILIK UMKM
    if (
      (lastUserMessage.includes("daftar") &&
        lastUserMessage.includes("umkm")) ||
      (lastUserMessage.includes("daftar") &&
        lastUserMessage.includes("pemilik")) ||
      lastUserMessage.includes("cara daftar sebagai") ||
      lastUserMessage.includes("jadi pemilik")
    ) {
      return new Response(
        JSON.stringify({
          response:
            '🏪 **Cara Daftar Sebagai Pemilik UMKM:**\n\n**Langkah-langkah:**\n1. **Login** ke akun Anda terlebih dahulu\n2. Klik **menu hamburger** (☰ - 3 garis) di pojok kanan atas\n3. Pilih **"Profil"** dari menu dropdown\n4. Di halaman profil, klik **"UMKM Saya"**\n5. Kemudian klik **"Daftarkan UMKM Saya"**\n6. Isi form pendaftaran dengan lengkap:\n   • Nama UMKM\n   • Kategori bisnis\n   • Alamat lengkap\n   • Foto UMKM\n   • Jam operasional\n   • Deskripsi & kontak\n7. Klik **"Daftar"** untuk submit\n\n✨ **Setelah Daftar:**\n• Akun otomatis upgrade jadi **Pemilik UMKM**\n• Bisa tambahkan produk & kategori produk\n• Kelola pesanan masuk dari dashboard\n• Lihat analytics & statistik penjualan\n• Balas review dari pelanggan\n\n💡 **Tips:** Lengkapi semua data agar UMKM mudah ditemukan pelanggan!',
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Pertanyaan tentang RATING & REVIEW
    if (
      lastUserMessage.includes("rating") ||
      lastUserMessage.includes("review") ||
      lastUserMessage.includes("ulasan") ||
      (lastUserMessage.includes("sistem") &&
        (lastUserMessage.includes("rating") ||
          lastUserMessage.includes("review")))
    ) {
      return new Response(
        JSON.stringify({
          response:
            '⭐ **Sistem Rating & Review UMKM:**\n\n📝 **Cara Memberikan Review:**\n1. **Login** ke akun Anda\n2. Buka **halaman detail UMKM**\n3. Scroll ke bagian **"Review & Rating"**\n4. Klik **"Tulis Review"**\n5. Pilih **rating bintang** (1-5)\n6. Tulis **komentar** tentang pengalaman Anda\n7. Klik **"Kirim Review"**\n\n⭐ **Sistem Rating:**\n• Rating: **1-5 bintang**\n• Rata-rata rating dihitung otomatis\n• UMKM dengan rating tinggi muncul di **"Rekomendasi Terpopuler"**\n• Review terbaru ditampilkan di atas\n\n🤖 **Fitur AI:**\n• **Ringkasan AI**: Klik tombol AI untuk meringkas semua review\n• AI akan analisis sentimen positif & negatif\n• Dapat insight cepat tanpa baca semua review\n\n💡 **Tips Review Berkualitas:**\n• Jelaskan pengalaman spesifik Anda\n• Sebutkan menu/produk yang dipesan\n• Berikan saran konstruktif untuk pemilik',
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Pertanyaan tentang LOKASI TERDEKAT
    if (
      lastUserMessage.includes("terdekat") ||
      lastUserMessage.includes("lokasi") ||
      lastUserMessage.includes("dekat saya")
    ) {
      return new Response(
        JSON.stringify({
          response:
            '📍 **Mencari UMKM Terdekat:**\n\n🎯 **Cara Pakai Fitur Lokasi:**\n• Klik tombol **"Find Nearest"** 📍 di halaman utama\n• Izinkan akses lokasi di browser\n• Website akan otomatis urutkan UMKM berdasarkan jarak\n\n🗺️ **Lihat di Peta:**\n• Klik tab **"Map"** untuk melihat semua UMKM di peta\n• Zoom in/out untuk area yang diinginkan\n• Klik marker untuk detail UMKM\n\n📋 **Tips:**\n• Pastikan GPS aktif untuk akurasi terbaik\n• Filter berdasarkan kategori sambil pakai lokasi\n• Cek jam buka sebelum berkunjung\n\n📱 Semua UMKM menampilkan alamat lengkap dan estimasi jarak!',
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (
      lastUserMessage.includes("jam") ||
      lastUserMessage.includes("buka") ||
      lastUserMessage.includes("tutup")
    ) {
      return new Response(
        JSON.stringify({
          response:
            "🕐 **Jam Operasional UMKM:**\n\nUmumnya UMKM di LokalKeren buka dari **jam 10:00 - 21:00**. \n\n⏰ **Untuk jam buka spesifik:**\n• Cek detail setiap UMKM di halaman utama\n• Informasi jam buka ada di kartu UMKM\n• Beberapa warung buka lebih pagi (08:00)\n• Ada yang tutup lebih malam (22:00-23:00)\n\n💡 **Tips:** Selalu cek jam buka sebelum pesan, terutama saat weekend atau hari libur!",
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (
      lastUserMessage.includes("cara kerja") ||
      lastUserMessage.includes("gimana cara") ||
      lastUserMessage.includes("cara website")
    ) {
      return new Response(
        JSON.stringify({
          response:
            "🌟 **Cara Kerja Website LokalKeren:**\n\n📱 **Jelajahi UMKM:**\n• Lihat daftar UMKM di halaman utama\n• Filter berdasarkan kategori & lokasi\n• Baca review dari pengguna lain\n\n🛒 **Cara Pesan:**\n• Klik UMKM yang diinginkan\n• Pilih produk → Tambah ke keranjang\n• Checkout → Isi data pengiriman\n• Pilih metode pembayaran\n\n💰 **Pembayaran & Status:**\n• Pembayaran 100% SIMULASI\n• Setelah checkout → Lihat status pesanan\n• Tracking driver di halaman /status\n\n❤️ **Fitur Lainnya:**\n• Simpan UMKM favorit\n• Tulis review setelah pesan\n• Lihat riwayat pesanan\n• Chat dengan AI (ini!) untuk rekomendasi\n\n🎯 Semua transaksi adalah demo untuk showcase!",
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Cek pertanyaan tentang FAVORIT (harus SEBELUM "cara pesan" karena lebih spesifik)
    if (
      lastUserMessage.includes("favorit") ||
      lastUserMessage.includes("favourite") ||
      lastUserMessage.includes("menambahkan umkm") ||
      (lastUserMessage.includes("cara") && lastUserMessage.includes("favorit"))
    ) {
      return new Response(
        JSON.stringify({
          response:
            '❤️ **Cara Menambahkan UMKM ke Favorit:**\n\n📱 **Langkah Mudah:**\n1. Buka **halaman detail UMKM** atau lihat di **kartu UMKM**\n2. Klik **ikon hati (♡)** yang ada di card atau halaman detail\n3. Ikon akan berubah menjadi **merah (♥)** jika sudah difavoritkan\n4. Klik lagi untuk menghapus dari favorit\n\n💾 **Penyimpanan:**\n• **Sudah login?** Favorit tersimpan di akun Anda\n• **Belum login?** Favorit tersimpan di browser (localStorage)\n• Login nanti untuk sync favorit ke akun\n\n📂 **Akses Favorit:**\n• Klik menu **"Favorit"** di navigasi atas\n• Atau buka dari menu hamburger (☰)\n• Semua UMKM favorit akan muncul di satu halaman\n\n🔔 **Manfaat:**\n• Akses cepat ke UMKM favorit\n• Dapat notifikasi update (jika login)\n• Mudah bandingkan UMKM favorit',
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (
      (lastUserMessage.includes("cara") && lastUserMessage.includes("pesan")) ||
      lastUserMessage.includes("checkout") ||
      (lastUserMessage.includes("cara") && lastUserMessage.includes("beli"))
    ) {
      return new Response(
        JSON.stringify({
          response:
            "🛒 **Cara Pesan di LokalKeren:**\n\n1️⃣ **Pilih UMKM** yang menarik dari daftar\n2️⃣ **Tambahkan produk** ke keranjang belanja\n3️⃣ **Klik ikon keranjang** (pojok kanan atas)\n4️⃣ **Isi data pengiriman** lengkap\n5️⃣ **Pilih metode pembayaran** (QRIS, E-wallet, dll)\n6️⃣ **Klik Checkout** untuk menyelesaikan\n\n📍 **Opsi Pengiriman:**\n• 🏃‍♂️ **Pickup** - Ambil sendiri di lokasi UMKM\n• 🛵 **Delivery** - Diantar ke alamat Anda\n\n💡 **Catatan**: Pembayaran di website ini adalah **simulasi**, jadi pesanan langsung berhasil dan masuk ke tracking!",
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // SMART AI - Bisa baca semua data UMKM dengan rating dan review
    try {
      // Ambil SEMUA data UMKM dengan rating, review, dan produk
      const allUmkms = await db.umkm.findMany({
        where: { isActive: true },
        include: {
          Category: true,
          ProductCategory: {
            include: {
              Product: true, // Ambil semua produk, bukan cuma featured
            },
          },
          Review: {
            select: {
              rating: true,
              comment: true,
              user: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 10, // Ambil 10 review terbaru untuk context
          },
          _count: {
            select: {
              favorites: true,
              Review: true,
            },
          },
        },
      });

      // Hitung rata-rata rating untuk setiap UMKM
      const umkmsWithRating = allUmkms.map((umkm: any) => ({
        ...umkm,
        avgRating:
          umkm.Review.length > 0
            ? (
                umkm.Review.reduce(
                  (sum: number, review: any) => sum + review.rating,
                  0
                ) / umkm.Review.length
              ).toFixed(1)
            : 0,
        allProducts: umkm.ProductCategory.flatMap((pc: any) => pc.Product),
      }));

      // Deteksi berbagai jenis pertanyaan - makanan & aktivitas
      const searchKeywords: Record<
        string,
        { keywords: string[]; category?: string; description: string }
      > = {
        // Makanan spesifik
        pecel: { keywords: ["pecel"], description: "Pecel Enak" },
        kebab: { keywords: ["kebab"], description: "Kebab Lezat" },
        pizza: { keywords: ["pizza"], description: "Pizza Favorit" },
        nasi: { keywords: ["nasi", "rice"], description: "Nasi & Lauk" },
        bakso: { keywords: ["bakso", "baso"], description: "Bakso Mantap" },
        ayam: { keywords: ["ayam", "chicken"], description: "Ayam Crispy" },
        sate: { keywords: ["sate", "satay"], description: "Sate Bakar" },
        burger: { keywords: ["burger"], description: "Burger Juicy" },
        kopi: {
          keywords: ["kopi", "coffee"],
          category: "Minuman",
          description: "Kopi Nikmat",
        },
        teh: {
          keywords: ["teh", "tea"],
          category: "Minuman",
          description: "Teh Segar",
        },

        // Aktivitas & suasana
        nongkrong: {
          keywords: ["nongkrong", "hangout", "santai", "bersantai"],
          category: "Minuman",
          description: "Tempat Nongkrong Asik",
        },
        nugas: {
          keywords: [
            "nugas",
            "tugaskuliah",
            "belajar",
            "study",
            "ngerjain tugas",
          ],
          category: "Minuman",
          description: "Tempat Buat Nugas",
        },
        kerja: {
          keywords: ["kerja", "work", "freelance", "meeting"],
          category: "Minuman",
          description: "Tempat Kerja Nyaman",
        },
        wifi: {
          keywords: ["wifi", "internet", "online"],
          category: "Minuman",
          description: "Tempat dengan WiFi",
        },
        coworking: {
          keywords: ["coworking", "workspace", "kantor"],
          category: "Minuman",
          description: "Coworking Space",
        },

        // Suasana
        tenang: {
          keywords: ["tenang", "sepi", "quiet"],
          description: "Tempat Tenang",
        },
        ramai: {
          keywords: ["ramai", "rame", "crowded", "lively"],
          description: "Tempat Ramai & Seru",
        },
        romantis: {
          keywords: ["romantis", "date", "pacaran"],
          description: "Tempat Romantis",
        },
        keluarga: {
          keywords: ["keluarga", "family", "anak"],
          description: "Tempat Family Friendly",
        },
      };

      let searchResults: any[] = [];
      let searchFood = "";
      let searchCategory = "";

      // Cari berdasarkan kata kunci yang diperluas
      for (const [type, config] of Object.entries(searchKeywords)) {
        if (
          config.keywords.some((keyword: string) =>
            lastUserMessage.includes(keyword)
          )
        ) {
          searchFood = config.description;
          searchCategory = config.category || "";

          // Filter UMKM berdasarkan kategori atau kata kunci
          searchResults = umkmsWithRating.filter((umkm: any) => {
            // Jika ada kategori spesifik, filter berdasarkan kategori
            if (
              searchCategory &&
              umkm.Category.name
                .toLowerCase()
                .includes(searchCategory.toLowerCase())
            ) {
              return true;
            }

            // Cek nama UMKM
            if (umkm.name.toLowerCase().includes(type.toLowerCase()))
              return true;

            // Cek nama produk
            const hasProductMatch = umkm.allProducts.some((product: any) =>
              config.keywords.some((keyword: string) =>
                product.name.toLowerCase().includes(keyword.toLowerCase())
              )
            );
            if (hasProductMatch) return true;

            // Cek deskripsi UMKM
            if (
              umkm.description &&
              config.keywords.some((keyword: string) =>
                umkm.description.toLowerCase().includes(keyword.toLowerCase())
              )
            )
              return true;

            return false;
          });
          break;
        }
      }

      // Jika tidak ada makanan spesifik, cari yang populer
      if (
        searchResults.length === 0 &&
        (lastUserMessage.includes("rekomendasi") ||
          lastUserMessage.includes("enak"))
      ) {
        searchResults = umkmsWithRating.slice(0, 5);
        searchFood = "UMKM populer";
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
        let responseIntro = "";
        if (
          searchFood.includes("Nongkrong") ||
          searchFood.includes("Nugas") ||
          searchFood.includes("Kerja")
        ) {
          responseIntro = `☕ **${searchFood}** - Rekomendasi Tempat Asik:\n\n`;
        } else if (
          searchFood.includes("Tenang") ||
          searchFood.includes("WiFi")
        ) {
          responseIntro = `🤫 **${searchFood}** - Tempat yang Cocok:\n\n`;
        } else {
          responseIntro = `🔍 **${searchFood}** - Hasil Pencarian:\n\n`;
        }

        let response = responseIntro;

        topResults.forEach((umkm: any, index: number) => {
          // Ambil produk yang relevan dengan pencarian
          const relevantProducts = umkm.allProducts
            .filter((product: any) => {
              // Jika pencarian umum, tampilkan semua produk
              if (
                searchFood.includes("populer") ||
                searchFood.includes("Populer")
              )
                return true;

              // Cari produk yang cocok dengan kata kunci pencarian
              const searchType = Object.entries(searchKeywords).find(
                ([_, config]) => config.description === searchFood
              );

              if (searchType) {
                return searchType[1].keywords.some((keyword: string) =>
                  product.name.toLowerCase().includes(keyword.toLowerCase())
                );
              }

              return true; // Default tampilkan semua
            })
            .slice(0, 3);

          const recentReview = umkm.Review[0];

          response += `${index + 1}. **${umkm.name}** ⭐ ${umkm.avgRating}/5\n`;
          response += `   📍 ${umkm.address}\n`;
          response += `   ❤️ ${umkm._count.favorites} favorit • 📝 ${umkm._count.Review} review\n`;
          response += `   🏷️ ${umkm.Category.name}\n`;

          if (relevantProducts.length > 0) {
            response += `   🍽️ Menu: ${relevantProducts
              .map((p: any) => p.name)
              .join(", ")}\n`;
          }

          if (recentReview) {
            response += `   � "${recentReview.comment}" - ${recentReview.user.name}\n`;
          }

          response += "\n";
        });

        // Tips kontekstual berdasarkan jenis pencarian
        if (searchFood.includes("Nongkrong")) {
          response +=
            "💡 **Tips Nongkrong**: Cari tempat dengan suasana santai, harga terjangkau, dan WiFi stabil!";
        } else if (searchFood.includes("Nugas")) {
          response +=
            "📚 **Tips Nugas**: Pilih tempat tenang dengan colokan listrik dan WiFi kenceng. Jangan lupa beli minuman biar betah!";
        } else if (searchFood.includes("Kerja")) {
          response +=
            "� **Tips Kerja**: Cari tempat dengan WiFi stabil, tidak terlalu berisik, dan nyaman untuk laptop!";
        } else {
          response +=
            "�💡 Rekomendasi berdasarkan rating tertinggi dan review terbanyak!";
        }

        return new Response(JSON.stringify({ response }), {
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (error) {
      console.error("Smart AI error:", error);

      // FALLBACK: Query database langsung untuk rekomendasi
      if (
        lastUserMessage.includes("rekomendasi") ||
        lastUserMessage.includes("enak") ||
        lastUserMessage.includes("bagus")
      ) {
        try {
          const popularUmkms = await db.umkm.findMany({
            where: { isActive: true },
            include: {
              Category: true,
              ProductCategory: {
                include: { Product: true },
              },
              _count: { select: { favorites: true } },
            },
            orderBy: {
              favorites: { _count: "desc" },
            },
            take: 10,
          });

          if (popularUmkms.length > 0) {
            // Deteksi makanan yang dicari
            let searchFood = "UMKM terpopuler";
            let filteredResults = popularUmkms;

            if (lastUserMessage.includes("pecel")) {
              searchFood = "Pecel";
              filteredResults = popularUmkms.filter(
                (u: any) =>
                  u.name.toLowerCase().includes("pecel") ||
                  (u.ProductCategory &&
                    u.ProductCategory.some((pc: any) =>
                      pc.Product.some((p: any) =>
                        p.name.toLowerCase().includes("pecel")
                      )
                    ))
              );
            } else if (lastUserMessage.includes("kebab")) {
              searchFood = "Kebab";
              filteredResults = popularUmkms.filter(
                (u: any) =>
                  u.name.toLowerCase().includes("kebab") ||
                  (u.ProductCategory &&
                    u.ProductCategory.some((pc: any) =>
                      pc.Product.some((p: any) =>
                        p.name.toLowerCase().includes("kebab")
                      )
                    ))
              );
            } else if (lastUserMessage.includes("pizza")) {
              searchFood = "Pizza";
              filteredResults = popularUmkms.filter(
                (u: any) =>
                  u.name.toLowerCase().includes("pizza") ||
                  (u.ProductCategory &&
                    u.ProductCategory.some((pc: any) =>
                      pc.Product.some((p: any) =>
                        p.name.toLowerCase().includes("pizza")
                      )
                    ))
              );
            } else if (lastUserMessage.includes("nasi")) {
              searchFood = "Nasi";
              filteredResults = popularUmkms.filter(
                (u: any) =>
                  u.name.toLowerCase().includes("nasi") ||
                  (u.ProductCategory &&
                    u.ProductCategory.some((pc: any) =>
                      pc.Product.some((p: any) =>
                        p.name.toLowerCase().includes("nasi")
                      )
                    ))
              );
            }

            if (filteredResults.length > 0) {
              let responseText = `🍽️ **${searchFood} Terbaik** berdasarkan popularitas:\n\n`;

              filteredResults
                .slice(0, 3)
                .forEach((umkm: any, index: number) => {
                  responseText += `**${index + 1}. ${umkm.name}**\n`;
                  responseText += `📍 ${umkm.address}\n`;
                  responseText += `❤️ ${umkm._count?.favorites || 0} favorit\n`;
                  responseText += `🏷️ ${umkm.Category?.name || "Makanan"}\n\n`;
                });

              responseText += `💡 Data diambil dari database LokalKeren berdasarkan jumlah favorit pengguna!`;

              return new Response(JSON.stringify({ response: responseText }), {
                headers: { "Content-Type": "application/json" },
              });
            }
          }
        } catch (dbError) {
          console.error("Database fallback failed:", dbError);
        }
      }
    }

    // Final fallback untuk rekomendasi umum
    if (
      lastUserMessage.includes("rekomendasi") ||
      lastUserMessage.includes("enak") ||
      lastUserMessage.includes("bagus") ||
      lastUserMessage.includes("pecel") ||
      lastUserMessage.includes("kebab") ||
      lastUserMessage.includes("pizza") ||
      lastUserMessage.includes("nasi")
    ) {
      const foodRequested = lastUserMessage.includes("pecel")
        ? "pecel"
        : lastUserMessage.includes("kebab")
        ? "kebab"
        : lastUserMessage.includes("pizza")
        ? "pizza"
        : lastUserMessage.includes("nasi")
        ? "nasi"
        : "makanan enak";

      return new Response(
        JSON.stringify({
          response: `🔍 Maaf, saya sedang mengalami kendala dalam mengakses database untuk mencari ${foodRequested} yang enak.

💡 **Sementara ini, silakan coba:**
🌟 Buka halaman utama dan lihat 'Rekomendasi Terpopuler'
🔍 Gunakan fitur pencarian dengan kata kunci "${foodRequested}"
📂 Filter berdasarkan kategori makanan
📍 Cek UMKM terdekat dari lokasi Anda

Semua UMKM diurutkan berdasarkan jumlah favorit dan review pengguna LokalKeren! 

🚀 Coba tanya lagi nanti, sistem sedang diperbaiki.`,
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 4. Coba ambil data UMKM dari DB (jika berhasil, lanjut ke AI)
    let umkmData = [];
    try {
      umkmData = await db.umkm.findMany({
        where: { isActive: true },
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
        take: 20, // Batasi untuk performance
      });
    } catch (dbError) {
      console.error("Database error, using fallback response:", dbError);

      // Fallback response jika database error
      return new Response(
        JSON.stringify({
          response:
            "Maaf, sistem sedang mengalami gangguan database. Tapi saya tetap bisa membantu!\n\n🏪 Silakan jelajahi UMKM di halaman utama\n⭐ Cek bagian rekomendasi populer\n📱 Gunakan fitur pencarian untuk menemukan UMKM\n\nAda yang bisa saya bantu lainnya?",
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 5. Format data DB menjadi teks sederhana (jika ada data)
    const dynamicContext =
      umkmData.length > 0
        ? umkmData
            .map(
              (umkm: any) =>
                `UMKM: ${umkm.name}\nKategori: ${
                  umkm.Category?.name || "Tidak ada kategori"
                }\nAlamat: ${umkm.address}\nJam Buka: ${
                  umkm.openingHours || "Tidak disebutkan"
                }\nDeskripsi: ${umkm.description}\nProduk: ${
                  umkm.ProductCategory?.map((pcat: any) =>
                    pcat.Product?.map((p: any) => p.name).join(", ")
                  ).join("; ") || "Tidak ada produk"
                }\n---`
            )
            .join("\n")
        : "Data UMKM tidak tersedia saat ini.";

    // 6. Prepare variables for both Gemini and OpenAI (move outside try blocks)
    const currentMessage = messages[messages.length - 1]?.content || "";

    // Build conversation history for both AI systems
    const conversationHistory = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Build system prompt that works for both AI systems
    const systemPrompt = `
      Anda adalah "LokalKeren AI", asisten virtual untuk website direktori UMKM.
      
      ATURAN PENTING: 
      - Jawab pertanyaan pengguna dengan akurat berdasarkan konteks yang diberikan
      - Jika pertanyaan tentang cara daftar/buat akun UMKM, jelaskan langkah-langkahnya
      - Jika pertanyaan di luar topik UMKM sapa, arahkan ke fitur-fitur website
      - Jawab dalam Bahasa Indonesia yang ramah dan profesional
      - GUNAKAN format markdown untuk membuat jawaban lebih jelas:
        * **teks tebal** untuk highlight kata penting
        * *teks miring* untuk emphasis
        * ### untuk judul section
        * - untuk bullet list
        * 1. untuk numbered list
      - Gunakan emoji secukupnya untuk membuat lebih friendly
      - Berikan informasi yang spesifik dan membantu

      ATURAN FILTERING KHUSUS:
      - Jika user tanya MAKANAN/MINUMAN: HANYA tampilkan UMKM dengan kategori "Makanan" atau "Minuman"
      - JANGAN PERNAH tampilkan kategori "Jasa" (seperti laundry) saat user tanya makanan/minuman
      - Jika user tanya JASA: HANYA tampilkan kategori "Jasa"
      - Jika user tanya FASHION: HANYA tampilkan kategori "Fashion"
      - Jika user tanya KERAJINAN: HANYA tampilkan kategori "Kerajinan"
      - Jika user tanya BELANJA: HANYA tampilkan kategori "Belanja"
      - Selalu filter berdasarkan kategori yang relevan dengan pertanyaan user

      KONTEKS STATIS (Cara Kerja Website):
      ${STATIC_KNOWLEDGE}

      INFORMASI CARA DAFTAR UMKM:
      - Pengguna perlu login terlebih dahulu di website LokalKeren
      - Setelah login, klik menu hamburger (3 garis) di pojok kanan atas
      - Pilih "Profil" dari menu dropdown
      - Di halaman profil, klik "UMKM Saya"
      - Kemudian klik "Daftarkan UMKM Saya"
      - Isi form pendaftaran dengan lengkap: nama UMKM, kategori, alamat, foto, dll
      - Setelah berhasil, akun berubah menjadi pemilik UMKM dan bisa kelola toko

      KONTEKS DINAMIS (Daftar UMKM dari Database):
      ${dynamicContext}
    `;

    // 7. Jika ada Gemini API key, coba panggil AI
    if (process.env.GEMINI_API_KEY && genAI) {
      try {
        console.log("🚀 [Gemini API] Initializing request...");
        const startTime = Date.now();

        // Initialize Gemini model
        const model = genAI.getGenerativeModel({
          model: "models/gemini-2.0-flash-lite",
        });

        // Start chat with history
        const chat = model.startChat({
          history: conversationHistory,
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
          },
        });

        // Send the full context as system message + current question with retry logic
        const fullPrompt = `${systemPrompt}\n\nPertanyaan pengguna: ${currentMessage}`;

        let result;
        let retries = 3;
        let attemptCount = 0;

        while (retries > 0) {
          try {
            attemptCount++;
            console.log(
              `📡 [Gemini API] Sending request (attempt ${attemptCount}/${3})...`
            );
            result = await chat.sendMessage(fullPrompt);
            console.log(
              `✅ [Gemini API] Request successful on attempt ${attemptCount}`
            );
            break; // Success, exit retry loop
          } catch (retryError: any) {
            retries--;
            console.error(
              `⚠️ [Gemini API] Attempt ${attemptCount} failed. Retries left: ${retries}`
            );
            console.error(
              `   Error: ${retryError?.message || "Unknown error"}`
            );
            console.error(`   Status: ${retryError?.status || "N/A"}`);

            if (retries === 0) {
              console.error("❌ [Gemini API] All retry attempts exhausted");
              throw retryError; // Re-throw after all retries exhausted
            }

            // Wait before retry (exponential backoff)
            const waitTime = (4 - retries) * 1000;
            console.log(
              `⏳ [Gemini API] Waiting ${waitTime}ms before retry...`
            );
            await new Promise((resolve) => setTimeout(resolve, waitTime));
          }
        }

        const response = result!.response;
        const responseMessage =
          response.text() || "Maaf, saya tidak bisa merespon saat ini.";
        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(
          `✅ [Gemini API] SUCCESS - Response received in ${duration}ms`
        );
        console.log(
          `📊 [Gemini API] Response length: ${responseMessage.length} characters`
        );

        // Kembalikan jawaban AI
        return new Response(JSON.stringify({ response: responseMessage }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (geminiError: any) {
        console.error(
          "❌ [Gemini API] FAILED - Request failed after all attempts"
        );
        console.error(`   Error Type: ${geminiError?.name || "Unknown"}`);
        console.error(
          `   Error Message: ${geminiError?.message || "No message"}`
        );
        console.error(`   Error Status: ${geminiError?.status || "N/A"}`);
        console.error(`   Error Code: ${geminiError?.code || "N/A"}`);
        console.log("⚠️ [Gemini API] Falling back to manual response");

        // Check if error is rate limit (429)
        const isRateLimit =
          geminiError?.status === 429 ||
          geminiError?.message?.toLowerCase().includes("rate limit") ||
          geminiError?.message?.toLowerCase().includes("quota");

        // Fallback to smart response when Gemini fails
        // Don't show error message if it's rate limit
        if (isRateLimit) {
          console.log(
            "⚠️ [Gemini API] Rate limit detected - Using silent fallback"
          );
          // Silent fallback - just continue to regular fallback responses below
        } else {
          // Show error message for other types of errors
          return new Response(
            JSON.stringify({
              response:
                "🚨 **AI sedang bermasalah:**\n• Gemini API: " +
                (geminiError?.message || "Unknown error") +
                "\n\n🛠️ **Solusi sementara:**\n• 🏪 Browse UMKM di halaman utama\n• 📍 Gunakan 'Find Nearest' untuk lokasi\n• 🔍 Filter berdasarkan kategori makanan\n• ⭐ Cek rekomendasi populer\n• 📱 Semua fitur website tetap berfungsi normal\n\n💡 **Manual recommendations:**\n• **Makanan:** Pecel Bu Sri, Bakso Malang\n• **Minuman:** Kedai Kopi Santai\n• **Fast Food:** Pizza Corner, Burger King\n\n⚡ *Sistem sedang perbaiki!*",
            }),
            {
              headers: { "Content-Type": "application/json" },
              status: 200,
            }
          );
        }
      }
    } else {
      console.warn(
        "⚠️ [Gemini API] API Key not configured - Using fallback responses"
      );
    }

    // 8. Jika sampai sini berarti AI tidak available, beri smart fallback berdasarkan pertanyaan
    const userQuestion =
      messages[messages.length - 1]?.content?.toLowerCase() || "";

    // Smart fallback berdasarkan kata kunci
    if (
      userQuestion.includes("rekomendasi") ||
      userQuestion.includes("enak") ||
      userQuestion.includes("bagus")
    ) {
      return new Response(
        JSON.stringify({
          response:
            "🤖 **AI sedang offline, tapi ini rekomendasi manual:**\n\n⭐ **UMKM Terpopuler berdasarkan favorit:**\n• Pecel Bu Sri - Makanan tradisional\n• Kedai Kopi Santai - Tempat nongkrong\n• Warung Nasi Gudeg - Makanan khas\n• Pizza Corner - Fast food\n• Bakso Malang Asli - Comfort food\n\n📍 **Cara cari lebih banyak:**\n• Filter berdasarkan kategori di halaman utama\n• Gunakan fitur 'Find Nearest' untuk UMKM terdekat\n• Cek bagian 'Rekomendasi' di beranda\n\n💡 *AI akan kembali normal setelah maintenance selesai!*",
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (
      userQuestion.includes("terdekat") ||
      userQuestion.includes("lokasi") ||
      userQuestion.includes("dekat")
    ) {
      return new Response(
        JSON.stringify({
          response:
            "📍 **Mencari UMKM Terdekat:**\n\n🎯 **Langkah mudah:**\n1. Klik tombol **'Find Nearest'** di halaman utama\n2. Izinkan akses lokasi di browser\n3. UMKM akan diurutkan berdasarkan jarak\n\n🗺️ **Alternatif:**\n• Buka tab **'Map'** untuk lihat peta interaktif\n• Zoom ke area yang diinginkan\n• Klik marker UMKM untuk detail lengkap\n\n⚡ **Tips:**\n• Pastikan GPS aktif untuk hasil akurat\n• Kombinasikan dengan filter kategori\n• Cek jam buka sebelum berkunjung",
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (
      userQuestion.includes("cara") &&
      (userQuestion.includes("pesan") || userQuestion.includes("beli"))
    ) {
      return new Response(
        JSON.stringify({
          response:
            "🛒 **Cara Pesan di LokalKeren:**\n\n**Step by step:**\n1️⃣ Pilih UMKM dari daftar\n2️⃣ Klik produk yang diinginkan\n3️⃣ Tambah ke keranjang (ikon keranjang)\n4️⃣ Isi alamat pengiriman\n5️⃣ Pilih metode pembayaran\n6️⃣ Klik 'Checkout'\n\n💰 **Info Penting:**\n• Pembayasan 100% simulasi (demo)\n• Pesanan langsung 'berhasil'\n• Tracking driver di halaman /status\n• Histori tersimpan di /history\n\n❤️ Jangan lupa save UMKM favorit!",
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        response:
          "🤖 **AI Assistant sedang maintenance!**\n\n📱 **Yang bisa dilakukan sekarang:**\n• 🏪 Jelajahi daftar UMKM di beranda\n• 🔍 Gunakan fitur pencarian\n• 📂 Filter berdasarkan kategori\n• 📍 Cari UMKM terdekat dengan GPS\n• ⭐ Lihat rekomendasi populer\n• ❤️ Simpan UMKM favorit\n\n💬 **Coba tanya:**\n• 'Rekomendasi makanan enak'\n• 'UMKM terdekat'\n• 'Cara pesan'\n\n⚡ *AI akan aktif kembali setelah server maintenance selesai!*",
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error di API AI Assistant:", error);
    return new Response(
      JSON.stringify({ error: "Gagal mendapatkan respon AI" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
