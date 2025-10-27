// src/app/checkout/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Bike, MapPin, Package, Clock, Home, Building, LocateFixed, Loader2, CreditCard, Wallet, Banknote, QrCode, ChevronDown, Plus, Minus, Trash2, MessageCircle, Send } from 'lucide-react';
import dynamic from 'next/dynamic'; // <-- 1. IMPORT DYNAMIC
import { Skeleton } from '@/components/ui/skeleton'; // <-- 2. IMPORT SKELETON
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Helper untuk format Rupiah
const formatRupiah = (number: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};

const DELIVERY_FEE = 12000;
const FAKE_ESTIMASI = '15 - 20 menit';

// --- Alamat Tersimpan (Simulasi) ---
const savedAddresses = [
  { id: 'rumah', icon: Home, label: 'Rumah', address: 'Jl. Mawar No. 10, Keputih, Surabaya', coords: { lat: -7.280, long: 112.790 } },
  { id: 'kantor', icon: Building, label: 'Kantor', address: 'Gedung PENS, Jl. Raya ITS, Surabaya', coords: { lat: -7.275, long: 112.794 } },
];

// --- Data Metode Pembayaran ---
const paymentMethods = {
  cash: { id: 'cash', icon: Banknote, label: 'Bayar Tunai', description: 'Bayar langsung saat pesanan tiba' },
  qris: { id: 'qris', icon: QrCode, label: 'QRIS', description: 'Scan QR untuk pembayaran instan' },
  ewallet: [
    { id: 'gopay', label: 'GoPay', logo: '💚' },
    { id: 'dana', label: 'DANA', logo: '💙' },
    { id: 'ovo', label: 'OVO', logo: '💜' },
    { id: 'linkaja', label: 'LinkAja', logo: '❤️' },
  ],
  banks: [
    { id: 'bca', label: 'BCA', logo: '🔵' },
    { id: 'bni', label: 'BNI', logo: '🟠' },
    { id: 'bri', label: 'BRI', logo: '🔴' },
    { id: 'mandiri', label: 'Mandiri', logo: '🟡' },
  ]
};

export type Coords = { lat: number; long: number };

