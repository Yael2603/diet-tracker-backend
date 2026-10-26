import { env } from './config/env';
import { createApp } from './app';
import { prisma } from './db/prisma';
import { runSeed } from './seed/seed';

async function main() {
  // אפשרות להכנסת נתוני התחלה אוטומטית בעליית השרת (שימושי ב-Render)
  if (env.SEED_ON_START) {
    console.log('🌱 SEED_ON_START=true - מריץ Seed...');
    await runSeed();
  }

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`✅ השרת פועל על פורט ${env.PORT}`);
    console.log(`📘 Swagger: http://localhost:${env.PORT}/api-docs`);
  });

  const shutdown = async () => {
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch(async (err) => {
  console.error('❌ השרת לא הצליח לעלות:', err);
  await prisma.$disconnect();
  process.exit(1);
});
