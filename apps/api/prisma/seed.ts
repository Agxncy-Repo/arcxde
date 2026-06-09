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

  // ---- Developer questions (AI Literacy) ----
  const developerQuestions = [
    {
      role: 'developer',
      questionKey: 'ai_lit_01',
      text: 'What do foundation models generate responses from?',
      options: ['Explicit rules', 'Training data patterns', 'User instructions'],
      order: 1,
    },
    {
      role: 'developer',
      questionKey: 'ai_lit_02',
      text: 'What is the term for when an AI generates plausible-sounding but false information?',
      options: ['Bias', 'Hallucination', 'Variance'],
      order: 2,
    },
    {
      role: 'developer',
      questionKey: 'ai_lit_03',
      text: 'Why are AI outputs probabilistic rather than deterministic?',
      options: [
        'AI outputs are probabilistic by design',
        'Because of randomness in training',
        'Due to system errors',
      ],
      order: 3,
    },
    {
      role: 'developer',
      questionKey: 'ai_lit_04',
      text: 'What do AI systems fundamentally do?',
      options: [
        'Follow explicit rules',
        'Predict probable next outputs',
        'Retrieve pre-stored answers',
      ],
      order: 4,
    },
    {
      role: 'developer',
      questionKey: 'ai_lit_05',
      text: 'How can you best reduce hallucinations in AI outputs?',
      options: ['Increase temperature', 'Use structured outputs', 'Remove context'],
      order: 5,
    },
    {
      role: 'developer',
      questionKey: 'ai_lit_06',
      text: 'What is the best approach to ensure AI uses current information?',
      options: [
        'Train new models daily',
        'Retrieve from trusted systems at runtime',
        'Accept all outputs as current',
      ],
      order: 6,
    },
    {
      role: 'developer',
      questionKey: 'ai_lit_07',
      text: 'What is automation bias in the context of AI systems?',
      options: [
        'Preference for automated systems',
        'Automation bias and lack of oversight',
        'Systems becoming slower',
      ],
      order: 7,
    },
    {
      role: 'developer',
      questionKey: 'ai_lit_08',
      text: 'Which is the most important control for responsible AI deployment?',
      options: [
        'Removing all AI features',
        'Tool permissions and approval controls',
        'Never using AI',
      ],
      order: 8,
    },
    {
      role: 'developer',
      questionKey: 'ai_lit_09',
      text: 'What should developers review before deploying AI features?',
      options: ['Only code quality', 'Privacy requirements', 'Only speed metrics'],
      order: 9,
    },
    {
      role: 'developer',
      questionKey: 'ai_lit_10',
      text: 'What is the key principle for handling user data in AI systems?',
      options: [
        'Collect all available data',
        'Only provide necessary information',
        'Share all data publicly',
      ],
      order: 10,
    },
    {
      role: 'developer',
      questionKey: 'ai_lit_11',
      text: 'Why is privacy governance important for AI systems?',
      options: [
        'It is not important',
        'Privacy obligations and data rights',
        'Only for compliance',
      ],
      order: 11,
    },
    {
      role: 'developer',
      questionKey: 'ai_lit_12',
      text: 'What is a key risk when AI has access to sensitive user data?',
      options: [
        'Data becomes faster',
        'Potential exposure of sensitive information',
        'No risks exist',
      ],
      order: 12,
    },
    {
      role: 'developer',
      questionKey: 'ai_lit_13',
      text: 'What determines if an AI system is safe to deploy?',
      options: [
        'Only technical performance',
        'Accuracy alone does not determine risk',
        'Speed of responses',
      ],
      order: 13,
    },
    {
      role: 'developer',
      questionKey: 'ai_lit_14',
      text: 'What can cause AI systems to produce discriminatory outcomes?',
      options: ['Low accuracy', 'Automation bias', 'User preferences'],
      order: 14,
    },
    {
      role: 'developer',
      questionKey: 'ai_lit_15',
      text: 'How should performance disparities across user groups be addressed?',
      options: ['Ignore them', 'Investigate performance disparities', 'Document but not fix'],
      order: 15,
    },
    {
      role: 'developer',
      questionKey: 'ai_lit_16',
      text: 'Why is ongoing evaluation with production data important?',
      options: [
        'It is not important',
        'Conduct ongoing evaluation using production data',
        'Only test once',
      ],
      order: 16,
    },
    {
      role: 'developer',
      questionKey: 'ai_lit_17',
      text: 'What should be assessed when evaluating AI system risks?',
      options: ['Only technical metrics', 'What harm could occur', 'Only user feedback'],
      order: 17,
    },
    {
      role: 'developer',
      questionKey: 'ai_lit_18',
      text: 'Who ultimately bears responsibility for AI system outcomes?',
      options: ['Only the AI model', 'Deployers remain responsible', 'Only end users'],
      order: 18,
    },
    {
      role: 'developer',
      questionKey: 'ai_lit_19',
      text: 'What matters most when assessing AI system impact?',
      options: [
        'Only theoretical metrics',
        'Real-world outcomes and user impact',
        'Only model benchmarks',
      ],
      order: 19,
    },
    {
      role: 'developer',
      questionKey: 'ai_lit_20',
      text: 'What is the goal of responsible AI governance?',
      options: [
        'Eliminate all AI usage',
        'Balancing usefulness, reliability, oversight, privacy and user impact',
        'Maximize speed',
      ],
      order: 20,
    },
  ];

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

  // Create developer questions (AI Literacy)
  for (const q of developerQuestions) {
    await prisma.onboardingQuestion.create({
      data: q,
    });
  }

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
