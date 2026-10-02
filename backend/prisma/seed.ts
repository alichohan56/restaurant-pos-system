import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

try {
  process.loadEnvFile();
} catch {
  // .env not present; rely on environment variables injected by `prisma db seed`
}

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL ?? '',
});
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash('Admin@123', saltRounds);

  await prisma.user.upsert({
    where: { email: 'admin@restaurantpos.com' },
    update: {
      name: 'System Admin',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
    create: {
      name: 'System Admin',
      email: 'admin@restaurantpos.com',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('Admin seed completed: admin@restaurantpos.com');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error('Admin seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
