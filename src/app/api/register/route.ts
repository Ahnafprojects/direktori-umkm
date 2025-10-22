// File: src/app/api/register/route.ts

import { NextResponse } from 'next/server';
// import { Role } from '@prisma/client'; // <-- 1. HAPUS BARIS IMPORT INI
import bcrypt from 'bcrypt';
import { db } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: 'Semua field wajib diisi' }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Email sudah terdaftar' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // <-- 2. PERBAIKI LOGIKA ROLE DI SINI
        // Langsung gunakan string dari body, karena Prisma cukup pintar
        // untuk mencocokkannya dengan enum di database.
        role: role === 'PENGUSAHA' ? 'PENGUSAHA' : 'PELANGGAN',
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('REGISTRATION_ERROR:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}