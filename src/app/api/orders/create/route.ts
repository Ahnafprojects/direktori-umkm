// src/app/api/orders/create/route.ts
import { db } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
  try {
    // --- 1. DAPATKAN USER YANG LOGIN ---
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized - Silakan login terlebih dahulu' }, { status: 401 });
    }
    
    // @ts-ignore
    const userId = session.user.id; // ID dari session
    
    console.log('Creating order for user:', userId);

    // 2. Ambil data dari body request (dari halaman checkout)
    const { cartItems, finalTotal, deliveryOption, address, umkmId, paymentMethod, selectedEwallet, selectedBank } = await req.json();

    console.log('Order creation attempt:', {
      userId,
      umkmId,
      cartItems: cartItems?.length,
      finalTotal,
      deliveryOption,
      paymentMethod
    });

    if (!cartItems || cartItems.length === 0 || !umkmId) {
      console.error('Validation failed:', { cartItems: !!cartItems, cartItemsLength: cartItems?.length, umkmId });
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // 3. Generate Kode Order Unik (lebih pendek)
    const timestamp = Date.now().toString().slice(-6); // 6 digit terakhir
    const userIdShort = userId.slice(-6); // 6 karakter terakhir dari user ID
    const orderCode = `LOKAL-${timestamp}-${userIdShort}`;

    // 4. Buat Order & OrderItem di Database (TRANSAKSI)
    // @ts-ignore
    const newOrder = await db.order.create({
      data: {
        orderCode: orderCode,
        totalAmount: finalTotal,
        deliveryOption: deliveryOption,
        deliveryAddress: deliveryOption === 'delivery' ? address : null,
        paymentMethod: paymentMethod,
        paymentDetails: selectedEwallet || selectedBank || null,
        // Ambil nama/telepon dari data user jika ada
        // customerName: user.name, 
        // customerPhone: user.phone,
        userId: userId, // ID User yang login
        umkmId: umkmId, // ID UMKM dari mana keranjang dibuat
        status: 'PAID', // Langsung PAID karena kita tidak pakai payment gateway

        // Buat Order Items secara bersamaan
        items: {
          create: cartItems.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            pricePerItem: item.price || 0,
            productName: item.name,
          })),
        },
      },
      include: {
        items: true, // Sertakan item dalam response
      },
    });

    // 5. (OPSIONAL) Kirim notifikasi ke UMKM via WebSocket di sini

    return NextResponse.json(newOrder, { status: 201 });

  } catch (error) {
    console.error("Error creating order:", error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json({ 
      error: 'Gagal membuat pesanan', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}