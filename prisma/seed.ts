// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// =================================================================
// 1. DATA KATEGORI UMKM (Level 1)
// =================================================================
const umkmCategoryData = [
  { name: 'Makanan', slug: 'makanan' },
  { name: 'Minuman', slug: 'minuman' },
  { name: 'Jasa', slug: 'jasa' },
  { name: 'Belanja', slug: 'belanja' },
];

// =================================================================
// 2. DATA UMKM (Level 2) DAN PRODUKNYA (Level 3)
// Ini adalah data lengkap kita, dengan "nested" (bersarang)
// =================================================================
const umkmData = [
  {
    // Info UMKM
    umkm: {
      name: 'Sate Klopo Ondomohen Bu Asih',
      slug: 'sate-klopo-ondomohen-bu-asih',
      description: 'Sate legendaris dengan bumbu kelapa yang khas dan meresap.',
      address: 'Jl. Dharmahusada No.136, Mojo, Gubeng, Surabaya',
      phone: '(031)5474575',
      openingHours: '09:00 - 21:00',
      photos: ['/img/sate-klopo.svg'],
      latitude: -7.271512,
      longitude: 112.744211,
      rating: 4.8,
      hasPromo: false,
      isRecommended: true,
      categorySlug: 'makanan', // Slug dari umkmCategoryData
    },
    // Info Kategori Produk & Produknya
    productCategories: [
      {
        name: 'Menu Utama (Sate)',
        products: [
          { name: 'Sate Klopo Daging Sapi', price: 35000, isFeatured: true, photo: '/img/produk/sate-daging.svg', description: 'Sate daging sapi empuk dengan bumbu kelapa gurih.' },
          { name: 'Sate Klopo Ayam', price: 30000, isFeatured: true, photo: '/img/produk/sate-ayam.svg', description: 'Sate ayam bumbu kelapa.' },
          { name: 'Sate Klopo Usus', price: 25000 },
        ],
      },
      {
        name: 'Minuman',
        products: [
          { name: 'Es Teh Manis', price: 5000 },
          { name: 'Es Jeruk', price: 7000 },
        ],
      },
    ],
    // Info Ulasan
    reviews: [
      { rating: 5, comment: 'Satenya juara banget!', author: 'Penggemar Sate' },
      { rating: 4, comment: 'Bumbu kelapanya unik, enak.', author: 'KulinerSBY' },
    ],
  },

  {
    // Info UMKM
    umkm: {
      name: 'Bebek Sinjay Dharmahusada',
      slug: 'bebek-sinjay-dharmahusada',
      description: 'Bebek goreng Madura terkenal dengan sambal pencitnya.',
      address: 'Jl. Dharmahusada No.160B, Mojo, Gubeng, Surabaya',
      phone: '-',
      openingHours: '10:00 - 22:00',
      photos: ['/img/bebek-sinjay.svg'],
      latitude: -7.271845,
      longitude: 112.769543,
      rating: 4.7,
      hasPromo: false,
      isRecommended: true,
      categorySlug: 'makanan',
    },
    // Info Kategori Produk & Produknya
    productCategories: [
      {
        name: 'Menu Bebek',
        products: [
          { name: 'Bebek Goreng + Sambal Pencit', price: 30000, isFeatured: true, photo: '/img/produk/bebek-sinjay.svg', description: 'Paket bebek goreng + nasi + sambal pencit khas.' },
        ],
      },
      {
        name: 'Menu Ayam',
        products: [
          { name: 'Ayam Goreng', price: 25000 },
        ],
      },
      {
        name: 'Minuman',
        products: [
          { name: 'Es Teh Tawar', price: 4000 },
          { name: 'Teh Botol', price: 6000 },
        ],
      },
    ],
    // Info Ulasan
    reviews: [
      { rating: 4, comment: 'Sambel pencitnya nendang!', author: 'Anak Pedas' },
    ],
  },

  // --- TAMBAHKAN SISA DATA UMKM-MU DI SINI DENGAN FORMAT YANG SAMA ---
  {
    umkm: {
      name: 'Pasar Bunga Bratang',
      slug: 'pasar-bunga-bratang',
      description: 'Pusat penjualan aneka tanaman hias, bunga potong, dan bibit.',
      address: 'Jl. Bratang Binangun, Baratajaya, Gubeng',
      phone: '-',
      openingHours: '07:00 - 17:00',
      photos: ['/img/pasar-bratang.svg'],
      latitude: -7.299123,
      longitude: 112.756789,
      rating: 4.5,
      hasPromo: false,
      isRecommended: true,
      categorySlug: 'belanja',
    },
    productCategories: [
      {
        name: 'Tanaman Hias',
        products: [
          { name: 'Monstera Variegata', price: 500000, isFeatured: true, photo: '/img/produk/monstera.svg' },
          { name: 'Aglonema', price: 150000, isFeatured: true },
        ],
      },
      {
        name: 'Bunga Potong',
        products: [
          { name: 'Mawar (per tangkai)', price: 10000 },
        ],
      },
    ],
    reviews: [
      { rating: 5, comment: 'Pilihan tanamannya lengkap!', author: 'Tante Hijau' },
    ],
  },

  // === KATEGORI MINUMAN ===
  {
    umkm: {
      name: 'Kopi Tuku Surabaya',
      slug: 'kopi-tuku-surabaya',
      description: 'Kedai kopi specialty dengan biji kopi pilihan dan barista handal.',
      address: 'Jl. Raya Darmo No.68, Wonokromo, Surabaya',
      phone: '(031)5031234',
      openingHours: '07:00 - 23:00',
      photos: ['/img/kopi-tuku.svg'],
      latitude: -7.265432,
      longitude: 112.739876,
      rating: 4.6,
      hasPromo: true,
      isRecommended: true,
      categorySlug: 'minuman',
    },
    productCategories: [
      {
        name: 'Kopi Signature',
        products: [
          { name: 'Tuku Latte', price: 28000, isFeatured: true, photo: '/img/produk/tuku-latte.svg', description: 'Latte signature dengan foam art yang cantik.' },
          { name: 'Cappuccino Classic', price: 25000, isFeatured: true, photo: '/img/produk/cappuccino.svg' },
          { name: 'Americano', price: 20000, isFeatured: false },
        ],
      },
      {
        name: 'Kopi Dingin',
        products: [
          { name: 'Es Kopi Susu Gula Aren', price: 22000, isFeatured: true },
          { name: 'Cold Brew', price: 24000 },
          { name: 'Iced Latte', price: 26000 },
        ],
      },
      {
        name: 'Non-Kopi',
        products: [
          { name: 'Chocolate', price: 18000 },
          { name: 'Matcha Latte', price: 24000 },
          { name: 'Lemon Tea', price: 15000 },
        ],
      },
    ],
    reviews: [
      { rating: 5, comment: 'Kopinya premium banget! Latte artnya keren.', author: 'Coffee Lover' },
      { rating: 4, comment: 'Tempatnya cozy, cocok buat WFC.', author: 'Remote Worker' },
    ],
  },

  {
    umkm: {
      name: 'Chatime Surabaya',
      slug: 'chatime-surabaya',
      description: 'Minuman boba dan teh berkualitas dengan berbagai topping pilihan.',
      address: 'Jl. Pemuda No.31-37, Embong Kaliasin, Genteng, Surabaya',
      phone: '(031)5484567',
      openingHours: '10:00 - 22:00',
      photos: ['/img/chatime.svg'],
      latitude: -7.257123,
      longitude: 112.741234,
      rating: 4.3,
      hasPromo: false,
      isRecommended: false,
      categorySlug: 'minuman',
    },
    productCategories: [
      {
        name: 'Milk Tea',
        products: [
          { name: 'Brown Sugar Milk Tea', price: 24000, isFeatured: true, photo: '/img/produk/brown-sugar-milktea.svg', description: 'Milk tea dengan brown sugar dan pearl.' },
          { name: 'Taro Milk Tea', price: 22000, isFeatured: true },
          { name: 'Thai Milk Tea', price: 20000 },
        ],
      },
      {
        name: 'Fruit Tea',
        products: [
          { name: 'Passion Fruit QQ', price: 18000, isFeatured: false },
          { name: 'Lemon Yakult', price: 16000 },
          { name: 'Green Apple', price: 15000 },
        ],
      },
      {
        name: 'Topping',
        products: [
          { name: 'Pearl', price: 3000 },
          { name: 'Grass Jelly', price: 3000 },
          { name: 'Pudding', price: 4000 },
        ],
      },
    ],
    reviews: [
      { rating: 4, comment: 'Brown sugar milk tea nya enak, pearlnya kenyal.', author: 'Boba Addict' },
      { rating: 4, comment: 'Rasa konsisten, pelayanan cepat.', author: 'Student SBY' },
    ],
  },

  {
    umkm: {
      name: 'Es Teh Poci Angkringan Mas Gendut',
      slug: 'es-teh-poci-angkringan-mas-gendut',
      description: 'Angkringan legendaris dengan es teh poci yang segar dan makanan ringan.',
      address: 'Jl. Diponegoro No.58, Tegalsari, Surabaya',
      phone: '08123456789',
      openingHours: '17:00 - 02:00',
      photos: ['/img/angkringan.svg'],
      latitude: -7.269876,
      longitude: 112.738543,
      rating: 4.4,
      hasPromo: false,
      isRecommended: true,
      categorySlug: 'minuman',
    },
    productCategories: [
      {
        name: 'Minuman Tradisional',
        products: [
          { name: 'Es Teh Poci', price: 3000, isFeatured: true, photo: '/img/produk/es-teh-poci.svg', description: 'Es teh manis segar dari teko tanah liat.' },
          { name: 'Wedang Jahe', price: 4000, isFeatured: false },
          { name: 'Kopi Tubruk', price: 5000 },
        ],
      },
      {
        name: 'Cemilan',
        products: [
          { name: 'Sate Usus', price: 2000, isFeatured: true },
          { name: 'Tempe Mendoan', price: 1500 },
          { name: 'Nasi Kucing', price: 3000 },
        ],
      },
    ],
    reviews: [
      { rating: 5, comment: 'Es teh poci nya legend! Murah meriah.', author: 'Anak Kost' },
      { rating: 4, comment: 'Nostalgia banget, rasa autentik.', author: 'Pak RT' },
    ],
  },

  // === KATEGORI JASA ===
  {
    umkm: {
      name: 'Laundry Express 24 Jam',
      slug: 'laundry-express-24-jam',
      description: 'Layanan laundry kiloan 24 jam dengan sistem antar-jemput.',
      address: 'Jl. Ngagel Jaya Utara No.45, Gubeng, Surabaya',
      phone: '(031)5912345',
      openingHours: '24 Jam',
      photos: ['/img/laundry-express.svg'],
      latitude: -7.285432,
      longitude: 112.750123,
      rating: 4.2,
      hasPromo: true,
      isRecommended: false,
      categorySlug: 'jasa',
    },
    productCategories: [
      {
        name: 'Layanan Cuci',
        products: [
          { name: 'Cuci Kering Regular (per kg)', price: 7000, isFeatured: true, photo: '/img/produk/cuci-kering.svg', description: 'Layanan cuci kering standar.' },
          { name: 'Cuci Setrika (per kg)', price: 10000, isFeatured: true },
          { name: 'Cuci Express 6 jam (per kg)', price: 12000, isFeatured: false },
        ],
      },
      {
        name: 'Layanan Premium',
        products: [
          { name: 'Dry Cleaning', price: 25000, isFeatured: false },
          { name: 'Setrika Jas/Kemeja', price: 8000 },
          { name: 'Cuci Sepatu', price: 15000 },
        ],
      },
    ],
    reviews: [
      { rating: 4, comment: 'Bersih, wangi, harga terjangkau mahasiswa.', author: 'Mahasiswa ITS' },
      { rating: 4, comment: 'Pelayanan antar jemput membantu banget.', author: 'Ibu Rumah Tangga' },
    ],
  },

  {
    umkm: {
      name: 'Bengkel Motor Pak Joko',
      slug: 'bengkel-motor-pak-joko',
      description: 'Bengkel motor terpercaya dengan mekanik berpengalaman dan spare part lengkap.',
      address: 'Jl. Ketintang Baru No.89, Gayungan, Surabaya',
      phone: '08567891234',
      openingHours: '08:00 - 17:00',
      photos: ['/img/bengkel-motor.svg'],
      latitude: -7.315678,
      longitude: 112.728901,
      rating: 4.5,
      hasPromo: false,
      isRecommended: true,
      categorySlug: 'jasa',
    },
    productCategories: [
      {
        name: 'Service Rutin',
        products: [
          { name: 'Ganti Oli + Filter', price: 45000, isFeatured: true, photo: '/img/produk/ganti-oli.svg', description: 'Paket ganti oli dengan filter udara.' },
          { name: 'Tune Up Motor', price: 75000, isFeatured: true },
          { name: 'Service Rem', price: 50000 },
        ],
      },
      {
        name: 'Perbaikan',
        products: [
          { name: 'Ganti Ban', price: 120000, isFeatured: false },
          { name: 'Service CVT', price: 150000 },
          { name: 'Ganti Kampas Rem', price: 80000 },
        ],
      },
    ],
    reviews: [
      { rating: 5, comment: 'Pak Joko jujur, harga wajar, hasil memuaskan.', author: 'Driver Ojol' },
      { rating: 4, comment: 'Sudah langganan bertahun-tahun, terpercaya.', author: 'Warga Sekitar' },
    ],
  },

  {
    umkm: {
      name: 'Salon Kecantikan Sari Dewi',
      slug: 'salon-kecantikan-sari-dewi',
      description: 'Salon kecantikan lengkap untuk perawatan rambut dan wajah dengan terapis berpengalaman.',
      address: 'Jl. Rungkut Mejoyo Utara No.15, Rungkut, Surabaya',
      phone: '(031)8712345',
      openingHours: '09:00 - 21:00',
      photos: ['/img/salon-dewi.svg'],
      latitude: -7.319876,
      longitude: 112.789012,
      rating: 4.3,
      hasPromo: true,
      isRecommended: false,
      categorySlug: 'jasa',
    },
    productCategories: [
      {
        name: 'Perawatan Rambut',
        products: [
          { name: 'Potong + Blow', price: 35000, isFeatured: true, photo: '/img/produk/potong-rambut.svg', description: 'Potong rambut dengan styling blow dry.' },
          { name: 'Cat Rambut', price: 150000, isFeatured: true },
          { name: 'Rebonding', price: 300000, isFeatured: false },
        ],
      },
      {
        name: 'Perawatan Wajah',
        products: [
          { name: 'Facial Basic', price: 75000, isFeatured: true },
          { name: 'Facial Whitening', price: 120000 },
          { name: 'Treatment Jerawat', price: 100000 },
        ],
      },
      {
        name: 'Perawatan Kuku',
        products: [
          { name: 'Manicure', price: 25000 },
          { name: 'Pedicure', price: 30000 },
          { name: 'Nail Art', price: 50000 },
        ],
      },
    ],
    reviews: [
      { rating: 4, comment: 'Hasilnya bagus, mba nya ramah dan sabar.', author: 'Mama Muda' },
      { rating: 4, comment: 'Tempatnya bersih, alat steril.', author: 'Cewek Hits' },
    ],
  },

  {
    umkm: {
      name: 'Warnet & Print Digital Corner',
      slug: 'warnet-print-digital-corner',
      description: 'Warnet dengan fasilitas lengkap plus layanan print, scan, dan fotocopy.',
      address: 'Jl. Keputih Tegal Timur No.67, Sukolilo, Surabaya',
      phone: '08234567890',
      openingHours: '24 Jam',
      photos: ['/img/warnet.svg'],
      latitude: -7.279123,
      longitude: 112.796543,
      rating: 4.0,
      hasPromo: false,
      isRecommended: false,
      categorySlug: 'jasa',
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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
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

        // Buat Kategori Produk (bersarang)
        ProductCategory: {
          create: data.productCategories.map(pCat => ({
            name: pCat.name,
            // Buat Produk (bersarang di dalam kategori produk)
            Product: {
              create: pCat.products.map((prod: any) => ({
                name: prod.name,
                description: prod.description || null,
                price: prod.price,
                photo: prod.photo || null,
                isFeatured: prod.isFeatured || false,
              })),
            },
          })),
        },

        // Buat Ulasan (bersarang)
        Review: {
          create: data.reviews.map(rev => ({
            rating: rev.rating,
            comment: rev.comment,
            author: rev.author,
          })),
        },
      },
    });
  }
  console.log('Seeding selesai!');
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });