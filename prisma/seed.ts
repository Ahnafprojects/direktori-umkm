import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.umkm.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create dummy user
  const dummyUser = await prisma.user.create({
    data: {
      name: "Pengunjung LokalKeren",
      email: "dummy@user.com",
      password: "password123",
      role: "PELANGGAN",
    },
  });

  // Create all categories
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
  console.log("Categories created!");

  // Create sample UMKMs for each category
  console.log("Creating sample UMKMs...");

  // Makanan
  await prisma.umkm.create({
    data: {
      name: "Bakso Cak Man",
      slug: "bakso-cak-man",
      description: "Bakso legendaris di depan kampus",
      address: "Jl. Raya ITS",
      phone: "081234567890",
      openingHours: "10:00 - 21:00",
      photos: ["/images/placeholder-umkm.jpg"],
      latitude: -7.279912,
      longitude: 112.790784,
      categoryId: makanan.id,
      ProductCategory: {
        create: {
          name: "Menu Utama",
          Product: {
            create: {
              name: "Bakso Jumbo",
              price: 25000,
              description: "Bakso super besar dengan isian daging melimpah",
              isFeatured: true,
            },
          },
        },
      },
    },
  });

  // Minuman
  await prisma.umkm.create({
    data: {
      name: "Kopi Kenangan",
      slug: "kopi-kenangan",
      description: "Kedai kopi kekinian",
      address: "Jl. Teknik Kimia",
      phone: "081234567891",
      openingHours: "08:00 - 22:00",
      photos: ["/images/placeholder-umkm.jpg"],
      latitude: -7.278912,
      longitude: 112.791784,
      categoryId: minuman.id,
      ProductCategory: {
        create: {
          name: "Kopi",
          Product: {
            create: {
              name: "Es Kopi Susu",
              price: 18000,
              description: "Es kopi susu dengan gula aren",
              isFeatured: true,
            },
          },
        },
      },
    },
  });

  // Jasa
  await prisma.umkm.create({
    data: {
      name: "Laundry Express",
      slug: "laundry-express",
      description: "Laundry kiloan express",
      address: "Jl. Arief Rahman Hakim",
      phone: "081234567892",
      openingHours: "07:00 - 20:00",
      photos: ["/images/placeholder-umkm.jpg"],
      latitude: -7.277912,
      longitude: 112.792784,
      categoryId: jasa.id,
      ProductCategory: {
        create: {
          name: "Layanan",
          Product: {
            create: {
              name: "Cuci + Setrika",
              price: 7000,
              description: "Harga per kg",
              isFeatured: true,
            },
          },
        },
      },
    },
  });

  // Belanja
  await prisma.umkm.create({
    data: {
      name: "Toko ATK Sukses",
      slug: "toko-atk-sukses",
      description: "Toko alat tulis lengkap",
      address: "Jl. Teknik Mesin",
      phone: "081234567893",
      openingHours: "08:00 - 21:00",
      photos: ["/images/placeholder-umkm.jpg"],
      latitude: -7.276912,
      longitude: 112.793784,
      categoryId: belanja.id,
      ProductCategory: {
        create: {
          name: "ATK",
          Product: {
            create: {
              name: "Paket Alat Tulis",
              price: 50000,
              description: "Buku tulis, pensil, pulpen, dan penghapus",
              isFeatured: true,
            },
          },
        },
      },
    },
  });

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
