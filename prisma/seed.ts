// File: prisma/seed.ts

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // =================================================================
  // BAGIAN BARU: Membuat satu pengguna dummy untuk semua ulasan
  // =================================================================
  console.log('Membuat user dummy...');
  const dummyUser = await prisma.user.upsert({
    where: { email: 'dummy@user.com' },
    update: {},
    create: {
      name: 'Pengunjung LokalKeren',
      email: 'dummy@user.com',
      password: 'password123', // Tidak perlu di-hash untuk seeding
      role: 'PELANGGAN',
    },
  });
  console.log('User dummy dibuat...');

  // Bagian Kategori (Tidak ada perubahan, sudah benar)
  const catMakanan = await prisma.category.upsert({
    where: { slug: 'makanan' },
    update: {},
    create: { name: 'Makanan', slug: 'makanan' },
  });

  const catMinuman = await prisma.category.upsert({
    where: { slug: 'minuman' },
    update: {},
    create: { name: 'Minuman', slug: 'minuman' },
  });

  const catJasa = await prisma.category.upsert({
    where: { slug: 'jasa' },
    update: {},
    create: { name: 'Jasa', slug: 'jasa' },
  });

  console.log('Kategori dibuat...');

  // Bagian UMKM (Tidak ada perubahan, sudah benar)
  await prisma.umkm.upsert({
    where: { slug: 'bakso-cak-man' },
    update: {},
    create: {
      name: 'Bakso Cak Man PENS',
      slug: 'bakso-cak-man',
      description: 'Bakso legendaris di depan gerbang PENS yang jadi penyelamat mahasiswa.',
      address: 'Jl. Raya ITS, Keputih, Sukolilo, Surabaya',
      phone: '08123456789',
      openingHours: '10:00 - 21:00',
      photos: ['/images/placeholder-umkm.jpg', '/images/placeholder-umkm.jpg'],
      latitude: -7.275,
      longitude: 112.795,
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
  console.log('Menghapus data lama (urutan penting)...');
  await prisma.review.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.productCategory.deleteMany({});
  await prisma.umkm.deleteMany({});
  await prisma.category.deleteMany({});

  const allUmkms = await prisma.umkm.findMany();

  console.log('Membuat ulasan dummy...');

  for (const umkm of allUmkms) {
    const reviewsData = [];

    // =============================================================
    // BAGIAN YANG DIPERBAIKI: Mengganti `author` dengan `userId`
    // =============================================================
    if (umkm.slug === 'bakso-cak-man') {
      reviewsData.push(
        { umkmId: umkm.id, userId: dummyUser.id, rating: 5, comment: 'Baksonya 10/10! Kuahnya gurih banget, porsinya pas. Penyelamat banget pas lagi nugas.' },
        { umkmId: umkm.id, userId: dummyUser.id, rating: 4, comment: 'Rasa masih otentik dari dulu. Cuma tempatnya agak panas aja kalo siang.' }
      );
    } else if (umkm.slug === 'kopi-kenangan-its') {
      reviewsData.push({ umkmId: umkm.id, userId: dummyUser.id, rating: 5, comment: 'Kopi Susu Gula Aren-nya emang paling pas buat nemenin nugas di perpus. Tempatnya juga bersih.' });
    } else if (umkm.slug === 'warung-bu-tini') {
      reviewsData.push(
        { umkmId: umkm.id, userId: dummyUser.id, rating: 5, comment: 'Gudegnya authentic banget! Rasanya persis kaya di Jogja, harga juga ramah di kantong mahasiswa.' },
        { umkmId: umkm.id, userId: dummyUser.id, rating: 4, comment: 'Enak dan murah, cocok buat makan sehari-hari. Buka 24 jam juga jadi bisa makan kapan aja.' }
      );
    } else if (umkm.slug === 'sate-ayam-pak-joko') {
      reviewsData.push({ umkmId: umkm.id, userId: dummyUser.id, rating: 5, comment: 'Sate ayamnya juicy, bumbu kacangnya pas banget. Recommended buat makan malam!' });
    } else if (umkm.slug === 'ayam-geprek-bensu') {
      reviewsData.push(
        { umkmId: umkm.id, userId: dummyUser.id, rating: 4, comment: 'Level pedasnya bisa disesuaikan, enak banget! Ayamnya crispy dan bumbu gepreknya mantap.' },
        { umkmId: umkm.id, userId: dummyUser.id, rating: 5, comment: 'Porsinya banyak, harganya terjangkau. Jadi langganan nih!' }
      );
    } else if (umkm.slug === 'laundry-express') {
      reviewsData.push({ umkmId: umkm.id, userId: dummyUser.id, rating: 4, comment: 'Pelayanannya cepat dan bersih. Harga per kilo juga reasonable untuk mahasiswa.' });
    }

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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
