// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

declare global {
  var prisma: any;
}

// Setup Prisma dengan fallback yang robust untuk development dan production
const createPrismaClient = () => {
  const isUsingAccelerate = process.env.DATABASE_URL?.startsWith('prisma+');
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  try {
    const client = new PrismaClient({
      log: isDevelopment ? ['error'] : [],
    });
    
    // Untuk development, coba tanpa Accelerate dulu
    if (isDevelopment && !isUsingAccelerate) {
      console.log('� Using regular Prisma client for development...');
      return client;
    }
    
    // Untuk production atau jika menggunakan Accelerate URL
    if (isUsingAccelerate) {
      console.log('� Attempting to use Prisma Accelerate...');
      try {
        return client.$extends(withAccelerate());
      } catch (accelerateError) {
        console.warn('❌ Accelerate failed, using regular client:', accelerateError);
        return client;
      }
    }
    
    console.log('� Using regular Prisma client...');
    return client;
  } catch (error) {
    console.error('Prisma client creation failed:', error);
    throw error;
  }
};

export const db = globalThis.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db;