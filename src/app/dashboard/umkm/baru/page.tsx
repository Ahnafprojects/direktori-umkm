import { db } from "@/lib/prisma";
import UmkmForm from "@/app/_components/umkm-registration-form";

export default async function DaftarUmkmPage() {
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