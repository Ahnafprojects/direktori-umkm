// Debug script untuk cek data order dan ownership

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function debugOrderOwnership() {
  try {
    console.log("=== DEBUG ORDER OWNERSHIP ===");

    // 1. Cek semua users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });
    
    console.log("\n1. USERS:");
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role} - ID: ${user.id}`);
    });

    // 2. Cek semua UMKM
    const umkms = await prisma.umkm.findMany({
      select: {
        id: true,
        name: true,
        ownerId: true,
      }
    });
    
    console.log("\n2. UMKM:");
    umkms.forEach(umkm => {
      console.log(`   - ${umkm.name} (ID: ${umkm.id}) - Owner: ${umkm.ownerId}`);
    });

    // 3. Cek semua orders dengan detail
    const orders = await prisma.order.findMany({
      include: {
        umkm: {
          select: {
            name: true,
            ownerId: true,
          }
        },
        user: {
          select: {
            name: true,
            id: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
    
    console.log("\n3. ORDERS (Last 10):");
    orders.forEach(order => {
      console.log(`   - Order #${order.id} - Status: ${order.status}`);
      console.log(`     UMKM: ${order.umkm.name} (Owner: ${order.umkm.ownerId})`);
      console.log(`     Customer: ${order.user.name} (ID: ${order.user.id})`);
      console.log(`     Total: ${order.totalAmount}`);
      console.log("");
    });

    // 4. Cek hubungan spesifik untuk user yang login
    const pengusahaUsers = users.filter(u => u.role === 'PENGUSAHA');
    console.log("\n4. PENGUSAHA USERS & THEIR UMKM:");
    
    for (const pengusaha of pengusahaUsers) {
      const userUmkm = await prisma.umkm.findMany({
        where: { ownerId: pengusaha.id }
      });
      
      console.log(`   - ${pengusaha.name} (${pengusaha.id}) owns ${userUmkm.length} UMKM:`);
      userUmkm.forEach(umkm => {
        console.log(`     * ${umkm.name} (ID: ${umkm.id})`);
      });
      
      // Cek orders ke UMKM ini
      const ordersToThisUser = await prisma.order.findMany({
        where: {
          umkm: {
            ownerId: pengusaha.id
          }
        },
        include: {
          umkm: { select: { name: true } },
          user: { select: { name: true } }
        }
      });
      
      console.log(`     Orders to this user's UMKM: ${ordersToThisUser.length}`);
      ordersToThisUser.forEach(order => {
        console.log(`       - Order #${order.id} - ${order.status} - from ${order.user.name}`);
      });
      console.log("");
    }

  } catch (error) {
    console.error("❌ Debug FAILED:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugOrderOwnership();