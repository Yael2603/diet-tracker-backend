import { prisma } from '../db/prisma';
import { runSeed } from './seed';

console.log('🌱 מריץ Seed...');
runSeed()
  .then(() => console.log('✅ Seed הסתיים'))
  .catch((err) => {
    console.error('❌ Seed נכשל:', err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
