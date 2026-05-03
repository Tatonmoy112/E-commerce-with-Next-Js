import 'dotenv/config';
import prisma from './lib/prisma.js';


async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('✅ Connection successful! Found users:', users.length);
  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
