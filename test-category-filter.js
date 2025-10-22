// Test specific categories
import { db } from './src/lib/prisma.ts';

async function testCategoryFilter() {
  console.log('=== TEST FILTER KATEGORI ===\n');
  
  const testCases = [
    { category: undefined, name: 'undefined' },
    { category: '', name: 'empty string' },
    { category: 'all', name: 'all' },
    { category: 'makanan', name: 'makanan' },
    { category: 'minuman', name: 'minuman' },
    { category: 'jasa', name: 'jasa' },
    { category: 'belanja', name: 'belanja' }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n--- Testing category: ${testCase.name} (${testCase.category}) ---`);
    
    // Simulate the exact condition from actions.ts
    const whereCondition = {};
    
    if (testCase.category && testCase.category !== 'semua' && testCase.category !== 'all' && testCase.category !== '') {
      whereCondition.Category = {
        slug: testCase.category,
      };
      console.log('Applied filter:', whereCondition);
    } else {
      console.log('No filter applied (showing all)');
    }
    
    const umkms = await db.umkm.findMany({
      where: whereCondition,
      select: { 
        id: true, 
        name: true, 
        Category: { select: { name: true, slug: true } } 
      },
    });
    
    console.log(`Result: ${umkms.length} UMKM found`);
    if (umkms.length > 0) {
      umkms.forEach(umkm => {
        console.log(`  - ${umkm.name} (${umkm.Category.slug})`);
      });
    }
  }
  
  await db.$disconnect();
}

testCategoryFilter().catch(console.error);