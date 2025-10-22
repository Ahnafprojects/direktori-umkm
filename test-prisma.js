const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('Available models:', Object.getOwnPropertyNames(prisma).filter(name => !name.startsWith('_')));