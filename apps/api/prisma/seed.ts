/**
 * Database seed script.
 *
 * Run with: pnpm db:seed
 *
 * Properties:
 *   - Idempotent — safe to re-run; uses upsert by stable natural keys (slug, email).
 *   - Dev-only — refuses to run in production (extra guard on top of CI policy).
 *   - Small — enough to log in and click around. Heavy fixtures live in tests, not here.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed in production');
  }

  console.log('🌱 Seeding...');

  // ---- Organizations ----
  const acme = await prisma.organization.upsert({
    where: { slug: 'acme' },
    update: {},
    create: {
      name: 'Acme Inc',
      slug: 'acme',
      plan: 'growth',
      billingEmail: 'billing@acme.test',
    },
  });

  const lumon = await prisma.organization.upsert({
    where: { slug: 'lumon' },
    update: {},
    create: {
      name: 'Lumon Industries',
      slug: 'lumon',
      plan: 'enterprise',
      billingEmail: 'ap@lumon.test',
    },
  });

  // ---- Users ----
  // Password hash is intentionally null — seeded users use a magic-link login flow
  // in dev. If you need a password-able test user, hash with Argon2 in a separate
  // script and use the team password manager for the credentials.
  const alice = await prisma.user.upsert({
    where: { email: 'alice@acme.test' },
    update: {},
    create: {
      email: 'alice@acme.test',
      fullName: 'Alice Admin',
      emailVerified: new Date(),
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@acme.test' },
    update: {},
    create: {
      email: 'bob@acme.test',
      fullName: 'Bob Member',
      emailVerified: new Date(),
    },
  });

  // ---- Memberships ----
  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: alice.id, organizationId: acme.id } },
    update: {},
    create: { userId: alice.id, organizationId: acme.id, role: 'owner' },
  });

  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: bob.id, organizationId: acme.id } },
    update: {},
    create: { userId: bob.id, organizationId: acme.id, role: 'member' },
  });

  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: alice.id, organizationId: lumon.id } },
    update: {},
    create: { userId: alice.id, organizationId: lumon.id, role: 'admin' },
  });

  console.log('✅ Seed complete');
  console.log('   Organizations:', { acme: acme.id, lumon: lumon.id });
  console.log('   Users:        ', { alice: alice.id, bob: bob.id });
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
