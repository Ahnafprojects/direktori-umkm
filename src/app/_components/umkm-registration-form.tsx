// File: src/app/_components/umkm-registration-form.tsx
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Asumsi Anda punya komponen ini
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Asumsi Anda punya komponen ini
import { Category } from "@prisma/client";


interface UmkmRegistrationFormProps {
    categories: Category[];
}

export default function UmkmRegistrationForm({ categories }: UmkmRegistrationFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        
        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/umkm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal mendaftarkan UMKM.');
            }

            // Jika berhasil, arahkan ke halaman "Produk Saya"
            router.push('/dashboard/umkm/saya');
            router.refresh(); // Memastikan data baru dimuat
            
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
             {error && (
                <div className="bg-destructive/15 p-3 rounded-md text-sm text-destructive">
                    <p>{error}</p>
                </div>
            )}
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
                <Label htmlFor="categoryId">Kategori</Label>
                <Select name="categoryId" required disabled={isLoading}>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori bisnis" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map(category => (
                            <SelectItem key={category.id} value={String(category.id)}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Mendaftarkan...' : 'Daftarkan UMKM Saya'}
            </Button>
        </form>
    );
}