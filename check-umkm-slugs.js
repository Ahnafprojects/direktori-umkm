// Script untuk cek slug UMKM yang ada di database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUmkmSlugs() {
  try {
    console.log('Checking all UMKM slugs in database...');
    
    const umkms = await prisma.umkm.findMany({
      select: {
        id: true,
        name: true,
        slug: true
      },
      orderBy: {
        id: 'asc'
      }
    });
    
    console.log('\nAll UMKM in database:');
    console.log('='.repeat(50));
    
    umkms.forEach((umkm, index) => {
      console.log(`${index + 1}. ID: ${umkm.id}`);
      console.log(`   Name: ${umkm.name}`);
      console.log(`   Slug: ${umkm.slug}`);
      console.log(`   URL: https://lokalkeren.netlify.app/umkm/${umkm.slug}`);
      console.log('-'.repeat(40));
    });
    
    console.log(`\nTotal UMKM found: ${umkms.length}`);
    
    // Cari yang mirip dengan "warkop-malaka"
    const warkopUmkm = umkms.find(umkm => 
      umkm.name.toLowerCase().includes('warkop') || 
      umkm.name.toLowerCase().includes('malaka')
    );
    
    if (warkopUmkm) {
      console.log('\nFound Warkop/Malaka UMKM:');
      console.log(`Correct URL: https://lokalkeren.netlify.app/umkm/${warkopUmkm.slug}`);
    } else {
      console.log('\nNo Warkop/Malaka UMKM found in database');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUmkmSlugs();