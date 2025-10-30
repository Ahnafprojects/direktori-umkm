// File: src/app/dashboard/umkm/edit/[slug]/page.tsx

import { getCategories, getUmkmForEdit } from "@/lib/actions";
import UmkmRegistrationForm from "@/app/_components/umkm-registration-form";
import { notFound } from "next/navigation";

type EditUmkmPageProps = {
    params: {
        slug: string;
    };
};

export default async function EditUmkmPage({ params }: EditUmkmPageProps) {
    const { slug } = params;

    // Ambil data UMKM dan data kategori secara bersamaan
    const [umkmData, categories] = await Promise.all([
        getUmkmForEdit(slug),
        getCategories()
    ]);

    // Jika UMKM tidak ditemukan atau bukan milik user, tampilkan halaman 404
    if (!umkmData) {
        notFound();
    }

    // ================================================================
    // === PERBAIKAN: Ubah tipe `id` dari number ke string sebelum     ===
    // === dikirim ke komponen form untuk mencocokkan tipe prop       ===
    // ================================================================
    const formattedInitialData = {
        ...umkmData,
        id: String(umkmData.id), // Konversi di sini
    };

    return (
        <div className="container mx-auto py-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Edit UMKM</h1>
                <p className="text-muted-foreground mb-6">
                    Perbarui detail bisnis Anda di bawah ini.
                </p>
                {/* Kirim data UMKM yang sudah diformat ke formulir */}
                <UmkmRegistrationForm categories={categories} initialData={formattedInitialData} />
            </div>
        </div>
    );
}