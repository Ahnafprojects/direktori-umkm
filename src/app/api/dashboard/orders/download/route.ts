// API endpoint untuk download history pesanan dalam format CSV
import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Hanya pengusaha yang bisa download
    if (session.user.role !== 'PENGUSAHA') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Cari UMKM milik user
    const umkm = await db.umkm.findFirst({
      where: { ownerId: session.user.id }
    });

    if (!umkm) {
      return NextResponse.json({ error: 'UMKM not found' }, { status: 404 });
    }

    // Parse filter parameter
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30days';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let dateFilter: { gte?: Date; lte?: Date } = {};
    
    if (startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else {
      switch (period) {
        case 'today':
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          dateFilter = { gte: today };
          break;
        case '7days':
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          dateFilter = { gte: sevenDaysAgo };
          break;
        case '30days':
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          dateFilter = { gte: thirtyDaysAgo };
          break;
        case 'thisMonth':
          const thisMonth = new Date();
          thisMonth.setMonth(thisMonth.getMonth(), 1);
          thisMonth.setHours(0, 0, 0, 0);
          dateFilter = { gte: thisMonth };
          break;
        case 'thisYear':
          const thisYear = new Date();
          thisYear.setMonth(0, 1);
          thisYear.setHours(0, 0, 0, 0);
          dateFilter = { gte: thisYear };
          break;
        default:
          const defaultThirtyDays = new Date();
          defaultThirtyDays.setDate(defaultThirtyDays.getDate() - 30);
          dateFilter = { gte: defaultThirtyDays };
      }
    }

    // Ambil semua pesanan dengan detail items
    const orders = await db.order.findMany({
      where: {
        umkmId: umkm.id,
        createdAt: dateFilter,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                costPrice: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Generate CSV content
    const csvHeaders = [
      'No',
      'Tanggal Pesanan',
      'ID Pesanan',
      'Nama Pelanggan',
      'Email Pelanggan', 
      'Status Pesanan',
      'Nama Produk',
      'Quantity',
      'Harga Satuan (Rp)',
      'Harga Modal (Rp)',
      'Subtotal (Rp)',
      'Profit per Item (Rp)',
      'Total Pesanan (Rp)',
      'Alamat Pengiriman',
      'Catatan'
    ];

    let csvContent = csvHeaders.join(',') + '\n';
    let rowNumber = 1;

    orders.forEach((order: any) => {
      if (order.items && order.items.length > 0) {
        order.items.forEach((item: any) => {
          const costPrice = item.product?.costPrice || 0;
          const sellingPrice = item.pricePerItem || 0;
          const profitPerItem = (sellingPrice - costPrice) * item.quantity;
          
          const row = [
            rowNumber,
            new Date(order.createdAt).toLocaleDateString('id-ID'),
            order.id,
            order.user?.name || 'Guest',
            order.user?.email || '-',
            order.status,
            item.productName || item.product?.name || 'Unknown Product',
            item.quantity,
            sellingPrice,
            costPrice,
            item.quantity * sellingPrice,
            profitPerItem,
            order.totalAmount,
            order.deliveryAddress || '-',
            order.notes || '-'
          ];
          
          // Escape commas in text fields
          const escapedRow = row.map(field => {
            if (typeof field === 'string' && field.includes(',')) {
              return `"${field.replace(/"/g, '""')}"`;
            }
            return field;
          });
          
          csvContent += escapedRow.join(',') + '\n';
          rowNumber++;
        });
      } else {
        // Order tanpa items
        const row = [
          rowNumber,
          new Date(order.createdAt).toLocaleDateString('id-ID'),
          order.id,
          order.user?.name || 'Guest',
          order.user?.email || '-',
          order.status,
          'No Items',
          0,
          0,
          0,
          0,
          0,
          order.totalAmount,
          order.deliveryAddress || '-',
          order.notes || '-'
        ];
        
        csvContent += row.join(',') + '\n';
        rowNumber++;
      }
    });

    // Generate filename
    const periodText = period === 'custom' && startDate && endDate 
      ? `${startDate}_to_${endDate}`
      : period;
    const filename = `history-pesanan-${umkm.name.replace(/[^a-zA-Z0-9]/g, '-')}-${periodText}-${new Date().toISOString().split('T')[0]}.csv`;

    // Return CSV response
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Download orders error:', error);
    return NextResponse.json(
      { error: 'Failed to download order history' },
      { status: 500 }
    );
  }
}
