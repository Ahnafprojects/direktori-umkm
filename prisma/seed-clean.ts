import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing existing data...");
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.umkm.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating users...");
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Ahmad Rizki",
        email: "ahmad@example.com",
        password: "password123",
        role: "PELANGGAN",
      },
    }),
    prisma.user.create({
      data: {
        name: "Siti Nurhaliza",
        email: "siti@example.com",
        password: "password123",
        role: "PELANGGAN",
      },
    }),
    prisma.user.create({
      data: {
        name: "Budi Santoso",
        email: "budi@example.com",
        password: "password123",
        role: "PELANGGAN",
      },
    }),
  ]);

  console.log("Creating categories...");
  const [makanan, minuman, jasa, belanja] = await Promise.all([
    prisma.category.create({
      data: { name: "Makanan", slug: "makanan" },
    }),
    prisma.category.create({
      data: { name: "Minuman", slug: "minuman" },
    }),
    prisma.category.create({
      data: { name: "Jasa", slug: "jasa" },
    }),
    prisma.category.create({
      data: { name: "Belanja", slug: "belanja" },
    }),
  ]);

  console.log("Creating UMKMs...");

  // 1. Bakso Cak Man
  const bakso = await prisma.umkm.create({
    data: {
      name: "Bakso Cak Man",
      slug: "bakso-cak-man",
      description: "Bakso legendaris dengan kuah gurih dan bakso kenyal",
      address: "Jl. Raya ITS No. 12, Sukolilo, Surabaya",
      phone: "081234567890",
      openingHours: "10:00 - 21:00",
      photos: ["/img/produk/placeholder.jpg"],
      latitude: -7.279912,
      longitude: 112.790784,
      rating: 4.5,
      hasPromo: true,
      isRecommended: true,
      categoryId: makanan.id,
      ownerId: users[0].id,
    },
  });

  const baksoCategory = await prisma.productCategory.create({
    data: { name: "Menu Utama", umkmId: bakso.id },
  });

  await prisma.product.create({
    data: {
      name: "Bakso Jumbo",
      price: 25000,
      description: "Bakso super besar dengan isian lengkap",
      photo: "/img/produk/placeholder.jpg",
      isFeatured: true,
      productCategoryId: baksoCategory.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 5,
      comment: "Baksonya enak banget! Recommended!",
      userId: users[0].id,
      umkmId: bakso.id,
    },
  });

  // 2. Kopi Kenangan
  const kopi = await prisma.umkm.create({
    data: {
      name: "Kopi Kenangan",
      slug: "kopi-kenangan",
      description: "Kedai kopi kekinian dengan WiFi gratis",
      address: "Jl. Teknik Kimia No. 8, Keputih, Surabaya",
      phone: "081234567891",
      openingHours: "08:00 - 22:00",
      photos: ["/img/produk/placeholder.jpg"],
      latitude: -7.278912,
      longitude: 112.791784,
      rating: 4.7,
      hasPromo: false,
      isRecommended: true,
      categoryId: minuman.id,
      ownerId: users[1].id,
    },
  });

  const kopiCategory = await prisma.productCategory.create({
    data: { name: "Coffee", umkmId: kopi.id },
  });

  await prisma.product.create({
    data: {
      name: "Es Kopi Susu Gula Aren",
      price: 18000,
      description: "Es kopi susu dengan gula aren asli",
      photo: "/img/produk/placeholder.jpg",
      isFeatured: true,
      productCategoryId: kopiCategory.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 5,
      comment: "Kopinya mantap! WiFi kenceng!",
      userId: users[1].id,
      umkmId: kopi.id,
    },
  });

  // 3. Laundry Express
  const laundry = await prisma.umkm.create({
    data: {
      name: "Laundry Express",
      slug: "laundry-express",
      description: "Layanan laundry kiloan dengan teknologi modern",
      address: "Jl. Arief Rahman Hakim No. 45, Keputih, Surabaya",
      phone: "081234567892",
      openingHours: "07:00 - 20:00",
      photos: ["/img/produk/placeholder.jpg"],
      latitude: -7.277912,
      longitude: 112.792784,
      rating: 4.3,
      hasPromo: true,
      isRecommended: false,
      categoryId: jasa.id,
      ownerId: users[2].id,
    },
  });

  const laundryCategory = await prisma.productCategory.create({
    data: { name: "Layanan", umkmId: laundry.id },
  });

  await prisma.product.create({
    data: {
      name: "Cuci + Setrika",
      price: 7000,
      description: "Cuci bersih + setrika rapi per kg",
      photo: "/img/produk/placeholder.jpg",
      isFeatured: true,
      productCategoryId: laundryCategory.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 4,
      comment: "Pelayanan cepat dan hasil bagus",
      userId: users[2].id,
      umkmId: laundry.id,
    },
  });

  // 4. Toko ATK
  const atk = await prisma.umkm.create({
    data: {
      name: "Toko ATK Sukses",
      slug: "toko-atk-sukses",
      description: "Toko alat tulis kantor terlengkap",
      address: "Jl. Teknik Mesin No. 23, Keputih, Surabaya",
      phone: "081234567893",
      openingHours: "08:00 - 21:00",
      photos: ["/img/produk/placeholder.jpg"],
      latitude: -7.276912,
      longitude: 112.793784,
      rating: 4.1,
      hasPromo: false,
      isRecommended: false,
      categoryId: belanja.id,
      ownerId: users[0].id,
    },
  });

  const atkCategory = await prisma.productCategory.create({
    data: { name: "ATK", umkmId: atk.id },
  });

  await prisma.product.create({
    data: {
      name: "Paket Alat Tulis",
      price: 50000,
      description: "Buku, pensil, pulpen, penghapus lengkap",
      photo: "/img/produk/placeholder.jpg",
      isFeatured: true,
      productCategoryId: atkCategory.id,
    },
  });

  console.log("Seeding completed with 4 UMKMs!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });