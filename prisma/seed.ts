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
    productCategories: [
      {
        name: 'Internet & Gaming',
        products: [
          { name: 'Internet per jam', price: 3000, isFeatured: true, photo: '/img/produk/warnet.svg', description: 'Akses internet unlimited per jam.' },
          { name: 'Gaming per jam', price: 5000, isFeatured: true },
          { name: 'Private Room per jam', price: 8000 },
        ],
      },
      {
        name: 'Layanan Print',
        products: [
          { name: 'Print B&W per lembar', price: 500, isFeatured: true },
          { name: 'Print Color per lembar', price: 2000 },
          { name: 'Fotocopy per lembar', price: 300 },
        ],
      },
      {
        name: 'Layanan Digital',
        products: [
          { name: 'Scan per lembar', price: 1000 },
          { name: 'Jilid per eksemplar', price: 5000 },
          { name: 'Laminating per lembar', price: 2000 },
        ],
      },
    ],
    reviews: [
      { rating: 4, comment: 'Internet cepat, cocok buat ngerjain tugas.', author: 'Mahasiswa Teknik' },
      { rating: 4, comment: 'Buka 24 jam, sangat membantu deadline.', author: 'Anak Skripsi' },
    ],
  },
];

// =================================================================
// 3. KODE UNTUK MEMASUKKAN DATA (JANGAN DIUBAH)
// =================================================================

