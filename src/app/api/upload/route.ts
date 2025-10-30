// File: src/app/api/upload/route.ts

import { NextResponse, NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function POST(request: NextRequest): Promise<NextResponse> {
    // 1. Dapatkan FormData dari request
    const formData = await request.formData();
    const file = formData.get('file') as File | null; // 'file' adalah nama field dari form

    if (!file) {
        return NextResponse.json({ error: 'Tidak ada file yang diupload.' }, { status: 400 });
    }

    // 2. Siapkan path untuk menyimpan file
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    // Pastikan direktori 'uploads' sudah ada
    try {
        await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
        console.error("Gagal membuat direktori upload:", error);
        return NextResponse.json({ error: 'Gagal menyiapkan penyimpanan file.' }, { status: 500 });
    }

    try {
        // 3. Buat nama file yang unik dan path lengkapnya
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const fileExtension = path.extname(file.name || '.jpg');
        const newFilename = `${uniqueSuffix}${fileExtension}`;
        const newPath = path.join(uploadDir, newFilename);

        // 4. Baca file sebagai buffer dan tulis ke disk
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(newPath, buffer);

        // 5. Kembalikan URL publik yang bisa diakses
        const publicUrl = `/uploads/${newFilename}`;
        return NextResponse.json({ url: publicUrl }, { status: 200 });

    } catch (error) {
        console.error("Error saat mengupload file:", error);
        return NextResponse.json({ error: 'Gagal mengupload file.' }, { status: 500 });
    }
}