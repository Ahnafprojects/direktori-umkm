// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: "396972229362362",
  api_secret: "vKVMsS7sUd83oHCKgdA-iKaFnww",
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Tidak ada file yang diupload." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "auto",
            folder: "direktori-umkm", // Organize uploads in a folder
            transformation: [
              { width: 800, height: 600, crop: "limit" }, // Resize large images
              { quality: "auto" }, // Optimize quality
              { format: "auto" }, // Auto format (webp, etc.)
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    // Return the secure URL (format yang sama dengan API lama)
    return NextResponse.json({
      url: (result as any).secure_url,
      public_id: (result as any).public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Gagal mengupload file.", details: error },
      { status: 500 }
    );
  }
}
