// File: src/app/dashboard/umkm/edit/[slug]/page.tsx

import { getCategories, getUmkmForEdit } from "@/lib/actions";
import UmkmRegistrationForm from "@/app/_components/umkm-registration-form";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type EditUmkmPageProps = {
    params: {
        slug: string;
    };
};

export default async function EditUmkmPage({ params }: EditUmkmPageProps) {
    const { slug } = params;

    const [umkmData, categories] = await Promise.all([
        getUmkmForEdit(slug),
        getCategories()
    ]);

    if (!umkmData) {
        notFound();
    }
    const formattedInitialData = {
        ...umkmData,
        id: String(umkmData.id), 
    };

    return (
        <div className="container mx-auto py-8">
            <div className="max-w-2xl mx-auto">

                <div className="flex items-center gap-4 mb-6">
                    <Link href="/dashboard/umkm/saya" aria-label="Kembali ke UMKM Saya">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Edit UMKM</h1>
                        <p className="text-muted-foreground">
                            Perbarui detail bisnis Anda di bawah ini.
                        </p>
                    </div>
                </div>

                <UmkmRegistrationForm 
                    categories={categories} 
                    initialData={formattedInitialData} 
                />
            </div>
        </div>
    );
}