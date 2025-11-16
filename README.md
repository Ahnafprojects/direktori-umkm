# 🏪 LokalKeren: Platform Direktori & E-commerce UMKM

Lebih dari sekadar direktori. Ini adalah ekosistem full-stack untuk menemukan, memesan, dan mengelola UMKM lokal, ditenagai oleh AI.

Proyek ini dibangun untuk kompetisi "Web In Action 2025" dengan visi melampaui brief: dari "direktori statis" menjadi "platform e-commerce dinamis dua sisi" yang lengkap.

---

## 📖 Latar Belakang & Konsep

Proyek ini lahir dari sebuah masalah sederhana namun krusial yang ada di brief kompetisi:

- **Masalah 1: Visibilitas Rendah** - UMKM (kedai bakso, warung kopi) sulit ditemukan secara online. Informasi mereka tersebar, tidak lengkap, dan seringkali kedaluwarsa.

- **Masalah 2: Direktori "Mati"** - Direktori yang ada saat ini bersifat statis, seperti buku telepon digital. Tidak ada interaksi, tidak ada update real-time, dan tidak membantu pengguna mengambil keputusan.

- **Masalah 3: Kesenjangan Pengalaman (User Gap)** - Pengguna modern tidak hanya butuh "daftar", mereka butuh "rekomendasi cerdas", filter lokasi real-time, dan alur yang jelas untuk bertransaksi.

### Visi Kami: Dari Direktori Statis Menjadi Platform Dinamis

Kami tidak hanya membuat daftar. Kami membangun sebuah ekosistem penuh dengan dua visi utama:

1. **Discovery Cerdas** - Membantu pengguna menemukan UMKM yang tepat melalui AI, filter lokasi real-time, dan filter jam buka.

2. **Alur E-commerce Penuh** - Memberikan pengalaman end-to-end (terima beres) dari melihat menu, memesan, hingga melacak pengiriman.

---

## ✨ Fitur Unggulan

Proyek ini dibagi menjadi dua pengalaman utama: untuk **Pelanggan** dan untuk **Pengusaha UMKM**.

### Untuk Pelanggan (User-Facing)

#### 🚀 Discovery Cerdas (3x Filter):

- **Filter "Cari Terdekat"** - Menggunakan Geolocation API & query Haversine (PostgreSQL) untuk mengurutkan UMKM dari lokasi real-time pengguna.

- **Filter "Buka Sekarang"** - Filter timezone-aware (WIB) yang secara akurat memfilter UMKM berdasarkan jam operasional.

- **Pencarian Cerdas (Autocomplete)** - Search bar cmdk yang memberi saran real-time saat mengetik.

#### 🤖 Integrasi AI:

- **Rekomendasi AI** - Carousel personal di Halaman Utama. AI menganalisis data Favorit pengguna untuk merekomendasikan UMKM lain.

- **Ringkasan Ulasan AI** - Tombol on-demand di Halaman Detail untuk meringkas puluhan ulasan menjadi 2 kalimat sentimen (pro & kontra).

- **Asisten AI Kontekstual** - Chatbot floating yang "sudah membaca" seluruh data UMKM dan "tahu" cara kerja website (RAG).

#### 🛒 Alur E-commerce Penuh (Full-Stack):

- **Keranjang (Zustand)** - Keranjang belanja client-side yang persisten.

- **Checkout Cerdas** - Alur checkout dengan opsi "Ambil Sendiri" atau "Dianterin" (dengan auto-deteksi lokasi via Geolocation & simulasi peta).

- **Transaksi Database (Real)** - Pesanan disimpan di tabel Order & OrderItem di PostgreSQL, bukan localStorage.

#### 📍 Peta & Pelacakan Lanjutan:

- **Mode "Map View"** - Halaman /map yang menampilkan semua pin UMKM di peta Leaflet untuk eksplorasi visual.

- **Rute Google Maps** - Integrasi tombol "Dapatkan Rute" ke Google Maps.

