import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import bcrypt from "bcrypt";

// Instantiate Prisma Client
const prisma = new PrismaClient();

/**
 * Generates a URL-friendly slug from a given string.
 * @param name - The string to slugify.
 * @returns A slugified string.
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars
    .replace(/[\s_-]+/g, "-") // Replace spaces with -
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing -
}

/**
 * Main seeding function.
 */
async function main() {
  console.log("Start seeding ...");

  // 1. Clean up the database to avoid conflicts
  // Delete in reverse order of dependency
  console.log("Cleaning database ...");
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.review.deleteMany();
  // We must delete reviews *before* users they depend on
  await prisma.user.deleteMany();
  await prisma.umkm.deleteMany();
  // We must delete UMKM *before* categories they depend on
  await prisma.category.deleteMany();
  console.log("Database cleaned.");

  // 2. Create Categories
  console.log("Creating categories ...");
  const catMakanan = await prisma.category.create({
    data: {
      name: "Makanan",
      slug: "makanan",
    },
  });

  const catMinuman = await prisma.category.create({
    data: {
      name: "Minuman",
      slug: "minuman",
    },
  });

  const catJasa = await prisma.category.create({
    data: {
      name: "Jasa",
      slug: "jasa",
    },
  });

  const catBelanja = await prisma.category.create({
    data: {
      name: "Belanja",
      slug: "belanja",
    },
  });
  console.log("Categories created.");

  // 3. Create Mock User (PELANGGAN)
  // This user MUST exist before we can create reviews that link to it.
  console.log("Creating mock user (Pelanggan) ...");
  const mockUserId = "cl_mock_seed_user_id"; // The ID we will use for REVIEWS

  // Use upsert to create the user if it doesn't exist.
  const hashedPassword = await bcrypt.hash("mockpassword123", 10);
  await prisma.user.upsert({
    where: { id: mockUserId },
    update: {}, // Nothing to update if it already exists
    create: {
      id: mockUserId,
      email: "mock-user@example.com", // Assuming email is required and unique
      name: "Mock Seeder User", // Assuming name is optional
      password: hashedPassword, // Field 'password' wajib diisi dan di-hash
      role: "PELANGGAN", // Mengatur role default
    },
  });
  console.log("Mock user (Pelanggan) ensured.");

  // 4. Create UMKM with nested Products and Reviews
  console.log("Creating UMKM data ...");

  // --- Elmyra ice tea ---
  console.log("Creating owner for Elmyra...");
  const elmyraSlug = slugify("Elmyra ice tea"); // Buat slug sekali
  const elmyraOwner = await prisma.user.upsert({
    where: { email: `${elmyraSlug}_owner@example.com` },
    update: {},
    create: {
      name: `${elmyraSlug}_owner`,
      email: `${elmyraSlug}_owner@example.com`,
      password: await bcrypt.hash(elmyraSlug, 10), // password is 'elmyra-ice-tea' (hashed)
      role: "PENGUSAHA",
    },
  });

  console.log("Creating Elmyra ice tea...");
  await prisma.umkm.create({
    data: {
      name: "Elmyra ice tea",
      slug: elmyraSlug, // Gunakan slug yang sudah dibuat
      description:
        "Menyediakan aneka minuman teh segar dengan berbagai varian rasa.",
      address: "Jl. Gebang Lor No. 5, Surabaya",
      phone: "081234567890",
      openingHours: "10:00 - 21:00",
      photos: ["/images/umkm/Elmyra Ice Tea-min.jpeg"], // Path foto dari kode Anda
      latitude: -7.29098,
      longitude: 112.801155,
      rating: new Decimal(4.5),
      hasPromo: true,
      isRecommended: true,
      categoryId: catMinuman.id,
      ownerId: elmyraOwner.id, // <-- Logika owner ditambahkan kembali
      Review: {
        create: [
          { rating: 5, comment: "Tehnya enak dan murah!", userId: mockUserId },
          {
            rating: 4,
            comment: "Segar banget, tempatnya bersih.",
            userId: mockUserId,
          },
        ],
      },
      ProductCategory: {
        create: [
          {
            name: "Ice Tea Series",
            Product: {
              create: [
                {
                  name: "Original Ice Tea",
                  description: "Es teh original.",
                  price: 5000,
                  photo: "/images/umkm/Elmyra Ice Tea-min.jpeg", // Path foto dari kode Anda
                  isFeatured: true,
                },
                {
                  name: "Lemon Tea",
                  description: "Es teh lemon segar.",
                  price: 7000,
                  photo: "/images/umkm/Elmyra Ice Tea-min.jpeg", // Path foto dari kode Anda
                },
              ],
            },
          },
        ],
      },
    },
  });

  // --- Nasi Pecel Nganjuk ---
  console.log("Creating owner for Nasi Pecel Nganjuk...");
  const pecelSlug = slugify("Nasi Pecel Nganjuk"); // Buat slug sekali
  const pecelOwner = await prisma.user.upsert({
    where: { email: `${pecelSlug}_owner@example.com` },
    update: {},
    create: {
      name: `${pecelSlug}_owner`,
      email: `${pecelSlug}_owner@example.com`,
      password: await bcrypt.hash(pecelSlug, 10), // password is 'nasi-pecel-nganjuk' (hashed)
      role: "PENGUSAHA",
    },
  });

  console.log("Creating Nasi Pecel Nganjuk...");
  await prisma.umkm.create({
    data: {
      name: "Nasi Pecel Nganjuk",
      slug: pecelSlug, // Gunakan slug yang sudah dibuat
      description:
        "Nasi pecel khas Nganjuk dengan bumbu kacang mantap dan lauk lengkap.",
      address: "Jl. Mulyosari No. 16, Surabaya",
      phone: "081555666777",
      openingHours: "07:00 - 15:00",
      photos: ["/images/umkm/Nasi Pecel Nganjuk-min.jpeg"], // Path foto dari kode Anda
      latitude: -7.288661948397033,
      longitude: 112.800366596775,
      rating: new Decimal(4.7),
      hasPromo: false,
      isRecommended: true,
      categoryId: catMakanan.id,
      ownerId: pecelOwner.id, // <-- Logika owner ditambahkan kembali
      Review: {
        create: [
          {
            rating: 5,
            comment: "Bumbunya pas, lauknya banyak pilihan!",
            userId: mockUserId,
          },
          {
            rating: 4,
            comment: "Salah satu pecel terenak di area ini.",
            userId: mockUserId,
          },
        ],
      },
      ProductCategory: {
        create: [
          {
            name: "Menu Utama",
            Product: {
              create: [
                {
                  name: "Nasi Pecel Lauk Empal",
                  description: "Nasi pecel dengan lauk empal suwir.",
                  price: 20000,
                  photo: "/images/umkm/Nasi Pecel Nganjuk-min.jpeg", // Path foto dari kode Anda
                  isFeatured: true,
                },
                {
                  name: "Nasi Pecel Lauk Ayam",
                  description: "Nasi pecel dengan lauk ayam goreng.",
                  price: 18000,
                  photo: "/images/umkm/Nasi Pecel Nganjuk-min.jpeg", // Path foto dari kode Anda
                },
                {
                  name: "Nasi Pecel Polos",
                  description: "Nasi pecel tanpa lauk tambahan.",
                  price: 10000,
                  photo: "/images/umkm/Nasi Pecel Nganjuk-min.jpeg", // Path foto dari kode Anda
                },
              ],
            },
          },
        ],
      },
    },
  });

  // --- Hisana fried chiken ---
  console.log("Creating owner for Hisana fried chiken...");
  const hisanaSlug = slugify("Hisana fried chiken");
  const hisanaOwner = await prisma.user.upsert({
    where: { email: `${hisanaSlug}_owner@example.com` },
    update: {},
    create: {
      name: `${hisanaSlug}_owner`,
      email: `${hisanaSlug}_owner@example.com`,
      password: await bcrypt.hash(hisanaSlug, 10),
      role: "PENGUSAHA",
    },
  });

  console.log("Creating Hisana fried chiken...");
  await prisma.umkm.create({
    data: {
      name: "Hisana fried chiken",
      slug: hisanaSlug,
      description: "Ayam goreng krispi dengan cita rasa khas.",
      address: "Jl. Gebang Putih No. 10, Surabaya",
      phone: "081222333444",
      openingHours: "09:00 - 21:00",
      photos: ["/images/umkm/Hisana-min.jpeg"],
      latitude: -7.2902368442785415,
      longitude: 112.79661669232253,
      rating: new Decimal(4.6),
      categoryId: catMakanan.id,
      ownerId: hisanaOwner.id,
      Review: {
        create: [{ rating: 5, comment: "Ayamnya renyah!", userId: mockUserId }],
      },
      ProductCategory: {
        create: [
          {
            name: "Paket Nasi",
            Product: {
              create: [
                {
                  name: "Paket Nasi + Dada",
                  price: 15000,
                  photo: "/images/umkm/Hisana-min.jpeg",
                },
              ],
            },
          },
        ],
      },
    },
  });

  // --- Kantin bahagia ---
  console.log("Creating owner for Kantin bahagia...");
  const kantinSlug = slugify("Kantin bahagia");
  const kantinOwner = await prisma.user.upsert({
    where: { email: `${kantinSlug}_owner@example.com` },
    update: {},
    create: {
      name: `${kantinSlug}_owner`,
      email: `${kantinSlug}_owner@example.com`,
      password: await bcrypt.hash(kantinSlug, 10),
      role: "PENGUSAHA",
    },
  });

  console.log("Creating Kantin bahagia...");
  await prisma.umkm.create({
    data: {
      name: "Kantin bahagia",
      slug: kantinSlug,
      description: "Aneka masakan rumahan harga mahasiswa.",
      address: "Jl. Teknik Kimia No. 1, Surabaya",
      phone: "081333444555",
      openingHours: "08:00 - 16:00",
      photos: ["/images/umkm/Kantin bahagia-min.jpeg"],
      latitude: -7.2755475890184025,
      longitude: 112.79373603879733,
      rating: new Decimal(4.3),
      categoryId: catMakanan.id,
      ownerId: kantinOwner.id,
      Review: {
        create: [
          { rating: 4, comment: "Murah dan kenyang.", userId: mockUserId },
        ],
      },
      ProductCategory: {
        create: [
          {
            name: "Menu Nasi",
            Product: {
              create: [
                { name: "Nasi Campur", price: 12000 },
                { name: "Nasi Rawon", price: 15000 },
              ],
            },
          },
        ],
      },
    },
  });

  // --- Pangsit mie tenda merah ---
  console.log("Creating owner for Pangsit mie tenda merah...");
  const pangsitSlug = slugify("Pangsit mie tenda merah");
  const pangsitOwner = await prisma.user.upsert({
    where: { email: `${pangsitSlug}_owner@example.com` },
    update: {},
    create: {
      name: `${pangsitSlug}_owner`,
      email: `${pangsitSlug}_owner@example.com`,
      password: await bcrypt.hash(pangsitSlug, 10),
      role: "PENGUSAHA",
    },
  });

  console.log("Creating Pangsit mie tenda merah...");
  await prisma.umkm.create({
    data: {
      name: "Pangsit mie tenda merah",
      slug: pangsitSlug,
      description: "Pangsit mie ayam legendaris di area kampus.",
      address: "Jl. Teknik Kimia No. 2, Surabaya",
      phone: "081444555666",
      openingHours: "17:00 - 23:00",
      photos: ["/images/umkm/Pangsit mie tenda merah-min.jpeg"],
      latitude: -7.2755475890184025,
      longitude: 112.79373603879733,
      rating: new Decimal(4.5),
      categoryId: catMakanan.id,
      ownerId: pangsitOwner.id,
      Review: {
        create: [
          { rating: 5, comment: "Mienya enak banget!", userId: mockUserId },
        ],
      },
      ProductCategory: {
        create: [
          {
            name: "Menu Mie",
            Product: {
              create: [
                { name: "Mie Ayam Biasa", price: 10000 },
                { name: "Mie Ayam Bakso", price: 13000 },
              ],
            },
          },
        ],
      },
    },
  });

  // --- Gokarin ---
  console.log("Creating owner for Gokarin...");
  const gokarinSlug = slugify("Gokarin");
  const gokarinOwner = await prisma.user.upsert({
    where: { email: `${gokarinSlug}_owner@example.com` },
    update: {},
    create: {
      name: `${gokarinSlug}_owner`,
      email: `${gokarinSlug}_owner@example.com`,
      password: await bcrypt.hash(gokarinSlug, 10),
      role: "PENGUSAHA",
    },
  });

  console.log("Creating Gokarin...");
  await prisma.umkm.create({
    data: {
      name: "Gokarin",
      slug: gokarinSlug,
      description: "Masakan Jepang halal dan murah.",
      address: "Jl. Teknik Kimia No. 3, Surabaya",
      phone: "081555666777",
      openingHours: "10:00 - 20:00",
      photos: ["/images/umkm/Gokarin-min.jpeg"],
      latitude: -7.2755475890184025,
      longitude: 112.79373603879733,
      rating: new Decimal(4.4),
      categoryId: catMakanan.id,
      ownerId: gokarinOwner.id,
      Review: {
        create: [
          { rating: 4, comment: "Katsunya lumayan.", userId: mockUserId },
        ],
      },
      ProductCategory: {
        create: [
          {
            name: "Menu Bento",
            Product: {
              create: [
                { name: "Chicken Katsu", price: 18000 },
                { name: "Ekkado", price: 15000 },
              ],
            },
          },
        ],
      },
    },
  });

  // --- D lapak ---
  console.log("Creating owner for D lapak...");
  const dlapakSlug = slugify("D lapak");
  const dlapakOwner = await prisma.user.upsert({
    where: { email: `${dlapakSlug}_owner@example.com` },
    update: {},
    create: {
      name: `${dlapakSlug}_owner`,
      email: `${dlapakSlug}_owner@example.com`,
      password: await bcrypt.hash(dlapakSlug, 10),
      role: "PENGUSAHA",
    },
  });

  console.log("Creating D lapak...");
  await prisma.umkm.create({
    data: {
      name: "D lapak",
      slug: dlapakSlug,
      description: "Pujasera aneka makanan dan minuman.",
      address: "Jl. Teknik Kimia No. 4, Surabaya",
      phone: "081666777888",
      openingHours: "09:00 - 22:00",
      photos: ["/images/umkm/D Lapak-min.jpeg"],
      latitude: -7.2755475890184025,
      longitude: 112.79373603879733,
      rating: new Decimal(4.2),
      categoryId: catMakanan.id,
      ownerId: dlapakOwner.id,
      Review: {
        create: [{ rating: 4, comment: "Banyak pilihan.", userId: mockUserId }],
      },
      ProductCategory: {
        create: [
          {
            name: "Aneka Nasi",
            Product: { create: [{ name: "Nasi Goreng", price: 13000 }] },
          },
          {
            name: "Aneka Minuman",
            Product: { create: [{ name: "Es Teh", price: 3000 }] },
          },
        ],
      },
    },
  });

  // --- Mustika Laundry ---
  console.log("Creating owner for Mustika Laundry...");
  const laundrySlug = slugify("Mustika Laundry");
  const laundryOwner = await prisma.user.upsert({
    where: { email: `${laundrySlug}_owner@example.com` },
    update: {},
    create: {
      name: `${laundrySlug}_owner`,
      email: `${laundrySlug}_owner@example.com`,
      password: await bcrypt.hash(laundrySlug, 10),
      role: "PENGUSAHA",
    },
  });

  console.log("Creating Mustika Laundry...");
  await prisma.umkm.create({
    data: {
      name: "Mustika Laundry",
      slug: laundrySlug,
      description: "Jasa cuci setrika kiloan dan satuan.",
      address: "Jl. Gebang Wetan No. 30, Surabaya",
      phone: "081777888999",
      openingHours: "08:00 - 20:00",
      photos: ["/images/umkm/Mustika Laundry-min.jpeg"],
      latitude: -7.287502914523411,
      longitude: 112.80084322454094,
      rating: new Decimal(4.8),
      categoryId: catJasa.id,
      ownerId: laundryOwner.id,
      Review: {
        create: [
          { rating: 5, comment: "Bersih dan wangi!", userId: mockUserId },
        ],
      },
      ProductCategory: {
        create: [
          {
            name: "Paket Laundry",
            Product: {
              create: [
                { name: "Cuci Kering Setrika (per kg)", price: 5000 },
                { name: "Setrika Saja (per kg)", price: 3000 },
              ],
            },
          },
        ],
      },
    },
  });

  // --- Keke Juice ---
  console.log("Creating owner for Keke Juice...");
  const kekeSlug = slugify("Keke Juice");
  const kekeOwner = await prisma.user.upsert({
    where: { email: `${kekeSlug}_owner@example.com` },
    update: {},
    create: {
      name: `${kekeSlug}_owner`,
      email: `${kekeSlug}_owner@example.com`,
      password: await bcrypt.hash(kekeSlug, 10),
      role: "PENGUSAHA",
    },
  });

  console.log("Creating Keke Juice...");
  await prisma.umkm.create({
    data: {
      name: "Keke Juice",
      slug: kekeSlug,
      description: "Aneka jus buah segar tanpa pemanis buatan.",
      address: "Jl. Arief Rahman Hakim No. 10, Surabaya",
      phone: "081888999000",
      openingHours: "10:00 - 20:00",
      photos: ["/images/umkm/keke-min.jpeg"],
      latitude: -7.281516515760358,
      longitude: 112.78625549646951,
      rating: new Decimal(4.6),
      categoryId: catMinuman.id,
      ownerId: kekeOwner.id,
      Review: {
        create: [
          {
            rating: 5,
            comment: "Jusnya kental dan segar.",
            userId: mockUserId,
          },
        ],
      },
      ProductCategory: {
        create: [
          {
            name: "Aneka Jus",
            Product: {
              create: [
                { name: "Jus Alpukat", price: 10000 },
                { name: "Jus Mangga", price: 8000 },
              ],
            },
          },
        ],
      },
    },
  });

  // --- Air Minum Isi Ulang A Rahman ---
  console.log("Creating owner for Air Minum Isi Ulang A Rahman...");
  const airSlug = slugify("Air Minum Isi Ulang A Rahman");
  const airOwner = await prisma.user.upsert({
    where: { email: `${airSlug}_owner@example.com` },
    update: {},
    create: {
      name: `${airSlug}_owner`,
      email: `${airSlug}_owner@example.com`,
      password: await bcrypt.hash(airSlug, 10),
      role: "PENGUSAHA",
    },
  });

  console.log("Creating Air Minum Isi Ulang A Rahman...");
  await prisma.umkm.create({
    data: {
      name: "Air Minum Isi Ulang A Rahman",
      slug: airSlug,
      description: "Depot air minum isi ulang RO dan mineral.",
      address: "Jl. Arief Rahman Hakim No. 11, Surabaya",
      phone: "081999000111",
      openingHours: "07:00 - 21:00",
      photos: ["/images/umkm/a rahman-min.jpeg"],
      latitude: -7.281622746011931,
      longitude: 112.78648053434864,
      rating: new Decimal(4.7),
      categoryId: catJasa.id,
      ownerId: airOwner.id,
      Review: {
        create: [
          {
            rating: 5,
            comment: "Airnya segar, layanan cepat.",
            userId: mockUserId,
          },
        ],
      },
      ProductCategory: {
        create: [
          {
            name: "Jenis Air",
            Product: {
              create: [
                { name: "Isi Ulang RO (Galon)", price: 5000 },
                { name: "Isi Ulang Mineral (Galon)", price: 4000 },
              ],
            },
          },
        ],
      },
    },
  });

  // --- Barra Barbershop ---
  console.log("Creating owner for Barra Barbershop...");
  const barraSlug = slugify("Barra Barbershop");
  const barraOwner = await prisma.user.upsert({
    where: { email: `${barraSlug}_owner@example.com` },
    update: {},
    create: {
      name: `${barraSlug}_owner`,
      email: `${barraSlug}_owner@example.com`,
      password: await bcrypt.hash(barraSlug, 10),
      role: "PENGUSAHA",
    },
  });

  console.log("Creating Barra Barbershop...");
  await prisma.umkm.create({
    data: {
      name: "Barra Barbershop",
      slug: barraSlug,
      description: "Pangkas rambut pria dengan gaya modern.",
      address: "Jl. Arief Rahman Hakim No. 12, Surabaya",
      phone: "082111222333",
      openingHours: "10:00 - 21:00",
      photos: ["/images/umkm/Barra Barbershop-min.jpeg"],
      latitude: -7.281657998660703,
      longitude: 112.78674339083096,
      rating: new Decimal(4.9),
      categoryId: catJasa.id,
      ownerId: barraOwner.id,
      Review: {
        create: [
          {
            rating: 5,
            comment: "Potongannya rapi dan stylish.",
            userId: mockUserId,
          },
        ],
      },
      ProductCategory: {
        create: [
          {
            name: "Layanan",
            Product: {
              create: [
                { name: "Potong Rambut Dewasa", price: 30000 },
                { name: "Potong Rambut + Cuci", price: 40000 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("UMKM data created.");
  console.log("Seeding finished.");
}

// Execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Close the Prisma Client connection
    await prisma.$disconnect();
  });