// --- 3. BUAT KOMPONEN PETA MINI (LIVE) ---
const CheckoutMap = dynamic(() => import('@/components/checkout-map'), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full" />,
});

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const cartItems = useCartStore((state) => state.cartItems);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const clearCart = useCartStore((state) => state.clearCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  
  const totalPrice = getTotalPrice();

  // --- State Management BARU ---
  const [deliveryOption, setDeliveryOption] = useState('pickup');
  const [selectedAddressId, setSelectedAddressId] = useState('rumah'); // 'rumah', 'kantor', atau 'current'
  
  // State untuk lokasi yg akan ditampilkan di peta
  const [mapLocation, setMapLocation] = useState<Coords>(savedAddresses[0].coords); // Default-nya 'Rumah'
  
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // --- State Pembayaran ---
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [selectedEwallet, setSelectedEwallet] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  
  // --- State Chat ---
  const [chatMessage, setChatMessage] = useState('');
  const [driverMessages, setDriverMessages] = useState<string[]>([]);
  const [storeMessages, setStoreMessages] = useState<string[]>([]);
  // -----------------------------

  const finalTotal = deliveryOption === 'delivery' ? totalPrice + DELIVERY_FEE : totalPrice;

  // --- REDIRECT JIKA BELUM LOGIN ---
  useEffect(() => {
    // Tunggu sampai status loading selesai
    if (status === 'loading') return;
    
    // Jika tidak ada session (belum login), redirect ke register
    if (status === 'unauthenticated') {
      toast.error('Silakan daftar atau masuk untuk melanjutkan checkout!', { 
        icon: '🔐',
        duration: 3000 
      });
      router.push('/register?redirect=' + encodeURIComponent('/checkout'));
      return;
    }
  }, [status, router]);

  // --- AUTO-DETECT LOKASI REAL SAAT PAGE LOAD ---
  useEffect(() => {
    // Auto-detect user location when page loads
    if (navigator.geolocation && deliveryOption === 'delivery') {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newCoords = { lat: latitude, long: longitude };
          setMapLocation(newCoords);
          setSelectedAddressId('current'); // Set to current location
          console.log('Auto-detected location:', newCoords);
        },
        (err) => {
          console.warn('Auto location detection failed:', err);
          // Silently fail, keep default location
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 300000 // 5 minutes cache
        }
      );
    }
  }, [deliveryOption]);

  // --- FUNGSI BARU: AUTO-DETECT LOKASI ---
  const handleDetectLocation = () => {
    setIsLocating(true);
    setLocationError(null);
    setSelectedAddressId('current'); // Pilih "Lokasi Saat Ini"

    if (!navigator.geolocation) {
      setLocationError('Browser tidak mendukung geolokasi.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newCoords = { lat: latitude, long: longitude };
        setMapLocation(newCoords); // <-- UPDATE PETA
        setIsLocating(false);
        toast.success('Lokasi berhasil terdeteksi!', { icon: '📍' });
      },
      (err) => {
        console.error(err);
        let errorMessage = 'Gagal mendapatkan lokasi. ';
        switch(err.code) {
          case err.PERMISSION_DENIED:
            errorMessage += 'Izinkan akses lokasi di browser.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage += 'Lokasi tidak tersedia.';
            break;
          case err.TIMEOUT:
            errorMessage += 'Timeout. Coba lagi.';
            break;
          default:
            errorMessage += 'Error tidak dikenal.';
            break;
        }
        setLocationError(errorMessage);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };
  
  // Fungsi untuk ganti alamat tersimpan
  const handleSelectSavedAddress = (id: string) => {
    setSelectedAddressId(id);
    const selected = savedAddresses.find(addr => addr.id === id);
    if (selected) {
      setMapLocation(selected.coords); // <-- UPDATE PETA
    }
    setLocationError(null);
    setIsLocating(false);
  }

  // --- FUNGSI CHAT ---
  const sendMessageToDriver = () => {
    if (chatMessage.trim()) {
      setDriverMessages(prev => [...prev, `Anda: ${chatMessage}`]);
      // Simulasi balasan driver
      setTimeout(() => {
        setDriverMessages(prev => [...prev, `Driver: Siap, pesanan sedang dalam perjalanan! 🏍️`]);
      }, 1000);
      setChatMessage('');
    }
  };

  const sendQuickMessageToDriver = (message: string) => {
    setDriverMessages(prev => [...prev, `Anda: ${message}`]);
    // Simulasi balasan driver berdasarkan pesan
    setTimeout(() => {
      let reply = 'Baik, terima kasih! 🏍️';
      if (message.includes('dimana')) reply = 'Saya sedang dalam perjalanan ke toko, estimasi 5 menit lagi! 📍';
      if (message.includes('lama')) reply = 'Estimasi sampai 15-20 menit ya! ⏰';
      if (message.includes('hati-hati')) reply = 'Siap, terima kasih! Saya akan hati-hati di jalan 🙏';
      if (message.includes('telepon')) reply = 'Oke, nanti saya telepon jika sudah sampai depan 📞';
      
      setDriverMessages(prev => [...prev, `Driver: ${reply}`]);
    }, 1000);
  };

  const sendMessageToStore = () => {
    if (chatMessage.trim()) {
      setStoreMessages(prev => [...prev, `Anda: ${chatMessage}`]);
      // Simulasi balasan toko
      setTimeout(() => {
        setStoreMessages(prev => [...prev, `Toko: Pesanan sedang diproses, terima kasih! 👨‍🍳`]);
      }, 1000);
      setChatMessage('');
    }
  };

  const sendQuickMessageToStore = (message: string) => {
    setStoreMessages(prev => [...prev, `Anda: ${message}`]);
    // Simulasi balasan toko berdasarkan pesan
    setTimeout(() => {
      let reply = 'Baik, siap! 👨‍🍳';
      if (message.includes('lama')) reply = 'Pesanan akan selesai dalam 10-15 menit ya! ⏰';
      if (message.includes('pedas')) reply = 'Sudah saya catat, pedas tingkat sedang ya! 🌶️';
      if (message.includes('tambahan')) reply = 'Boleh, ada tambahan apa nih? 📝';
      if (message.includes('ganti')) reply = 'Bisa kok, mau diganti jadi apa? 🔄';
      
      setStoreMessages(prev => [...prev, `Toko: ${reply}`]);
    }, 1000);
  };

  // Data pilihan chat cepat
  const driverQuickChats = [
    'Driver sudah dimana?',
    'Estimasi berapa lama lagi?',
    'Tolong hati-hati di jalan',
    'Telepon jika sudah sampai ya'
  ];

  const storeQuickChats = [
    'Pesanan berapa lama lagi?',
    'Bisa tambah level pedas?',
    'Ada tambahan menu?',
    'Bisa ganti minuman?'
  ];

  const handleCheckout = () => {
    // Validasi
    if (deliveryOption === 'delivery' && selectedAddressId === 'current' && !mapLocation) {
      toast.error('Lokasi belum terdeteksi. Coba lagi.', { icon: '📍' });
      return;
    }
    
    // Validasi Pembayaran
    if (paymentMethod === 'ewallet' && !selectedEwallet) {
      toast.error('Pilih e-wallet untuk pembayaran!', { icon: '💳' });
      return;
    }
    if ((paymentMethod === 'transfer' || paymentMethod === 'va') && !selectedBank) {
      toast.error('Pilih bank untuk pembayaran!', { icon: '🏦' });
      return;
    }
    
    // Simulasi Transaksi berdasarkan metode pembayaran
    let successMessage = 'Pesanan Berhasil Dibuat!';
    let icon = '🎉';
    
    if (paymentMethod === 'qris') {
      successMessage = 'Silakan scan QR Code untuk pembayaran!';
      icon = '📱';
    } else if (paymentMethod === 'ewallet') {
      const wallet = paymentMethods.ewallet.find(w => w.id === selectedEwallet);
      successMessage = `Pembayaran via ${wallet?.label} berhasil!`;
      icon = wallet?.logo || '💳';
    } else if (paymentMethod === 'transfer' || paymentMethod === 'va') {
      const bank = paymentMethods.banks.find(b => b.id === selectedBank);
      successMessage = `Pembayaran via ${bank?.label} sedang diproses!`;
      icon = '🏦';
    } else if (paymentMethod === 'cash') {
      successMessage = 'Pesanan diterima! Bayar tunai saat tiba.';
      icon = '💰';
    }
    
    toast.success(successMessage, { icon, duration: 3000 });
    clearCart();

    // --- UBAH INI ---
    // Arahkan ke Halaman Status setelah 1 detik
    setTimeout(() => {
      // Kita kirim data lokasi resto & rumah via query params
      // (Ini cara "curang" tapi cepat untuk simulasi)
      const restoCoords = "-7.271512,112.744211"; // Ambil dari UMKM (kita hardcode dulu)
      const userCoords = `${mapLocation.lat},${mapLocation.long}`;

      router.push(`/status/LOKAL-123?resto=${restoCoords}&user=${userCoords}`);
    }, 1000);
    // --- AKHIR PERUBAHAN ---
  };

  // Tampilan jika keranjang kosong
  if (cartItems.length === 0) {
     return (
        <div className="container mx-auto p-4 text-center">
          <h1 className="text-2xl font-bold">Keranjangmu Kosong</h1>
          <p className="text-muted-foreground">Yuk, cari makanan enak!</p>
          <Button asChild className="mt-4"><Link href="/">Kembali ke Beranda</Link></Button>
        </div>
      )
  }

  // Tampilan loading saat cek authentication
  if (status === 'loading') {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Jika belum login, tampilan redirect (loading)
  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <h1 className="text-2xl font-bold">Redirecting...</h1>
          <p className="text-muted-foreground">Silakan daftar atau masuk terlebih dahulu</p>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Ringkasan Pesanan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* --- Opsi Pengiriman --- */}
          <h3 className="font-semibold">Opsi Pengiriman</h3>
          <RadioGroup 
            value={deliveryOption} 
            onValueChange={setDeliveryOption} 
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <RadioGroupItem value="pickup" id="pickup" className="peer sr-only" />
              <Label 
                htmlFor="pickup" 
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <Package className="mb-3 h-6 w-6" /> 
                Ambil Sendiri
              </Label>
            </div>
            <div>
              <RadioGroupItem value="delivery" id="delivery" className="peer sr-only" />
              <Label 
                htmlFor="delivery" 
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <Bike className="mb-3 h-6 w-6" /> 
                Dianterin
              </Label>
            </div>
          </RadioGroup>

          {/* --- KOTAK ALAMAT (SISTEM BARU "AUTO") --- */}
          {deliveryOption === 'delivery' && (
            <div className="space-y-4">
              <Separator />
              <h3 className="font-semibold">Detail Pengantaran</h3>

              {/* Pilihan Alamat - Tanpa Radio Button */}
              <div className="space-y-3">
                {/* Alamat Tersimpan */}
                {savedAddresses.map((addr) => {
                  const Icon = addr.icon;
                  return (
                    <div 
                      key={addr.id} 
                      onClick={() => handleSelectSavedAddress(addr.id)}
                      className={`flex items-center gap-4 rounded-md border-2 p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground ${
                        selectedAddressId === addr.id ? 'border-primary bg-primary/5' : 'border-muted'
                      }`}
                    >
                      <Icon className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{addr.label}</p>
                        <p className="text-muted-foreground text-sm">{addr.address}</p>
                      </div>
                    </div>
                  );
                })}

                {/* Tombol "Lokasi Saat Ini" (Auto-Detect) */}
                <div
                  onClick={handleDetectLocation}
                  className={`flex flex-col gap-2 rounded-md border-2 p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground ${
                    selectedAddressId === 'current' ? 'border-primary bg-primary/5' : 'border-muted'
                  }`}
                >
                  <div className="flex items-center w-full">
                    <LocateFixed className="h-6 w-6 text-muted-foreground mr-3" />
                    <p className="font-semibold">Lokasi Saat Ini (Auto-Detect)</p>
                    {isLocating && <Loader2 className="h-5 w-5 animate-spin ml-auto" />}
                  </div>
                  
                  {/* Tampilkan hasil deteksi di sini */}
                  {selectedAddressId === 'current' && !isLocating && (
                    <div className="pl-9 text-sm">
                      {locationError && (
                        <p className="text-red-600 font-semibold">{locationError}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* --- PETA MINI LIVE (MENGGANTIKAN KOTAK ABU-ABU) --- */}
              <div className="w-full h-48 bg-secondary rounded-md overflow-hidden">
                <CheckoutMap location={mapLocation} />
              </div>

              {/* Estimasi */}
              <div className="flex gap-4">
                <div className="w-full bg-secondary rounded-md flex items-center justify-center p-4">
                  <Clock className="h-6 w-6 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm ml-2">Estimasi Tiba:</p>
                  <p className="font-bold text-lg ml-1">{FAKE_ESTIMASI}</p>
                </div>
              </div>

              {/* --- CHAT & STATUS DELIVERY --- */}
              {deliveryOption === 'delivery' && (
                <div className="space-y-4 bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-800 dark:text-green-200">📦 Status Pengiriman</h4>
                  
                  {/* Driver Profile */}
                  <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                        R
                      </div>
                      <div>
                        <p className="font-semibold">Rudi Susanto</p>
                        <p className="text-sm text-muted-foreground">⭐ 4.8 • Honda Beat Putih</p>
                        <p className="text-xs text-green-600 font-medium">🟢 Sedang menuju toko</p>
                      </div>
                    </div>
                    
                    {/* Chat dengan Driver */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Chat Driver Rudi
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Chat dengan Driver Rudi 🏍️</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {/* Pilihan Chat Cepat */}
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Chat Cepat:</p>
                            <div className="grid grid-cols-1 gap-2">
                              {driverQuickChats.map((quickMsg, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="text-left justify-start h-auto p-2 text-xs"
                                  onClick={() => sendQuickMessageToDriver(quickMsg)}
                                >
                                  {quickMsg}
                                </Button>
                              ))}
                            </div>
                          </div>
                          
                          <Separator />
                          
                          {/* Chat Messages */}
                          <div className="h-48 bg-secondary/20 rounded-lg p-3 overflow-y-auto">
                            {driverMessages.length === 0 ? (
                              <p className="text-muted-foreground text-sm text-center">
                                Pilih chat cepat atau tulis pesan sendiri!
                              </p>
                            ) : (
                              driverMessages.map((msg, index) => (
                                <div key={index} className={`mb-2 p-2 rounded-lg text-sm ${
                                  msg.startsWith('Anda:') 
                                    ? 'bg-primary text-primary-foreground ml-8' 
                                    : 'bg-secondary mr-8'
                                }`}>
                                  {msg}
                                </div>
                              ))
                            )}
                          </div>
                          
                          {/* Input Chat */}
                          <div className="flex gap-2">
                            <Textarea
                              placeholder="Tulis pesan untuk driver..."
                              value={chatMessage}
                              onChange={(e) => setChatMessage(e.target.value)}
                              rows={2}
                              className="flex-1"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  sendMessageToDriver();
                                }
                              }}
                            />
                            <Button onClick={sendMessageToDriver} size="sm">
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Toko Profile */}
                  <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        W
                      </div>
                      <div>
                        <p className="font-semibold">Warung Sari Rasa</p>
                        <p className="text-sm text-muted-foreground">⭐ 4.6 • Masakan Rumahan</p>
                        <p className="text-xs text-orange-600 font-medium">👨‍🍳 Sedang memasak pesanan</p>
                      </div>
                    </div>
                    
                    {/* Chat dengan Toko */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Chat Warung Sari Rasa
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Chat dengan Warung Sari Rasa 🏪</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {/* Pilihan Chat Cepat */}
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Chat Cepat:</p>
                            <div className="grid grid-cols-1 gap-2">
                              {storeQuickChats.map((quickMsg, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="text-left justify-start h-auto p-2 text-xs"
                                  onClick={() => sendQuickMessageToStore(quickMsg)}
                                >
                                  {quickMsg}
                                </Button>
                              ))}
                            </div>
                          </div>
                          
                          <Separator />
                          
                          {/* Chat Messages */}
                          <div className="h-48 bg-secondary/20 rounded-lg p-3 overflow-y-auto">
                            {storeMessages.length === 0 ? (
                              <p className="text-muted-foreground text-sm text-center">
                                Pilih chat cepat atau tulis pesan sendiri!
                              </p>
                            ) : (
                              storeMessages.map((msg, index) => (
                                <div key={index} className={`mb-2 p-2 rounded-lg text-sm ${
                                  msg.startsWith('Anda:') 
                                    ? 'bg-primary text-primary-foreground ml-8' 
                                    : 'bg-secondary mr-8'
                                }`}>
                                  {msg}
                                </div>
                              ))
                            )}
                          </div>
                          
                          {/* Input Chat */}
                          <div className="flex gap-2">
                            <Textarea
                              placeholder="Tulis pesan untuk toko..."
                              value={chatMessage}
                              onChange={(e) => setChatMessage(e.target.value)}
                              rows={2}
                              className="flex-1"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  sendMessageToStore();
                                }
                              }}
                            />
                            <Button onClick={sendMessageToStore} size="sm">
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )}
            </div>
          )}

          <Separator />
          
          {/* --- Daftar Item --- */}
          <h3 className="font-semibold">Item Dipesan</h3>
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                <Image
                  src={item.photo || '/images/placeholder.jpg'}
                  alt={item.name}
                  width={64}
                  height={64}
                  className="rounded-md object-cover w-16 h-16 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm md:text-base truncate">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatRupiah(item.price || 0)}
                  </p>
                </div>
                
                {/* Controls Quantity & Remove */}
                <div className="flex flex-col items-end gap-2">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        if (item.quantity > 1) {
                          updateQuantity(item.id, item.quantity - 1);
                        }
                      }}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="font-semibold min-w-[2rem] text-center text-sm">
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Total Price & Remove */}
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">
                      {formatRupiah((item.price || 0) * item.quantity)}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Separator />
          
          {/* --- METODE PEMBAYARAN --- */}
          <div className="space-y-4">
            <h3 className="font-semibold">Metode Pembayaran</h3>
            
            {/* Grid Pilihan Metode Pembayaran */}
            <div className="grid grid-cols-1 gap-3">
              
              {/* Bayar Tunai */}
              <div 
                onClick={() => {
                  setPaymentMethod('cash');
                  setSelectedEwallet('');
                  setSelectedBank('');
                }}
                className={`flex items-center gap-4 rounded-md border-2 p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground ${
                  paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-muted'
                }`}
              >
                <Banknote className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Bayar Tunai</p>
                  <p className="text-muted-foreground text-sm">Bayar langsung saat pesanan tiba</p>
                </div>
              </div>

              {/* QRIS */}
              <div 
                onClick={() => {
                  setPaymentMethod('qris');
                  setSelectedEwallet('');
                  setSelectedBank('');
                }}
                className={`flex items-center gap-4 rounded-md border-2 p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground ${
                  paymentMethod === 'qris' ? 'border-primary bg-primary/5' : 'border-muted'
                }`}
              >
                <QrCode className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="font-semibold">QRIS</p>
                  <p className="text-muted-foreground text-sm">Scan QR untuk pembayaran instan</p>
                </div>
              </div>

              {/* E-Wallet dengan Dropdown Terintegrasi */}
              <div className={`rounded-md border-2 p-4 ${
                paymentMethod === 'ewallet' ? 'border-primary bg-primary/5' : 'border-muted'
              }`}>
                <div className="flex items-center gap-4 mb-3">
                  <Wallet className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">E-Wallet</p>
                    <p className="text-muted-foreground text-sm">GoPay, DANA, OVO, LinkAja</p>
                  </div>
                </div>
                <Select 
                  value={selectedEwallet} 
                  onValueChange={(value) => {
                    setSelectedEwallet(value);
                    setPaymentMethod('ewallet');
                    setSelectedBank('');
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih E-Wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.ewallet.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        <div className="flex items-center gap-2">
                          <span>{wallet.logo}</span>
                          <span>{wallet.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Transfer Bank dengan Dropdown Terintegrasi */}
              <div className={`rounded-md border-2 p-4 ${
                paymentMethod === 'transfer' ? 'border-primary bg-primary/5' : 'border-muted'
              }`}>
                <div className="flex items-center gap-4 mb-3">
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">Transfer Bank</p>
                    <p className="text-muted-foreground text-sm">Transfer ke rekening bank</p>
                  </div>
                </div>
                <Select 
                  value={paymentMethod === 'transfer' ? selectedBank : ''} 
                  onValueChange={(value) => {
                    setSelectedBank(value);
                    setPaymentMethod('transfer');
                    setSelectedEwallet('');
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.banks.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id}>
                        <div className="flex items-center gap-2">
                          <span>{bank.logo}</span>
                          <span>{bank.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Virtual Account dengan Dropdown Terintegrasi */}
              <div className={`rounded-md border-2 p-4 ${
                paymentMethod === 'va' ? 'border-primary bg-primary/5' : 'border-muted'
              }`}>
                <div className="flex items-center gap-4 mb-3">
                  <Building className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">Virtual Account</p>
                    <p className="text-muted-foreground text-sm">Bayar via Virtual Account bank</p>
                  </div>
                </div>
                <Select 
                  value={paymentMethod === 'va' ? selectedBank : ''} 
                  onValueChange={(value) => {
                    setSelectedBank(value);
                    setPaymentMethod('va');
                    setSelectedEwallet('');
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Bank untuk VA" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.banks.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id}>
                        <div className="flex items-center gap-2">
                          <span>{bank.logo}</span>
                          <span>VA {bank.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
            </div>
          </div>

          <Separator />
          
          {/* --- Rincian Total --- */}
          <div className="space-y-2">
            <h3 className="font-semibold">Rincian Pembayaran</h3>
            <div className="flex justify-between">
              <p className="text-muted-foreground">Subtotal Makanan</p>
              <p>{formatRupiah(totalPrice)}</p>
            </div>
            
            {deliveryOption === 'delivery' && (
              <div className="flex justify-between">
                <p className="text-muted-foreground">Ongkos Kirim</p>
                <p>{formatRupiah(DELIVERY_FEE)}</p>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <p className="text-lg font-bold">Total</p>
              <p className="text-lg font-bold">
                {formatRupiah(finalTotal)}
              </p>
            </div>
          </div>
          
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          {/* Main Checkout Button */}
          <Button className="w-full" size="lg" onClick={handleCheckout}>
            Bayar {formatRupiah(finalTotal)} (Simulasi)
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}