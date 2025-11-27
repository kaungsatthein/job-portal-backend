/*
  Warnings:

  - You are about to drop the column `isRead` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "isRead",
ADD COLUMN     "readAt" TIMESTAMP(3),
ADD COLUMN     "type" TEXT NOT NULL;
