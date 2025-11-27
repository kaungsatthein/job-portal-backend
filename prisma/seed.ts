// prisma/seed.ts
import {
  PrismaClient,
  UserRole,
  Status,
  JobType,
  ApplicationStatus,
  JobStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1️⃣ Industries
  const techIndustry = await prisma.industry.upsert({
    where: { name: 'Technology' },
    update: {},
    create: { name: 'Technology' },
  });

  const financeIndustry = await prisma.industry.upsert({
    where: { name: 'Finance' },
    update: {},
    create: { name: 'Finance' },
  });

  // 2️⃣ Companies
  const acme = await prisma.company.create({
    data: {
      name: 'Acme Corp',
      industry: { connect: { id: techIndustry.id } },
    },
  });

  const globobank = await prisma.company.create({
    data: {
      name: 'GloboBank',
      industry: { connect: { id: financeIndustry.id } },
    },
  });

  // 3️⃣ Hash passwords
  const adminPwd = await bcrypt.hash('Admin#123', 10);
  const recruiterPwd = await bcrypt.hash('Recruiter#123', 10);
  const researcherPwd = await bcrypt.hash('Researcher#123', 10);

  // 4️⃣ Users with roles as array
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: adminPwd,
      name: 'System Admin',
      role: UserRole.admin, // array now
      status: Status.ACTIVE,
      provider: 'local',
      emailVerified: true,
    },
  });

  const recruiter = await prisma.user.create({
    data: {
      email: 'recruiter@acme.com',
      passwordHash: recruiterPwd,
      name: 'Alice Recruiter',
      role: UserRole.recruiter, // array
      status: Status.ACTIVE,
      provider: 'local',
      emailVerified: true,
      company: { connect: { id: acme.id } },
    },
  });

  const researcherLocal = await prisma.user.create({
    data: {
      email: 'researcher.local@example.com',
      passwordHash: researcherPwd,
      name: 'Bob Researcher',
      role: UserRole.researcher, // array
      status: Status.ACTIVE,
      provider: 'local',
      emailVerified: true,
    },
  });

  const researcherGoogle = await prisma.user.create({
    data: {
      email: 'researcher.google@example.com',
      google_id: 'google-123',
      google_email: 'researcher.google@example.com',
      name: 'Gina Researcher',
      role: UserRole.researcher, // array
      status: Status.ACTIVE,
      avatar_url: 'https://picsum.photos/200',
      provider: 'google',
      emailVerified: true,
    },
  });

  // 5️⃣ Account (Google OAuth)
  await prisma.account.create({
    data: {
      userId: researcherGoogle.id,
      provider: 'google',
      providerAccountId: 'google-123',
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    },
  });

  // 6️⃣ Job Postings
  const job1 = await prisma.jobPosting.create({
    data: {
      title: 'Senior Backend Engineer',
      description:
        'Build scalable backend systems using Node.js and PostgreSQL.',
      jobType: JobType.fulltime,
      location: 'Remote',
      salaryRange: '9000-12000 SGD',
      recruiter: { connect: { id: recruiter.id } },
      company: { connect: { id: acme.id } },
    },
  });

  const job2 = await prisma.jobPosting.create({
    data: {
      title: 'Data Analyst (Contract)',
      description:
        'Analyze datasets and build dashboards for financial insights.',
      jobType: JobType.contract,
      location: 'Singapore',
      salaryRange: '6000-8000 SGD',
      recruiter: { connect: { id: recruiter.id } },
      company: { connect: { id: globobank.id } },
    },
  });

  // 7️⃣ Applications
  const app1 = await prisma.application.create({
    data: {
      status: ApplicationStatus.submitted,
      researcher: { connect: { id: researcherLocal.id } },
      job: { connect: { id: job1.id } },
    },
  });

  const app2 = await prisma.application.create({
    data: {
      status: ApplicationStatus.reviewed,
      researcher: { connect: { id: researcherGoogle.id } },
      job: { connect: { id: job2.id } },
    },
  });

  // 8️⃣ Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: recruiter.id,
        type: 'application_received',
        message: `New application received for "${job1.title}"`,
        applicationId: app1.id,
        readAt: null,
      },
      {
        userId: researcherGoogle.id,
        type: 'application_reviewed',
        message: `Your application for "${job2.title}" was reviewed`,
        applicationId: app2.id,
        readAt: null,
      },
      {
        userId: admin.id,
        type: 'system',
        message: 'System seed completed successfully. Admin privileges active.',
        readAt: new Date(),
      },
    ],
  });

  console.log('✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
