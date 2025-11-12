# 🏪 Direktori UMKM LokalKeren

Aplikasi web untuk menemukan dan mendukung UMKM (Usaha Mikro Kecil Menengah) lokal di sekitar Anda. Dibangun dengan Next.js, TypeScript, Prisma, dan PostgreSQL.

## ✨ Fitur Utama

- 🔍 **Pencarian UMKM** - Cari berdasarkan nama atau kategori
- 📍 **Peta Interaktif** - Lihat lokasi UMKM dengan marker yang informatif
- 🧭 **Cari Terdekat** - Temukan UMKM terdekat berdasarkan lokasi Anda
- ⭐ **Sistem Review** - Baca dan tulis ulasan untuk UMKM
- 🛍️ **Katalog Produk** - Jelajahi produk dan layanan setiap UMKM
- 🌓 **Mode Gelap/Terang** - UI yang nyaman di mata
- 📱 **Responsive Design** - Optimal di desktop dan mobile
- 🔐 **Autentikasi** - Login sebagai pelanggan atau pengusaha
- 🤖 **Rekomendasi AI** - Saran UMKM berdasarkan preferensi
- ⏰ **Filter Buka Sekarang** - Tampilkan hanya UMKM yang sedang buka

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: NextAuth.js
- **Maps**: Leaflet, OpenStreetMap
- **AI**: Groq API
- **UI Components**: shadcn/ui, Radix UI

## 📋 Prerequisite

Pastikan sudah terinstall:

- **Node.js** (v18 atau lebih baru)
- **npm** atau **yarn**
- **PostgreSQL** (lokal atau cloud)

## ⚙️ Instalasi & Setup

### 1. Clone Repository

```bash
git clone https://github.com/Ahnafprojects/direktori-umkm.git
cd direktori-umkm
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi Environment Variables

Buat file `.env` di root project:

```env
# Database PostgreSQL
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]"

# NextAuth Secret (generate dengan: openssl rand -base64 32)
NEXTAUTH_SECRET="string-rahasia-yang-panjang-dan-aman"
NEXTAUTH_URL="http://localhost:3000"

# Groq API Key untuk fitur AI (opsional)
GROQ_API_KEY="gsk_your_groq_api_key_here"
```

### 4. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Jalankan migrasi database
npx prisma migrate dev

# Seed database dengan data contoh
npx prisma db seed
```

### 5. Jalankan Aplikasi

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 📊 Database Schema

### Models Utama:

- **User** - Data pengguna (pelanggan & pengusaha)
- **Category** - Kategori UMKM (Makanan, Minuman, Jasa)
- **Umkm** - Data UMKM dengan lokasi dan informasi lengkap
- **Product** - Produk/layanan yang ditawarkan UMKM
- **Review** - Ulasan pengguna untuk UMKM

## 🔑 Akun Testing

Setelah menjalankan seed, Anda dapat login dengan:

### Akun Pelanggan:

- **Email**: `mock-user@example.com`
- **Password**: `mockpassword123`

### Akun Pengusaha:

- **Email**: `elmyra-ice-tea_owner@example.com`
- **Password**: `elmyra-ice-tea`

## 🗺️ Fitur Peta

- **Marker Kustom** - Ikon berbeda untuk setiap kategori UMKM
- **Info Popup** - Gambar, nama, kategori, dan link detail
- **Navigasi** - Zoom, pan, dan kontrol peta lengkap

## 🎨 Tema

Aplikasi mendukung beberapa tema:

- Light (default)
- Dark
- Theme Rose
- Theme Ocean

## 📱 Responsive Design

- **Mobile First** - Dioptimalkan untuk penggunaan mobile
- **Tablet Support** - Layout yang baik di tablet
- **Desktop** - Grid dan layout yang luas di desktop

## 🚀 Scripts

```bash
# Development
npm run dev

# Build untuk production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Database commands
npx prisma studio        # GUI database
npx prisma migrate reset # Reset database
npx prisma db push       # Push schema tanpa migrasi
```

## 📂 Struktur Project

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API Routes
│   ├── _components/    # Komponen khusus halaman
│   └── [pages]/        # Halaman aplikasi
├── components/         # Komponen reusable
│   └── ui/            # UI components (shadcn)
├── lib/               # Utilitas dan konfigurasi
├── store/             # State management (Zustand)
└── types/             # TypeScript types

prisma/
├── schema.prisma      # Database schema
├── seed.ts           # Data seeding
└── migrations/       # Database migrations

public/
└── images/           # Static images
    └── umkm/        # UMKM photos
```

## 🤝 Contributing

1. Fork repository
2. Buat branch feature (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

## 📝 License

Project ini menggunakan MIT License.

## 🎯 Roadmap

- [ ] Sistem booking/pemesanan online
- [ ] Notifikasi push
- [ ] Export data UMKM
- [ ] Dashboard analytics untuk pengusaha
- [ ] Integrasi payment gateway
- [ ] Multi-language support

## ⚠️ Troubleshooting

### Database Connection Error

- Pastikan PostgreSQL berjalan
- Cek konfigurasi `DATABASE_URL` di `.env`
- Jalankan `npx prisma migrate reset` jika perlu

### NextAuth Error

- Generate `NEXTAUTH_SECRET` baru: `openssl rand -base64 32`
- Pastikan `NEXTAUTH_URL` sesuai dengan domain Anda

### Build Error

- Jalankan `npm run lint` untuk cek error
- Pastikan semua dependencies ter-install
- Clear `.next` folder dan build ulang

## 📖 Dokumentasi & Simbol

Project ini memiliki beberapa file dokumentasi dengan akhiran `.md` yang menjelaskan fitur-fitur yang sudah dibuat:

- `AI_ASSISTANT_ROLE_DOCUMENTATION.md` - Dokumentasi fitur AI Assistant
- `OWNER_REPLY_DOCUMENTATION.md` - Dokumentasi fitur Owner Reply
- `POPULAR_RECOMMENDATIONS_OPTIMIZATION.md` - Optimisasi rekomendasi populer
- `UMKM_ANALYTICS_INTEGRATION.md` - Integrasi analytics untuk owner
- `PENJELASAN_SIMBOL.md` - **Penjelasan arti simbol ✅ ❌ dan emoji lainnya**

### Arti Simbol dalam Dokumentasi

Dokumentasi menggunakan simbol emoji untuk memudahkan pemahaman:

- ✅ **Checkmark** = Fitur sudah selesai dan berfungsi dengan baik
- ❌ **X Mark** = Masalah yang sudah diperbaiki atau hal yang salah
- 🎯 **Target** = Tujuan atau overview
- 🔧 **Wrench** = Technical implementation
- 🚀 **Rocket** = Ready for production

**Catatan**: Simbol ❌ di dokumentasi **BUKAN error** - ini hanya menjelaskan masalah yang sudah diperbaiki atau perbandingan sebelum/sesudah.

📚 Lihat file `PENJELASAN_SIMBOL.md` untuk penjelasan lengkap tentang semua simbol yang digunakan.

---

💡 **Tips**: Gunakan `npx prisma studio` untuk melihat dan mengedit data database melalui GUI yang user-friendly.
