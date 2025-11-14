import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { db } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    // Check if user is already PENGUSAHA
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role === 'PENGUSAHA') {
      return NextResponse.json(
        { error: 'User is already a business owner' },
        { status: 400 }
      );
    }

    // Update user role to PENGUSAHA
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: { role: 'PENGUSAHA' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    console.log(`[UPGRADE] User ${session.user.id} upgraded to PENGUSAHA`);

    return NextResponse.json({
      success: true,
      message: 'Account successfully upgraded to business owner',
      user: updatedUser
    });

  } catch (error) {
    console.error('[UPGRADE] Error upgrading user account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}