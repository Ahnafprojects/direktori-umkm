import L from 'leaflet';

// Custom blue location marker icon yang bisa digunakan di semua komponen peta
export const blueLocationIcon = new L.Icon({
    iconUrl: '/images/icon/location-marker-blue.svg',
    iconSize: [30, 40], // Ukuran icon (width, height)
    iconAnchor: [15, 40], // Anchor point (center bottom of icon)
    popupAnchor: [0, -40], // Popup anchor relative to icon anchor
});

// Icon untuk UMKM yang berbeda dari location picker
export const umkmMarkerIcon = new L.Icon({
    iconUrl: '/images/icon/location-marker-blue.svg',
    iconSize: [25, 33], // Sedikit lebih kecil untuk UMKM di peta
    iconAnchor: [12, 33],
    popupAnchor: [0, -33],
});

// Icon untuk checkout/delivery
export const deliveryMarkerIcon = new L.Icon({
    iconUrl: '/images/icon/location-marker-blue.svg',
    iconSize: [28, 37],
    iconAnchor: [14, 37],
    popupAnchor: [0, -37],
});