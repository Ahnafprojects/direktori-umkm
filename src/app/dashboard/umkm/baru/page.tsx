import { db } from "@/lib/prisma";
// PERUBAHAN 1: Impor komponen dengan nama baru 'UmkmForm' dari file baru
import UmkmForm from "@/app/_components/umkm-registration-form";

export default async function DaftarUmkmPage() {
    // Ambil semua kategori dari database untuk ditampilkan di form
    const categories = await db.category.findMany();

    return (
        <div className="container mx-auto py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Daftarkan UMKM Baru</h1>
                <p className="text-muted-foreground mb-6">Isi detail di bawah ini untuk menampilkan bisnis Anda di direktori.</p>
            
                <UmkmForm categories={categories} />
            </div>
        </div>
    );
}