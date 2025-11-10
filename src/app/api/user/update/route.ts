// File: src/app/api/user/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/authOptions";
import { db } from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  try {
    console.log('[UPDATE USER] Starting user update...');
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.log('[UPDATE USER] No session found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[UPDATE USER] User ID:', session.user.id);
    
    const body = await request.json();
    const { name } = body;

    console.log('[UPDATE USER] New name:', name);

    if (!name || typeof name !== 'string') {
      console.log('[UPDATE USER] Invalid name');
      return NextResponse.json(
        { error: 'Nama tidak valid' },
        { status: 400 }
      );
    }

    // Update user name
    // @ts-ignore
    const updatedUser = await db.user.update({
      where: {
        // @ts-ignore
        id: session.user.id,
      },
      data: {
        name: name.trim(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    console.log('[UPDATE USER] Successfully updated:', updatedUser);

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('[UPDATE USER] Error updating user:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate profil' },
      { status: 500 }
    );
  }
}
