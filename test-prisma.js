const { PrismaClient } = require('@prisma/client');

async function test() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Available models:', Object.getOwnPropertyNames(prisma).filter(name => !name.startsWith('_') && !name.startsWith('$')));
    
    // Test if order model exists
    console.log('Order exists?', typeof prisma.order);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

test();