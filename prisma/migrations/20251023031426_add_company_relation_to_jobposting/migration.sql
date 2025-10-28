/*
  Warnings:

  - You are about to drop the column `researcherUserId` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `industry` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `recruiterUserId` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the `RecruiterUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResearcherUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResearcherUserSkill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Resume` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Skill` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[googleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `researcherId` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `JobPosting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recruiterId` to the `JobPosting` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Application" DROP CONSTRAINT "Application_researcherUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."JobPosting" DROP CONSTRAINT "JobPosting_recruiterUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RecruiterUser" DROP CONSTRAINT "RecruiterUser_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RecruiterUser" DROP CONSTRAINT "RecruiterUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ResearcherUser" DROP CONSTRAINT "ResearcherUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ResearcherUserSkill" DROP CONSTRAINT "ResearcherUserSkill_researcherUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ResearcherUserSkill" DROP CONSTRAINT "ResearcherUserSkill_skillId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Resume" DROP CONSTRAINT "Resume_researcherUserId_fkey";

-- AlterTable
ALTER TABLE "public"."Application" DROP COLUMN "researcherUserId",
ADD COLUMN     "researcherId" INTEGER NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'submitted';

-- AlterTable
ALTER TABLE "public"."Company" DROP COLUMN "industry",
ADD COLUMN     "industryId" INTEGER;

-- AlterTable
ALTER TABLE "public"."JobPosting" DROP COLUMN "recruiterUserId",
ADD COLUMN     "companyId" INTEGER NOT NULL,
ADD COLUMN     "recruiterId" INTEGER NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'open';

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "companyId" INTEGER,
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "nrc" TEXT,
ADD COLUMN     "resumeUrl" TEXT,
ALTER COLUMN "passwordHash" DROP NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'researcher';

-- DropTable
DROP TABLE "public"."RecruiterUser";

-- DropTable
DROP TABLE "public"."ResearcherUser";

-- DropTable
DROP TABLE "public"."ResearcherUserSkill";

-- DropTable
DROP TABLE "public"."Resume";

-- DropTable
DROP TABLE "public"."Skill";

-- DropEnum
DROP TYPE "public"."Industry";

-- CreateTable
CREATE TABLE "public"."Industry" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Industry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Industry_name_key" ON "public"."Industry"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "public"."User"("googleId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Company" ADD CONSTRAINT "Company_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "public"."Industry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobPosting" ADD CONSTRAINT "JobPosting_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobPosting" ADD CONSTRAINT "JobPosting_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_researcherId_fkey" FOREIGN KEY ("researcherId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
