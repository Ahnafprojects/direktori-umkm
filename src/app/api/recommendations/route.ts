// src/app/api/recommendations/route.ts
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
console.log("Initializing Gemini AI for Recommendations...");
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export async function POST(req: Request) {
  try {
    console.log("🚀 [Recommendations API] Request received");
    const startTime = Date.now();

    // 3. Ambil data (TIDAK BERUBAH)
    const { favoriteNames, allUmkms } = await req.json();
    console.log(
      `📊 [Recommendations API] Favorites: ${
        favoriteNames?.length || 0
      }, All UMKMs: ${allUmkms?.length || 0}`
    );

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
    console.log(
      `✅ [Recommendations API] Found ${umkmDetails.length} UMKM details from database`
    );

    // 5. Buat "Konteks" untuk AI (TIDAK BERUBAH)
    const umkmContext = umkmDetails
      .map(
        (u: any) =>
          `SLUG: ${u.slug}, NAMA: ${u.name}, KATEGORI: ${u.Category.name}, DESKRIPSI: ${u.description}`
      )
      .join("\n");

    // 6. BUAT PROMPT (SEDIKIT TWEAK UNTUK LLAMA)
    const prompt = `
      Anda adalah asisten kuliner lokal Surabaya yang sangat ahli.
      Seorang pengguna menyukai UMKM berikut: ${favoriteNames.join(", ")}.

      Berikut adalah daftar LENGKAP UMKM yang ada (jangan rekomendasikan yang sudah disukai):
      ${umkmContext}

      Tugas Anda:
      1. Pilih 3 UMKM dari daftar LENGKAP di atas yang paling mungkin disukai pengguna.
      2. Berikan alasan singkat (maksimal 10 kata) untuk setiap rekomendasi.
      3. Kembalikan HANYA dalam format JSON array yang valid. JANGAN tambahkan teks pembuka/penutup, penjelasan, atau markdown \`\`\`json.
      Format: [{"slug": "slug-umkm", "reason": "Alasan singkat..."}]
    `;

    // 7. Try Gemini AI first
    let aiRecommendations: any[] | null = null;

    if (process.env.GEMINI_API_KEY && genAI) {
      try {
        console.log("🚀 [Recommendations API] Calling Gemini AI...");
        const aiStartTime = Date.now();

        const model = genAI.getGenerativeModel({
          model: "models/gemini-2.0-flash-exp",
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
          },
        });

        let retries = 2;
        let attemptCount = 0;

        while (retries > 0 && !aiRecommendations) {
          try {
            attemptCount++;
            console.log(
              `📡 [Recommendations API] Gemini request attempt ${attemptCount}/${2}...`
            );

            const result = await model.generateContent(prompt);
            const response = result.response;
            let responseText = response.text();

            // Clean up response (remove markdown code blocks if present)
            responseText = responseText
              .replace(/```json\n?/g, "")
              .replace(/```\n?/g, "")
              .trim();

            // Parse JSON response
            aiRecommendations = JSON.parse(responseText);

            const aiEndTime = Date.now();
            const aiDuration = aiEndTime - aiStartTime;

            console.log(
              `✅ [Recommendations API] Gemini AI SUCCESS in ${aiDuration}ms`
            );
            console.log(
              `📊 [Recommendations API] AI generated ${
                aiRecommendations?.length || 0
              } recommendations`
            );
            break;
          } catch (aiError: any) {
            retries--;
            console.error(
              `⚠️ [Recommendations API] Gemini attempt ${attemptCount} failed. Retries left: ${retries}`
            );
            console.error(`   Error: ${aiError?.message || "Unknown error"}`);

            if (retries === 0) {
              console.error(
                "❌ [Recommendations API] Gemini AI failed after all attempts"
              );
              console.log(
                "⚠️ [Recommendations API] Falling back to category-based logic"
              );
            } else {
              const waitTime = attemptCount * 1000;
              console.log(
                `⏳ [Recommendations API] Waiting ${waitTime}ms before retry...`
              );
              await new Promise((resolve) => setTimeout(resolve, waitTime));
            }
          }
        }
      } catch (error: any) {
        console.error(
          "❌ [Recommendations API] Gemini initialization error:",
          error?.message
        );
        console.log("⚠️ [Recommendations API] Using category-based fallback");
      }
    } else {
      console.log(
        "⚠️ [Recommendations API] Gemini API not configured - Using category-based fallback"
      );
    }

    // 8. FALLBACK IMPLEMENTATION (if AI failed or not configured)
    let similarUmkms: any[];

    if (aiRecommendations && aiRecommendations.length > 0) {
      // Use AI recommendations
      similarUmkms = aiRecommendations;
      console.log(
        `✅ [Recommendations API] Using AI-generated recommendations`
      );
    } else {
      // Use category-based fallback
      console.log(
        "🔄 [Recommendations API] Using category-based fallback logic"
      );

      // Simple recommendation based on category matching
      const favoriteCategories = new Set<string>();

      // Get categories from user's favorites
      const favoriteUmkms = await db.umkm.findMany({
        where: { name: { in: favoriteNames } },
        include: { Category: true },
      });

      favoriteUmkms.forEach((umkm: any) => {
        if (umkm.Category) favoriteCategories.add(umkm.Category.name);
      });
      console.log(
        `📂 [Recommendations API] Favorite categories: ${Array.from(
          favoriteCategories
        ).join(", ")}`
      );

      // Find similar UMKMs by category
      similarUmkms = umkmDetails
        .filter(
          (umkm: any) =>
            favoriteCategories.has(umkm.Category.name) &&
            !favoriteNames.includes(umkm.name)
        )
        .slice(0, 3)
        .map((umkm: any) => ({
          slug: umkm.slug,
          reason: `Kategori ${umkm.Category.name} seperti favorit Anda`,
        }));

      // If not enough, add random ones
      if (similarUmkms.length < 3) {
        const remaining = umkmDetails
          .filter(
            (umkm: any) =>
              !favoriteNames.includes(umkm.name) &&
              !similarUmkms.some((s: any) => s.slug === umkm.slug)
          )
          .slice(0, 3 - similarUmkms.length)
          .map((umkm: any) => ({
            slug: umkm.slug,
            reason: `UMKM populer di area Anda`,
          }));

        similarUmkms.push(...remaining);
      }
    }

    const jsonResponse = JSON.stringify(similarUmkms);
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(
      `✅ [Recommendations API] SUCCESS - Generated ${similarUmkms.length} recommendations in ${duration}ms`
    );

    // 9. Kembalikan JSON ke front-end (TIDAK BERUBAH)
    return new Response(jsonResponse, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ [Recommendations API] FAILED - Error occurred");
    console.error(
      `   Error Type: ${error instanceof Error ? error.name : "Unknown"}`
    );
    console.error(
      `   Error Message: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    console.error("   Full Error:", error);

    return new Response(
      JSON.stringify({ error: "Gagal mendapatkan rekomendasi" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
