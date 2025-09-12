/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('recruiter', 'researcher', 'admin');

-- CreateEnum
CREATE TYPE "public"."JobType" AS ENUM ('fulltime', 'parttime', 'contract');

-- CreateEnum
CREATE TYPE "public"."ApplicationStatus" AS ENUM ('submitted', 'reviewed', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "public"."JobStatus" AS ENUM ('open', 'closed');

-- CreateEnum
CREATE TYPE "public"."Industry" AS ENUM ('TECHNOLOGY', 'FINANCE', 'HEALTHCARE', 'EDUCATION', 'OTHER');

-- DropForeignKey
ALTER TABLE "public"."Post" DROP CONSTRAINT "Post_authorId_fkey";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "role" "public"."UserRole" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "name" SET NOT NULL;

-- DropTable
DROP TABLE "public"."Post";

-- CreateTable
CREATE TABLE "public"."RecruiterUser" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "RecruiterUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "industry" "public"."Industry",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Skill" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ResearcherUserSkill" (
    "researcherUserId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,

    CONSTRAINT "ResearcherUserSkill_pkey" PRIMARY KEY ("researcherUserId","skillId")
);

-- CreateTable
CREATE TABLE "public"."ResearcherUser" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "resumeId" INTEGER,

    CONSTRAINT "ResearcherUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Resume" (
    "id" SERIAL NOT NULL,
    "researcherUserId" INTEGER NOT NULL,
    "birthDate" TIMESTAMP(3),
    "nrc" TEXT,
    "pdfUrl" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JobPosting" (
    "id" SERIAL NOT NULL,
    "recruiterUserId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "jobType" "public"."JobType" NOT NULL,
    "location" TEXT,
    "salaryRange" TEXT,
    "status" "public"."JobStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Application" (
    "id" SERIAL NOT NULL,
    "researcherUserId" INTEGER NOT NULL,
    "jobId" INTEGER NOT NULL,
    "status" "public"."ApplicationStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "applicationId" INTEGER,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecruiterUser_userId_key" ON "public"."RecruiterUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ResearcherUser_userId_key" ON "public"."ResearcherUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ResearcherUser_resumeId_key" ON "public"."ResearcherUser"("resumeId");

-- CreateIndex
CREATE UNIQUE INDEX "Resume_researcherUserId_key" ON "public"."Resume"("researcherUserId");

-- AddForeignKey
ALTER TABLE "public"."RecruiterUser" ADD CONSTRAINT "RecruiterUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RecruiterUser" ADD CONSTRAINT "RecruiterUser_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ResearcherUserSkill" ADD CONSTRAINT "ResearcherUserSkill_researcherUserId_fkey" FOREIGN KEY ("researcherUserId") REFERENCES "public"."ResearcherUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ResearcherUserSkill" ADD CONSTRAINT "ResearcherUserSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ResearcherUser" ADD CONSTRAINT "ResearcherUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Resume" ADD CONSTRAINT "Resume_researcherUserId_fkey" FOREIGN KEY ("researcherUserId") REFERENCES "public"."ResearcherUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobPosting" ADD CONSTRAINT "JobPosting_recruiterUserId_fkey" FOREIGN KEY ("recruiterUserId") REFERENCES "public"."RecruiterUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_researcherUserId_fkey" FOREIGN KEY ("researcherUserId") REFERENCES "public"."ResearcherUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."JobPosting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;