- **Simulasi Live Tracking** - Halaman /status yang menampilkan simulasi pergerakan driver di peta setelah checkout.

#### 👥 Fitur Pengguna (Full-Stack):

- **Sistem Favorit (Hybrid)** - Sistem canggih yang menyimpan favorit di localStorage (untuk guest) dan otomatis sinkronisasi ke Database (UserFavoriteUmkm) saat login.

- **Ulasan Nyata (Full-Stack)** - Pengguna login bisa menulis ulasan. Rating rata-rata UMKM akan otomatis ter-update di database.

- **Histori Transaksi (Database)** - Halaman /history yang mengambil riwayat pesanan nyata dari database (bukan localStorage).

#### 🎨 UX Premium:

- **Pusat Notifikasi Real-Time** - Ikon lonceng di header dengan notifikasi real-time dari database untuk balasan ulasan dan update status pesanan (misal: "Pesanan Tiba!").

- **Notifikasi Toast** - Umpan balik instan (via react-hot-toast) untuk aksi pengguna seperti "Tambah ke Keranjang" atau "Error".

- **Multi-Tema** - Kustomisasi tema (Light, Rose, Ocean).

- **Animasi (Framer Motion)** - Transisi halaman dan animasi grid stagger yang smooth.

- **Desain Responsif** - Kartu horizontal di HP, kartu vertikal di Desktop.

- **Onboarding** - Pop-up sambutan & CTA "Buka Toko" (hanya muncul sekali).

### Untuk Pengusaha (UMKM-Facing)

#### 🔐 Autentikasi Terpadu:

- Satu alur registrasi (role: PELANGGAN).

- Pengguna bisa "Upgrade Akun" melalui halaman /buka-toko untuk menjadi PENGUSAHA.

- Backend db.$transaction menjamin pembuatan UMKM dan update role user terjadi bersamaan.

#### 📊 Dashboard UMKM (/dashboard):

- **Pusat Notifikasi Real-Time** - Notifikasi instan di header saat ada Pesanan Baru Masuk atau Ulasan Baru dari pelanggan.

- **Manajemen Pesanan (Real-Time)** - Melihat daftar pesanan yang masuk (PAID, PREPARING, SHIPPING) dan mengubah statusnya.

- **Manajemen Produk (CRUD)** - Mengelola Kategori Produk dan Produk (tambah, edit, hapus, ubah harga, tandai habis).

- **Dashboard Analytics (Business Intelligence)**:
  - **KPI**: Kartu Total Pendapatan, Modal/HPP, Profit Bersih, Pesanan Selesai, dan Rating Rata-rata.
  - **Grafik Penjualan**: Grafik garis (Recharts) pendapatan per hari (via query GROUP BY DATE).
  - **Produk Terlaris**: Daftar 5 produk terlaris (via query GROUP BY & SUM(quantity)).

---

🎨 UX Premium:

Pusat Notifikasi Real-Time: Ikon lonceng di header dengan notifikasi real-time dari database untuk balasan ulasan dan update status pesanan (misal: "Pesanan Tiba!").

Notifikasi Toast: Umpan balik instan (via react-hot-toast) untuk aksi pengguna seperti "Tambah ke Keranjang" atau "Error".

Multi-Tema: Kustomisasi tema (Light, Rose, Ocean).

Animasi (Framer Motion): Transisi halaman dan animasi grid stagger yang smooth.

Desain Responsif: Kartu horizontal di HP, kartu vertikal di Desktop.

Onboarding: Pop-up sambutan & CTA "Buka Toko" (hanya muncul sekali).

Untuk Pengusaha (UMKM-Facing)

🔐 Autentikasi Terpadu:

Satu alur registrasi (role: PELANGGAN).

Pengguna bisa "Upgrade Akun" melalui halaman /buka-toko untuk menjadi PENGUSAHA.

Backend db.$transaction menjamin pembuatan UMKM dan update role user terjadi bersamaan.

📊 Dashboard UMKM (/dashboard):

Pusat Notifikasi Real-Time: Notifikasi instan di header saat ada Pesanan Baru Masuk atau Ulasan Baru dari pelanggan.

Manajemen Pesanan (Real-Time): Melihat daftar pesanan yang masuk (PAID, PREPARING, SHIPPING) dan mengubah statusnya.

Manajemen Produk (CRUD): Mengelola Kategori Produk dan Produk (tambah, edit, hapus, ubah harga, tandai habis).

Dashboard Analytics (Business Intelligence):

KPI: Kartu Total Pendapatan, MModal/HPP, Profit Bersih, Pesanan Selesai, dan Rating Rata-rata.

Grafik Penjualan: Grafik garis (Recharts) pendapatan per hari (via query GROUP BY DATE).

Produk Terlaris: Daftar 5 produk terlaris (via query GROUP BY & SUM(quantity)).

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Frontend**: React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Recharts, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **AI**: Gemini
- **State**: Zustand (Hybrid: Keranjang, Favorit Tamu)
- **Peta**: Leaflet.js

---

## 📊 Database Schema (Prisma)

- **User**: Menyimpan data pelanggan & pengusaha (PELANGGAN/PENGUSAHA). Memiliki relasi ke Umkm, Review (dan ReviewReplies), Order, dan Favorite.

- **Category**: Kategori utama UMKM (Makanan, Jasa, Fashion, Kerajinan, dll).

- **Umkm**: Data inti toko, terhubung ke User (sebagai owner).

- **ProductCategory**: Kategori menu di dalam satu UMKM (misal: "Menu Sate", "Minuman").

- **Product**: Detail produk/menu, terhubung ke ProductCategory. Memiliki price (jual) dan costPrice (modal).

- **Review**: Ulasan, terhubung ke User dan Umkm. Memiliki field ownerReply untuk balasan.

- **Order**: "Kuitansi" pesanan, terhubung ke User dan Umkm. Memiliki paymentMethod.

- **OrderItem**: Detail barang di dalam Order, terhubung ke Product.

- **Favorite**: Tabel penghubung untuk User yang memfavoritkan Umkm (menggantikan UserFavoriteUmkm).

- **Notification**: (Tambahan Sesuai Fitur) Menyimpan notifikasi (pesan, status dibaca, link) untuk User dan UMKM.

---

## ⚙️ Instalasi & Setup

### 1. Clone Repository

```bash
git clone https://github.com/[username-kamu]/[repo-kamu].git
cd [repo-kamu]
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi Environment Variables

Buat file `.env.local` di root proyek:

```env
# Database PostgreSQL
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]"

# Kunci Rahasia Auth (sesuaikan dengan library-mu)
# Contoh untuk NextAuth:
NEXTAUTH_SECRET="[openssl rand -base64 32]"
NEXTAUTH_URL="http://localhost:3000"

# Gemini API Key untuk fitur AI
Gemini_API_KEY="gsk_...[kunci_api_gemini_kamu]"
```

### 4. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Jalankan migrasi database
npx prisma migrate dev

# Seed database dengan data contoh (termasuk user & UMKM dummy)
npx prisma db seed
```

### 5. Jalankan Aplikasi

```bash
npm run dev
```

Aplikasi akan berjalan di http://localhost:3000

---

## 🔑 Akun Testing

Setelah menjalankan seed, Anda dapat login dengan:

**Akun Pelanggan:**

- Email: `mock-user@example.com`
- Password: `mockpassword123`

**Akun Pengusaha:**

- Email: `elmyra-ice-tea_owner@example.com`
- Password: `elmyra-ice-tea`
- _(Akun ini sudah memiliki UMKM yang terhubung, siap untuk tes Dashboard)_

---

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
npx prisma studio       # GUI database di browser
npx prisma migrate reset # Reset database jika bermasalah
```