async function main() {
  console.log('Menghapus data lama (urutan penting)...');
  await prisma.review.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.productCategory.deleteMany({});
  await prisma.umkm.deleteMany({});
  await prisma.category.deleteMany({});

  console.log('Memasukkan data Kategori UMKM...');
  for (const cat of umkmCategoryData) {
    await prisma.category.upsert({
      where: { slug: cat.slug.toLowerCase() },
      update: { name: cat.name, slug: cat.slug.toLowerCase() },
      create: { name: cat.name, slug: cat.slug.toLowerCase() },
    });
  }

  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map((cat) => [cat.slug, cat.id]));

  console.log('Memasukkan data UMKM, Kategori Produk, Produk, dan Review...');
  for (const data of umkmData) {
    const umkmInfo = data.umkm;
    const categoryId = categoryMap.get(umkmInfo.categorySlug.toLowerCase());

    if (!categoryId) {
      console.warn(`Kategori UMKM "${umkmInfo.categorySlug}" tidak ditemukan. UMKM "${umkmInfo.name}" dilewati.`);
      continue;
    }

    await prisma.umkm.create({
      data: {
        // Data UMKM
        name: umkmInfo.name,
        slug: umkmInfo.slug,
        description: umkmInfo.description,
        address: umkmInfo.address,
        phone: umkmInfo.phone === '-' ? null : umkmInfo.phone,
        openingHours: umkmInfo.openingHours,
        photos: umkmInfo.photos || [],
        latitude: umkmInfo.latitude,
        longitude: umkmInfo.longitude,
        rating: umkmInfo.rating,
        hasPromo: umkmInfo.hasPromo,
        isRecommended: umkmInfo.isRecommended,
        categoryId: categoryId,

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
    });
  }
  console.log('Seeding selesai!');
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

  await Promise.all([
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Baksonya enak banget! Recommended!",
        userId: users[0].id,
        umkmId: bakso.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Kuahnya gurih, baksonya kenyal. Mantap jiwa!",
        userId: users[1].id,
        umkmId: bakso.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Porsi besar, harga terjangkau untuk kantong mahasiswa",
        userId: users[2].id,
        umkmId: bakso.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Bakso jumbonya benar-benar jumbo! Worth it banget",
        userId: users[0].id,
        umkmId: bakso.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Tempat favorit makan bakso di Surabaya, rasanya konsisten",
        userId: users[1].id,
        umkmId: bakso.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Dari jaman kuliah udah langganan di sini, ga pernah mengecewakan",
        userId: users[2].id,
        umkmId: bakso.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Baksonya enak, tapi kadang antri agak lama",
        userId: users[0].id,
        umkmId: bakso.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Best bakso ever! Kuahnya bening tapi rasa daging banget",
        userId: users[1].id,
        umkmId: bakso.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Tempatnya sederhana tapi rasanya juara",
        userId: users[2].id,
        umkmId: bakso.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Pelayanannya ramah, baksonya fresh",
        userId: users[0].id,
        umkmId: bakso.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Mie ayamnya juga enak, bukan cuma baksonya",
        userId: users[1].id,
        umkmId: bakso.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Sudah 10 tahun jadi pelanggan, tetap yang terbaik!",
        userId: users[2].id,
        umkmId: bakso.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Harga naik dikit tapi kualitas tetap terjaga",
        userId: users[0].id,
        umkmId: bakso.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Bakso uratnya the best! Teksturnya pas banget",
        userId: users[1].id,
        umkmId: bakso.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Tempat makan bakso paling recommended di area ITS",
        userId: users[2].id,
        umkmId: bakso.id,
      },
    }),
  ]);

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

  await Promise.all([
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Kopinya mantap! WiFi kenceng!",
        userId: users[1].id,
        umkmId: kopi.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Es kopi susu gula arennya juara, manis tapi ga eneg",
        userId: users[0].id,
        umkmId: kopi.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Tempat nongkrong favorit, suasananya cozy banget",
        userId: users[2].id,
        umkmId: kopi.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Harga terjangkau untuk kualitas kopi yang premium",
        userId: users[1].id,
        umkmId: kopi.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Barista-nya friendly, kopinya selalu konsisten",
        userId: users[0].id,
        umkmId: kopi.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Tempatnya instagramable, cocok buat WFC",
        userId: users[2].id,
        umkmId: kopi.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Menu non-kopi juga enak, smoothie bowlnya recommended",
        userId: users[1].id,
        umkmId: kopi.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Buka dari pagi, cocok buat breakfast meeting",
        userId: users[0].id,
        umkmId: kopi.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Gula aren-nya authentic, bukan sirup biasa",
        userId: users[2].id,
        umkmId: kopi.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "AC-nya adem, parkir luas, overall good",
        userId: users[1].id,
        umkmId: kopi.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Cappuccino-nya creamy, foam art-nya bagus",
        userId: users[0].id,
        umkmId: kopi.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Croissant-nya renyah, pas dimakan sama kopi panas",
        userId: users[2].id,
        umkmId: kopi.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Staff-nya ramah, pelayanan cepat meski rame",
        userId: users[1].id,
        umkmId: kopi.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Menu seasonal-nya selalu menarik untuk dicoba",
        userId: users[0].id,
        umkmId: kopi.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Kopi lokal terbaik di area Keputih, wajib coba!",
        userId: users[2].id,
        umkmId: kopi.id,
      },
    }),
  ]);

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

  await Promise.all([
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Pelayanan cepat dan hasil bagus",
        userId: users[2].id,
        umkmId: laundry.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Harga murah, hasil cuci kering bagus banget",
        userId: users[0].id,
        umkmId: laundry.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Laundry-nya bersih dan wangi, staff ramah",
        userId: users[1].id,
        umkmId: laundry.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Setrika-nya rapi, lipatan baju seperti beli baru",
        userId: users[2].id,
        umkmId: laundry.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Buka sampai malam, convenient untuk anak kos",
        userId: users[0].id,
        umkmId: laundry.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Deterjen-nya berkualitas, noda bandel bisa hilang",
        userId: users[1].id,
        umkmId: laundry.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Owner-nya friendly, ngobrol sambil nunggu laundry",
        userId: users[2].id,
        umkmId: laundry.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Udah 3 tahun langganan, never disappointed",
        userId: users[0].id,
        umkmId: laundry.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Parfum laundry-nya soft, ga bikin sesak napas",
        userId: users[1].id,
        umkmId: laundry.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Express service-nya membantu banget pas urgent",
        userId: users[2].id,
        umkmId: laundry.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Bisa ambil-antar ke kos, very helpful",
        userId: users[0].id,
        umkmId: laundry.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Sistem pembayaran fleksibel, bisa transfer",
        userId: users[1].id,
        umkmId: laundry.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Mesin cuci-nya modern, hasil kering sempurna",
        userId: users[2].id,
        umkmId: laundry.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Tarif per kg-nya ekonomis, cocok buat mahasiswa",
        userId: users[0].id,
        umkmId: laundry.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Tempat tunggu-nya nyaman, ada WiFi dan AC",
        userId: users[1].id,
        umkmId: laundry.id,
      },
    }),
  ]);

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

  await Promise.all([
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Alat tulis lengkap, harga bersaing",
        userId: users[1].id,
        umkmId: atk.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Tempat belanja ATK terlengkap di Keputih",
        userId: users[0].id,
        umkmId: atk.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Buku tulis murah, kualitas kertas bagus",
        userId: users[2].id,
        umkmId: atk.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Printer-nya bisa buat fotocopy sama print",
        userId: users[1].id,
        umkmId: atk.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Owner-nya helpful, tau semua kebutuhan mahasiswa",
        userId: users[0].id,
        umkmId: atk.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Buka sampai malem, cocok buat emergency shopping",
        userId: users[2].id,
        umkmId: atk.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Pulpen gel-nya awet, ga cepet habis",
        userId: users[1].id,
        umkmId: atk.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Map plastik sama stop map-nya berkualitas",
        userId: users[0].id,
        umkmId: atk.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Ada diskon buat pembelian partai besar",
        userId: users[2].id,
        umkmId: atk.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Stok selalu ready, ga pernah kehabisan",
        userId: users[1].id,
        umkmId: atk.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Pelayanan ramah, bisa request barang khusus",
        userId: users[0].id,
        umkmId: atk.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Kertas A4-nya putih bersih, bagus buat laporan",
        userId: users[2].id,
        umkmId: atk.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Tempat strategis, deket kampus dan kos-kosan",
        userId: users[1].id,
        umkmId: atk.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: "Spidol boardmarker-nya tahan lama dan ga luntur",
        userId: users[0].id,
        umkmId: atk.id,
      },
      
    }),

     prisma.review.create({
      data: {
        rating: 5,
        comment: "Spidol boardmarker-nya tahan lama dan ga luntur",
        userId: users[0].id,
        umkmId: atk.id,
      },
      
    }),
     prisma.review.create({
      data: {
        rating: 5,
        comment: "Spidol boardmarker-nya tahan lama dan ga luntur",
        userId: users[0].id,
        umkmId: atk.id,
      },
      
    }),
     prisma.review.create({
      data: {
        rating: 5,
        comment: "Spidol boardmarker-nya tahan lama dan ga luntur",
        userId: users[0].id,
        umkmId: atk.id,
      },
      
    }),
     prisma.review.create({
      data: {
        rating: 5,
        comment: "Spidol boardmarker-nya tahan lama dan ga luntur",
        userId: users[0].id,
        umkmId: atk.id,
      },
      
    }),
     prisma.review.create({
      data: {
        rating: 5,
        comment: "Spidol boardmarker-nya tahan lama dan ga luntur",
        userId: users[0].id,
        umkmId: atk.id,
      },
      
    }), prisma.review.create({
      data: {
        rating: 5,
        comment: "Spidol boardmarker-nya tahan lama dan ga luntur",
        userId: users[0].id,
        umkmId: atk.id,
      },
      
    }),
     prisma.review.create({
      data: {
        rating: 5,
        comment: "Spidol boardmarker-nya tahan lama dan ga luntur",
        userId: users[0].id,
        umkmId: atk.id,
      },
      
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: "Udah jadi langganan dari semester 1, recommend!",
        userId: users[2].id,
        umkmId: atk.id,
      },
    }),
  ]);

  console.log("Seeding completed with 4 UMKMs!");
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