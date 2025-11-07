-- AlterEnum
ALTER TYPE "JobStatus" ADD VALUE 'pending';

-- AlterTable
ALTER TABLE "JobPosting" ALTER COLUMN "status" SET DEFAULT 'pending';
