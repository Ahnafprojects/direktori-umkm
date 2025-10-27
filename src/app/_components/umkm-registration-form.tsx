// File: src/app/_components/umkm-registration-form.tsx
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Category } from "@prisma/client";
import { PlusCircle, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
// 1. IMPORT KOMPONEN PICKER LOKASI YANG BARU
import LocationPicker from "./location-picker";

interface UmkmRegistrationFormProps {
    categories: Category[];
}

type ProductInput = {
    name: string;
    description: string;
    price: string;
};

// Tipe data untuk posisi peta
type Position = { lat: number; lng: number };

export default function UmkmRegistrationForm({ categories }: UmkmRegistrationFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [products, setProducts] = useState<ProductInput[]>([{ name: '', description: '', price: '' }]);
    
    // 2. BUAT STATE UNTUK MENYIMPAN LOKASI YANG DIPILIH DARI PETA
    const [location, setLocation] = useState<Position | null>(null);

    // ... (fungsi-fungsi untuk produk tidak berubah)
    const handleProductChange = (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const values = [...products];
        values[index][event.target.name as keyof ProductInput] = event.target.value;
        setProducts(values);
    };
    const handleAddProduct = () => {
        setProducts([...products, { name: '', description: '', price: '' }]);
    };
    const handleRemoveProduct = (index: number) => {
        const values = [...products];
        values.splice(index, 1);
        setProducts(values);
    };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        
        const formData = new FormData(event.currentTarget);
        const basicData = Object.fromEntries(formData.entries());

        // Gabungkan data form dengan data dari state (lokasi & produk)
        const finalData = {
            ...basicData,
            // 3. TAMBAHKAN LATITUDE & LONGITUDE DARI STATE LOKASI
            latitude: location?.lat,
            longitude: location?.lng,
            products: products.filter(p => p.name && p.price)
        };

        try {
            const response = await fetch('/api/umkm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalData),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal mendaftarkan UMKM.');
            }
            
            alert('UMKM berhasil didaftarkan!');
            router.push('/dashboard/umkm/saya');
            router.refresh();
            
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
             {error && (
                <div className="bg-destructive/15 p-3 rounded-md text-sm text-destructive">
                    <p>{error}</p>
                </div>
            )}
            
            {/* --- Info Dasar UMKM (tidak berubah) --- */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Informasi Dasar</h3>
                {/* ... (semua input dasar Anda tetap sama) ... */}
                 <div className="space-y-2">
                    <Label htmlFor="name">Nama UMKM</Label>
                    <Input id="name" name="name" placeholder="Contoh: Bakso Cak Man" required disabled={isLoading} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi Singkat</Label>
                    <Textarea id="description" name="description" placeholder="Jelaskan secara singkat tentang bisnis Anda..." required disabled={isLoading} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">Alamat Lengkap</Label>
                    <Input id="address" name="address" placeholder="Jl. Raya ITS, Keputih, Sukolilo, Surabaya" required disabled={isLoading} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Nomor Telepon (Opsional)</Label>
                        <Input id="phone" name="phone" type="tel" placeholder="08123456789" disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="openingHours">Jam Buka (Opsional)</Label>
                        <Input id="openingHours" name="openingHours" placeholder="Contoh: 10:00 - 21:00" disabled={isLoading} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="categoryId">Kategori Bisnis</Label>
                    <Select name="categoryId" required disabled={isLoading}>
                        <SelectTrigger><SelectValue placeholder="Pilih kategori bisnis" /></SelectTrigger>
                        <SelectContent>
                            {categories.map(category => (
                                <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Separator />
            
            {/* --- 4. GANTI BAGIAN PETA DENGAN KOMPONEN BARU --- */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Pilih Lokasi di Peta</h3>
                <p className="text-sm text-muted-foreground">
                    Klik pada peta untuk menempatkan penanda lokasi persis bisnis Anda.
                </p>
                <LocationPicker position={location} onLocationChange={setLocation} />
                {/* Menampilkan koordinat yang dipilih untuk feedback pengguna */}
                {location && (
                    <div className="text-sm text-muted-foreground mt-2">
                        Koordinat Terpilih: Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                    </div>
                )}
            </div>

            <Separator />

            {/* --- Bagian Input Menu Dinamis (tidak berubah) --- */}
            <div className="space-y-4">
                {/* ... (semua input menu Anda tetap sama) ... */}
                <h3 className="text-lg font-medium">Menu / Daftar Produk</h3>
                {products.map((product, index) => (
                    <div key={index} className="p-4 border rounded-md space-y-4 relative">
                        <Label className="font-semibold">Produk #{index + 1}</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor={`product-name-${index}`}>Nama Produk</Label>
                                <Input id={`product-name-${index}`} name="name" value={product.name} onChange={e => handleProductChange(index, e)} placeholder="Bakso Jumbo" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`product-price-${index}`}>Harga</Label>
                                <Input id={`product-price-${index}`} name="price" type="number" value={product.price} onChange={e => handleProductChange(index, e)} placeholder="25000" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`product-description-${index}`}>Deskripsi Produk (Opsional)</Label>
                            <Textarea id={`product-description-${index}`} name="description" value={product.description} onChange={e => handleProductChange(index, e)} placeholder="Bakso super besar..." />
                        </div>
                        {products.length > 1 && (
                             <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => handleRemoveProduct(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={handleAddProduct}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tambah Produk Lain
                </Button>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Mendaftarkan...' : 'Daftarkan UMKM Saya'}
            </Button>
        </form>
    );
}