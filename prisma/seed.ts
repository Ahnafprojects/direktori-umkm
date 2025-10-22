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
      rating: 4.8,
      hasPromo: true,
      isRecommended: true,
      categoryId: catMakanan.id,
    },
  });

  await prisma.umkm.upsert({
    where: { slug: 'kopi-kenangan-its' },
    update: {},
    create: {
      name: 'Kopi Kenangan ITS',
      slug: 'kopi-kenangan-its',
      description: 'Kopi susu gula aren andalan untuk nugas.',
      address: 'Gedung Robotika ITS, Sukolilo, Surabaya',
      phone: '08567890123',
      openingHours: '07:00 - 22:00',
      photos: ['/images/placeholder-umkm.jpg'],
      latitude: -7.282,
      longitude: 112.794,
      rating: 4.5,
      hasPromo: false,
      isRecommended: true,
      categoryId: catMinuman.id,
    },
  });

  await prisma.umkm.upsert({
    where: { slug: 'warung-bu-tini' },
    update: {},
    create: {
      name: 'Warung Bu Tini',
      slug: 'warung-bu-tini',
      description: 'Nasi gudeg jogja asli dengan rasa autentik dan harga mahasiswa.',
      address: 'Jl. Teknik Kimia, Keputih, Sukolilo, Surabaya',
      phone: '08234567890',
      openingHours: '24 Jam',
      photos: ['/images/placeholder-umkm.jpg'],
      latitude: -7.276,
      longitude: 112.792,
      rating: 4.6,
      hasPromo: true,
      isRecommended: false,
      categoryId: catMakanan.id,
    },
  });

  await prisma.umkm.upsert({
    where: { slug: 'laundry-express' },
    update: {},
    create: {
      name: 'Laundry Express Keputih',
      slug: 'laundry-express',
      description: 'Laundry kiloan murah dan cepat, khusus untuk mahasiswa.',
      address: 'Jl. Keputih Tegal Timur, Sukolilo, Surabaya',
      phone: '08345678901',
      openingHours: '08:00 - 20:00',
      photos: ['/images/placeholder-umkm.jpg'],
      latitude: -7.278,
      longitude: 112.796,
      rating: 4.3,
      hasPromo: false,
      isRecommended: false,
      categoryId: catJasa.id,
    },
  });

  await prisma.umkm.upsert({
    where: { slug: 'indomaret-its' },
    update: {},
    create: {
      name: 'Indomaret ITS',
      slug: 'indomaret-its',
      description: 'Minimarket lengkap untuk kebutuhan sehari-hari mahasiswa.',
      address: 'Kampus ITS, Keputih, Sukolilo, Surabaya',
      phone: '08456789012',
      openingHours: '24 Jam',
      photos: ['/images/placeholder-umkm.jpg'],
      latitude: -7.280,
      longitude: 112.793,
      rating: 4.2,
      hasPromo: true,
      isRecommended: false,
      categoryId: catJasa.id,
    },
  });

  await prisma.umkm.upsert({
    where: { slug: 'sate-ayam-pak-joko' },
    update: {},
    create: {
      name: 'Sate Ayam Pak Joko',
      slug: 'sate-ayam-pak-j Joko',
      description: 'Sate ayam bakar dengan bumbu kacang spesial dan nasi hangat.',
      address: 'Jl. Gebang Putih, Sukolilo, Surabaya',
      phone: '08567890123',
      openingHours: '17:00 - 23:00',
      photos: ['/images/placeholder-umkm.jpg'],
      latitude: -7.274,
      longitude: 112.791,
      rating: 4.7,
      hasPromo: false,
      isRecommended: true,
      categoryId: catMakanan.id,
    },
  });

  await prisma.umkm.upsert({
    where: { slug: 'toko-kelontong-ibu-sri' },
    update: {},
    create: {
      name: 'Toko Kelontong Ibu Sri',
      slug: 'toko-kelontong-ibu-sri',
      description: 'Toko kelontong lengkap dengan harga bersahabat untuk mahasiswa.',
      address: 'Jl. Keputih Tegal Barat, Sukolilo, Surabaya',
      phone: '08678901234',
      openingHours: 'Tutup Sementara',
      photos: ['/images/placeholder-umkm.jpg'],
      latitude: -7.277,
      longitude: 112.797,
      rating: 4.0,
      hasPromo: false,
      isRecommended: false,
      categoryId: catJasa.id,
    },
  });

  await prisma.umkm.upsert({
    where: { slug: 'ayam-geprek-bensu' },
    update: {},
    create: {
      name: 'Ayam Geprek Bensu',
      slug: 'ayam-geprek-bensu',
      description: 'Ayam geprek dengan level pedas yang bisa disesuaikan, plus nasi anget.',
      address: 'Jl. Raya Mulyosari, Sukolilo, Surabaya',
      phone: '08789012345',
      openingHours: '11:00 - 22:30',
      photos: ['/images/placeholder-umkm.jpg'],
      latitude: -7.273,
      longitude: 112.798,
      rating: 4.4,
      hasPromo: true,
      isRecommended: false,
      categoryId: catMakanan.id,
    },
  });

  console.log('Data UMKM dibuat...');
  console.log('Menghapus ulasan lama...');
  await prisma.review.deleteMany({});

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

    if (reviewsData.length > 0) {
      await prisma.review.createMany({
        data: reviewsData,
      });
    }
  }

  console.log('Ulasan dummy berhasil dibuat.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });