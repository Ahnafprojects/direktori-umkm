// src/lib/time-helper.ts

/**
 * Mengecek apakah sebuah UMKM buka sekarang
 * @param openingHours String jam buka (misal: "09:00 - 21:00" atau "24 Jam")
 * @returns boolean
 */
export function isUmkmOpen(openingHours: string | null | undefined): boolean {
  if (!openingHours || openingHours.toLowerCase() === 'tutup') {
    return false;
  }

  if (openingHours.toLowerCase() === '24 jam') {
    return true;
  }

  // Pisahkan jam buka dan tutup
  const parts = openingHours.split(' - ');
  if (parts.length !== 2) {
    // Format tidak dikenali, anggap saja tutup
    return false;
  }

  const [openTime, closeTime] = parts;
  const [openHour, openMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);

  // Dapatkan waktu saat ini di zona waktu 'Asia/Jakarta' (WIB)
  const now = new Date();
  const wibDateString = now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
  const nowInWIB = new Date(wibDateString);

  const currentHour = nowInWIB.getHours();
  const currentMinute = nowInWIB.getMinutes();

  // Buat perbandingan dalam format menit
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  const openTimeInMinutes = openHour * 60 + openMinute;
  const closeTimeInMinutes = closeHour * 60 + closeMinute;

  // Kasus khusus: Buka lewat tengah malam (misal: 21:00 - 02:00)
  if (closeTimeInMinutes < openTimeInMinutes) {
    // Jika jam tutup < jam buka, artinya lewat tengah malam
    // Cek apakah waktu saat ini ADA di antara jam buka s/d 23:59
    // ATAU di antara 00:00 s/d jam tutup
    return (
      (currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes <= 23 * 60 + 59) ||
      (currentTimeInMinutes >= 0 && currentTimeInMinutes <= closeTimeInMinutes)
    );
  }

  // Kasus normal: Buka di hari yang sama
  return (
    currentTimeInMinutes >= openTimeInMinutes &&
    currentTimeInMinutes <= closeTimeInMinutes
  );
}