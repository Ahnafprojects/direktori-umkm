// Debug script untuk cek kategori
import { db } from './src/lib/prisma.ts';

async function main() {
  console.log('=== SEMUA KATEGORI ===');
  const categories = await db.category.findMany();
  categories.forEach(cat => {
    console.log(`ID: ${cat.id}, Name: ${cat.name}, Slug: ${cat.slug}`);
  });
  
  console.log('\n=== UMKM PER KATEGORI ===');
  for (const cat of categories) {
    const count = await db.umkm.count({
      where: { categoryId: cat.id }
    });
    console.log(`${cat.slug}: ${count} UMKM`);
  }
  
  console.log('\n=== UMKM KATEGORI MINUMAN ===');
  const minumanUmkms = await db.umkm.findMany({
    where: { 
      Category: { slug: 'minuman' }
    },
    select: { id: true, name: true, Category: { select: { slug: true } } }
  });
  console.log(minumanUmkms);
  
  console.log('\n=== UMKM KATEGORI JASA ===');
  const jasaUmkms = await db.umkm.findMany({
    where: { 
      Category: { slug: 'jasa' }
    },
    select: { id: true, name: true, Category: { select: { slug: true } } }
  });
  console.log(jasaUmkms);
  
  await db.$disconnect();
}

main().catch(console.error);