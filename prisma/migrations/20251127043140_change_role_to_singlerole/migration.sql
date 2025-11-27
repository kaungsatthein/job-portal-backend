-- AlterTable
ALTER TABLE "User"
  ALTER COLUMN "role" DROP DEFAULT,
  ALTER COLUMN "role" SET DATA TYPE "UserRole"
  USING 'researcher'::"UserRole";

ALTER TABLE "User"
  ALTER COLUMN "role" SET NOT NULL,
  ALTER COLUMN "role" SET DEFAULT 'researcher';
