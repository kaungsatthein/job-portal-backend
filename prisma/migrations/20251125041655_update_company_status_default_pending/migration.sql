-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "status" "JobStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "JobPosting" ALTER COLUMN "status" SET DEFAULT 'pending';
