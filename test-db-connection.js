// Test database connection
const { PrismaClient } = require('@prisma/client');
const { withAccelerate } = require('@prisma/extension-accelerate');

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    
    const prisma = new PrismaClient();
    const client = prisma.$extends(withAccelerate());
    
    // Test query
    const umkmCount = await client.umkm.count();
    console.log(`✅ Connection successful! Found ${umkmCount} UMKM records`);
    
    // Get sample data
    const sampleUmkms = await client.umkm.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        slug: true,
        latitude: true,
        longitude: true
      }
    });
    
    console.log('📍 Sample UMKM data:');
    sampleUmkms.forEach(umkm => {
      console.log(`- ${umkm.name} (${umkm.latitude}, ${umkm.longitude})`);
    });
    
    await client.$disconnect();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

testConnection();