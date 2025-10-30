# Map Clustering & Enhanced Popup

Sistem peta UMKM telah diperbarui dengan fitur clustering dan popup yang lebih baik.

## Fitur Clustering

### Anti-Overlapping Markers

- **Deteksi Kedekatan**: Marker yang berjarak kurang dari 0.0001 derajat (sekitar 10 meter) akan dikelompokkan
- **Auto Grouping**: UMKM dengan koordinat yang sama atau sangat dekat akan otomatis digabung dalam satu cluster
- **Visual Indicator**: Cluster menampilkan badge dengan angka jumlah UMKM di lokasi tersebut

### Algoritma Clustering

```typescript
const groupNearbyMarkers = (pins: MapPin[], threshold = 0.0001) => {
  // Mengelompokkan marker berdasarkan jarak koordinat
  // threshold 0.0001 ≈ 10 meter radius
};
```

## Enhanced Popup

### Single UMKM Popup

Popup untuk satu UMKM menampilkan:

- **Header Image**: Foto UMKM dengan category badge
- **Rating**: Bintang dan skor rating
- **Alamat**: Dengan ikon lokasi
- **Jam Buka**: Dengan ikon jam
- **Telepon**: Dengan ikon telepon
- **Action Button**: Tombol "Lihat Detail" dengan styling orange

### Multiple UMKM Popup

Popup untuk cluster menampilkan:

- **Header**: Jumlah UMKM dengan badge
- **UMKM List**:
  - Thumbnail image
  - Nama dan kategori
  - Rating (jika ada)
  - Tombol detail individual
- **Scrollable**: Untuk banyak UMKM dengan custom scrollbar

### Popup Styling

- **Modern Design**: Border radius 12px, subtle shadow
- **Responsive Width**: 288px (single), 320px (cluster)
- **Custom Close Button**: Circular button dengan hover effect
- **Smooth Animations**: Hover effects dan transitions
- **Dark Mode**: Automatic dark theme support

## Marker Types

### Single Marker

- **Pin Style**: Droplet shape dengan kategori icon
- **Label**: Nama UMKM dengan background gradient
- **Colors**: Orange theme (#f97316)
- **Hover Effect**: Scale dan shadow enhancement

### Cluster Marker

- **Circle Style**: 60px diameter dengan gradient background
- **Icon**: Kategori dominan dalam cluster
- **Badge**: Red circle dengan jumlah UMKM
- **Interactive**: Hover effect dengan scale animation

## Data Requirements

```typescript
type MapPin = {
  id: number;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
  address?: string;
  phone?: string;
  openingHours?: string;
  rating?: number;
  category: { name: string };
};
```

## Database Updates

Fungsi `getUmkmForMap()` sekarang mengambil field tambahan:

- `address` - Untuk alamat di popup
- `phone` - Untuk kontak di popup
- `openingHours` - Untuk jam operasional
- `rating` - Untuk rating bintang

## CSS Features

### Custom Scrollbar

```css
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}
```

### Responsive Design

- Mobile friendly popup sizing
- Touch-friendly button sizing
- Optimized for small screens

### Animation Effects

- Smooth marker hover effects
- Popup fade-in animations
- Button hover transitions

## Benefits

- ✅ **No Overlapping**: Marker tidak bertumpuk lagi
- ✅ **Better UX**: Popup lebih informatif dan menarik
- ✅ **Performance**: Clustering mengurangi beban rendering
- ✅ **Mobile Friendly**: Responsive design untuk semua device
- ✅ **Accessibility**: Proper ARIA labels dan keyboard navigation
- ✅ **Visual Appeal**: Modern design dengan consistent theming
