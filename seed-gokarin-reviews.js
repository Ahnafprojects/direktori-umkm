const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Data review untuk Gokarin (UMKM ID: 45)
const reviewsData = [
  // Rating 5 (15 reviews)
  {
    rating: 5,
    comment:
      "Sushi terenak di Jogja! Fresh dan harganya terjangkau. Pasti balik lagi!",
  },
  {
    rating: 5,
    comment: "Salmon sashiminya segar banget, porsi juga besar. Worth it!",
  },
  {
    rating: 5,
    comment: "Tempatnya cozy, makanannya enak, pelayanan ramah. Recommended!",
  },
  {
    rating: 5,
    comment: "Ramennya enak banget, kuahnya gurih. Jadi langganan deh!",
  },
  {
    rating: 5,
    comment: "Sushi platter-nya mantap! Cocok buat acara keluarga.",
  },
  {
    rating: 5,
    comment: "Takoyaki crispy di luar, lembut di dalam. Perfect!",
  },
  {
    rating: 5,
    comment: "Harga terjangkau untuk rasa premium. Selalu puas makan di sini!",
  },
  {
    rating: 5,
    comment: "Gyoza-nya juara! Isian dagingnya banyak dan bumbu pas.",
  },
  {
    rating: 5,
    comment: "Teriyaki chicken-nya enak, nasinya pulen. Porsi kenyang!",
  },
  {
    rating: 5,
    comment: "Makanan Jepang autentik dengan harga lokal. Sangat recommended!",
  },
  {
    rating: 5,
    comment: "California roll-nya fresh dan creamy. Favorit saya!",
  },
  {
    rating: 5,
    comment: "Pelayanan cepat, makanan selalu fresh. Top banget!",
  },
  {
    rating: 5,
    comment: "Udon-nya enak, tekstur mienya pas. Kuahnya juga sedap!",
  },
  {
    rating: 5,
    comment:
      "Tempat favorit untuk makan sushi di Jogja. Ga pernah mengecewakan!",
  },
  {
    rating: 5,
    comment: "Ebi furai-nya crispy dan udangnya besar. Highly recommended!",
  },

  // Rating 4 (10 reviews)
  {
    rating: 4,
    comment: "Makanannya enak tapi kadang harus nunggu agak lama kalau rame.",
  },
  {
    rating: 4,
    comment:
      "Rasa oke, harga pas. Cuma tempatnya agak kecil jadi sering penuh.",
  },
  {
    rating: 4,
    comment: "Sushi-nya enak dan fresh, tapi porsi nasi bisa lebih banyak.",
  },
  {
    rating: 4,
    comment: "Overall bagus, cuma parkir agak susah kalau weekend.",
  },
  {
    rating: 4,
    comment: "Makanannya enak, tapi variasi menu bisa ditambah lagi.",
  },
  {
    rating: 4,
    comment:
      "Rasa mantap, pelayanan ramah. Kalau AC-nya lebih dingin pasti perfect!",
  },
  {
    rating: 4,
    comment: "Suka banget sama ramennya, tapi katsudon-nya biasa aja.",
  },
  {
    rating: 4,
    comment: "Enak dan murah, tapi kadang porsi gak konsisten.",
  },
  {
    rating: 4,
    comment: "Tempat nyaman, makanan enak. Cuma kadang kehabisan menu favorit.",
  },
  {
    rating: 4,
    comment: "Good value for money. Sambel wasabinya bisa lebih pedas lagi.",
  },

  // Rating 3 (5 reviews)
  {
    rating: 3,
    comment:
      "Rasanya standar, tidak terlalu istimewa tapi juga tidak mengecewakan.",
  },
  {
    rating: 3,
    comment: "Harga murah tapi porsi kecil. Untuk rasa lumayan lah.",
  },
  {
    rating: 3,
    comment: "Tempatnya sih bagus, tapi makanannya kurang bumbu menurutku.",
  },
  {
    rating: 3,
    comment: "Oke untuk dicoba, tapi belum tentu balik lagi. Rasa biasa aja.",
  },
  {
    rating: 3,
    comment:
      "Pelayanan oke, tapi waktu tunggu agak lama dan rasa kurang nendang.",
  },
];

async function main() {
  console.log("🌱 Mulai seeding reviews untuk Gokarin (UMKM ID: 45)...\n");

  // Cek apakah UMKM Gokarin ada
  const gokarin = await prisma.umkm.findUnique({
    where: { id: 45 },
    include: { owner: true },
  });

  if (!gokarin) {
    console.error("❌ UMKM dengan ID 45 (Gokarin) tidak ditemukan!");
    return;
  }

  console.log(`✅ UMKM ditemukan: ${gokarin.name}`);
  console.log(`   Owner: ${gokarin.owner?.name || "Tidak ada owner"}\n`);

  // Ambil semua user pelanggan (bukan owner Gokarin)
  const users = await prisma.user.findMany({
    where: {
      role: "PELANGGAN",
      id: { not: gokarin.ownerId || undefined },
    },
  });

  if (users.length === 0) {
    console.error("❌ Tidak ada user pelanggan yang tersedia!");
    return;
  }

  console.log(`📋 Ditemukan ${users.length} user pelanggan\n`);

  // Buat 30 reviews
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < reviewsData.length; i++) {
    const reviewData = reviewsData[i];

    // Pilih user secara random
    const randomUser = users[Math.floor(Math.random() * users.length)];

    // Tambahkan random delay createdAt dalam 60 hari terakhir
    const daysAgo = Math.floor(Math.random() * 60);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    try {
      const review = await prisma.review.create({
        data: {
          rating: reviewData.rating,
          comment: reviewData.comment,
          umkmId: 45, // Gokarin
          userId: randomUser.id,
          createdAt: createdAt,
        },
      });

      successCount++;
      console.log(
        `✅ Review ${i + 1}/30 - Rating: ${review.rating}⭐ - User: ${
          randomUser.name
        }`
      );
    } catch (error) {
      errorCount++;
      console.error(`❌ Gagal membuat review ${i + 1}:`, error.message);
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`🎉 Seeding selesai!`);
  console.log(`✅ Berhasil: ${successCount} reviews`);
  console.log(`❌ Gagal: ${errorCount} reviews`);
  console.log("=".repeat(50));

  // Update rating UMKM Gokarin
  const allReviews = await prisma.review.findMany({
    where: { umkmId: 45 },
  });

  const avgRating =
    allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  await prisma.umkm.update({
    where: { id: 45 },
    data: { rating: avgRating.toFixed(1) },
  });

  console.log(`\n⭐ Rating Gokarin diupdate menjadi: ${avgRating.toFixed(1)}`);
  console.log(`📊 Total reviews Gokarin: ${allReviews.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
