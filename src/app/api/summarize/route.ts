// src/app/api/summarize/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
console.log("Initializing Gemini AI for Summarize...");
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export async function POST(req: Request) {
  try {
    console.log("🚀 [Summarize API] Request received");
    const startTime = Date.now();

    // 1. Ambil data ulasan dari front-end
    const body = await req.json();
    console.log("📊 [Summarize API] Request data:", {
      umkmName: body?.umkmName,
      reviewCount: body?.reviews?.length || 0,
    });

    const { umkmName, reviews } = body;

    // Validate input
    if (!umkmName || !reviews || !Array.isArray(reviews)) {
      console.error("❌ [Summarize API] FAILED - Invalid input data");
      return new Response(JSON.stringify({ error: "Invalid input data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (reviews.length === 0) {
      console.log("⚠️ [Summarize API] No reviews to summarize");
      return new Response(
        JSON.stringify({ summary: "Belum ada ulasan untuk diringkas." }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log(
      `✅ [Summarize API] Processing ${reviews.length} reviews for ${umkmName}`
    );

    // 2. Ubah array ulasan menjadi satu string
    const reviewTexts = reviews
      .map((r: any) => `- Rating ${r.rating}/5: "${r.comment}"`)
      .join("\n");

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

    // 4. Try Gemini AI first
    let summary: string | undefined;

    if (process.env.GEMINI_API_KEY && genAI) {
      try {
        console.log("🚀 [Summarize API] Calling Gemini AI...");
        const aiStartTime = Date.now();

        const model = genAI.getGenerativeModel({
          model: "models/gemini-2.0-flash-exp",
        });

        let retries = 2;
        let attemptCount = 0;

        while (retries > 0 && !summary) {
          try {
            attemptCount++;
            console.log(
              `📡 [Summarize API] Gemini request attempt ${attemptCount}/${2}...`
            );

            const result = await model.generateContent(prompt);
            const response = result.response;
            summary = response.text();

            const aiEndTime = Date.now();
            const aiDuration = aiEndTime - aiStartTime;

            console.log(
              `✅ [Summarize API] Gemini AI SUCCESS in ${aiDuration}ms`
            );
            console.log(
              `📝 [Summarize API] AI Summary length: ${
                summary?.length || 0
              } characters`
            );
            break;
          } catch (aiError: any) {
            retries--;
            console.error(
              `⚠️ [Summarize API] Gemini attempt ${attemptCount} failed. Retries left: ${retries}`
            );
            console.error(`   Error: ${aiError?.message || "Unknown error"}`);

            if (retries === 0) {
              console.error(
                "❌ [Summarize API] Gemini AI failed after all attempts"
              );
              console.log(
                "⚠️ [Summarize API] Falling back to local summarization"
              );
            } else {
              const waitTime = attemptCount * 1000;
              console.log(
                `⏳ [Summarize API] Waiting ${waitTime}ms before retry...`
              );
              await new Promise((resolve) => setTimeout(resolve, waitTime));
            }
          }
        }
      } catch (error: any) {
        console.error(
          "❌ [Summarize API] Gemini initialization error:",
          error?.message
        );
        console.log("⚠️ [Summarize API] Using local fallback");
      }
    } else {
      console.log(
        "⚠️ [Summarize API] Gemini API not configured - Using local summarization"
      );
    }

    // 5. Fallback: Buat ringkasan manual yang SPESIFIK
    if (!summary) {
      console.log("🔍 [Summarize API] Analyzing review aspects...");

      const avgRating = (
        reviews.reduce(
          (acc: number, r: any) => acc + (Number(r.rating) || 0),
          0
        ) / Math.max(1, reviews.length)
      ).toFixed(1);

      // Analisis aspek spesifik yang dipuji/dikritik
      const aspectKeywords = {
        bumbu: ["bumbu", "sambel", "sambal", "pedas", "gurih", "asin", "manis"],
        lauk: ["lauk", "ayam", "tempe", "tahu", "sayur", "kerupuk", "rempeyek"],
        rasa: [
          "enak",
          "lezat",
          "mantap",
          "segar",
          "hambar",
          "tawar",
          "keasinan",
        ],
        porsi: ["porsi", "banyak", "sedikit", "besar", "kecil", "kenyang"],
        harga: ["murah", "mahal", "terjangkau", "hemat", "worth", "sebanding"],
        pelayanan: ["ramah", "cepat", "lambat", "lama", "baik", "buruk"],
        tempat: [
          "bersih",
          "kotor",
          "nyaman",
          "sempit",
          "luas",
          "panas",
          "sejuk",
        ],
      };

      let foundAspects: { [key: string]: string[] } = {};

      // Analisis setiap aspek
      Object.entries(aspectKeywords).forEach(([aspect, keywords]) => {
        foundAspects[aspect] = [];
        reviews.forEach((r: any) => {
          const comment = String(r.comment || "").toLowerCase();
          keywords.forEach((keyword) => {
            if (
              comment.includes(keyword) &&
              !foundAspects[aspect].includes(keyword)
            ) {
              foundAspects[aspect].push(keyword);
            }
          });
        });
      });

      // Buat ringkasan berdasarkan aspek yang ditemukan
      let sentence1 = "";
      let sentence2 = "";

      // Cari aspek yang paling sering dipuji
      const praisedAspects: string[] = [];
      const criticizedAspects: string[] = [];

      // Analisis aspek yang dipuji vs dikritik
      Object.entries(foundAspects).forEach(([aspect, keywords]) => {
        if (keywords.length === 0) return;

        const positiveKeywords = keywords.filter((k) =>
          [
            "enak",
            "lezat",
            "mantap",
            "segar",
            "murah",
            "bersih",
            "ramah",
            "cepat",
            "banyak",
            "besar",
            "terjangkau",
            "nyaman",
          ].includes(k)
        );
        const negativeKeywords = keywords.filter((k) =>
          [
            "hambar",
            "mahal",
            "kotor",
            "lambat",
            "sedikit",
            "kecil",
            "sempit",
            "lama",
            "buruk",
          ].includes(k)
        );

        if (positiveKeywords.length > negativeKeywords.length) {
          praisedAspects.push(`${aspect}nya ${positiveKeywords[0]}`);
        } else if (negativeKeywords.length > 0) {
          criticizedAspects.push(`${aspect}nya ${negativeKeywords[0]}`);
        }
      });

      // Buat kalimat pertama
      if (praisedAspects.length > 0) {
        sentence1 = `Customer memuji ${praisedAspects
          .slice(0, 2)
          .join(" dan ")} dengan rating ${avgRating}/5.`;
      } else {
        sentence1 = `Mendapat rating rata-rata ${avgRating}/5 dari ${reviews.length} ulasan.`;
      }

      // Buat kalimat kedua
      if (criticizedAspects.length > 0) {
        sentence2 = `Ada keluhan tentang ${criticizedAspects
          .slice(0, 2)
          .join(" dan ")}.`;
      } else if (praisedAspects.length > 2) {
        sentence2 = `Juga dipuji ${praisedAspects.slice(2, 4).join(" dan ")}.`;
      } else {
        sentence2 = `Umumnya mendapat respon positif dari pengunjung.`;
      }

      summary = `${sentence1} ${sentence2}`;

      console.log(
        `✅ [Summarize API] Generated summary with ${praisedAspects.length} praised aspects, ${criticizedAspects.length} criticized aspects`
      );
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(
      `✅ [Summarize API] SUCCESS - Summary generated in ${duration}ms`
    );
    console.log(
      `📝 [Summarize API] Summary length: ${summary.length} characters`
    );

    // 5. Kembalikan sebagai JSON
    return new Response(JSON.stringify({ summary: summary }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ [Summarize API] FAILED - Error occurred");
    console.error(
      `   Error Type: ${error instanceof Error ? error.name : "Unknown"}`
    );
    console.error(
      `   Error Message: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    console.error("   Full Error:", error);

    // Return more detailed error information in development
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return new Response(
      JSON.stringify({
        error: "Gagal meringkas ulasan",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
