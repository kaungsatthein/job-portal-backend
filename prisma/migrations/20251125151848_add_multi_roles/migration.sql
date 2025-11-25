/*
  Warnings:

  - Changed the column `role` on the `User` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.

*/
-- AlterTable
-- 1. Add new column "roles" as array type
ALTER TABLE "User"
ADD COLUMN "roles" "UserRole"[] DEFAULT ARRAY['researcher']::"UserRole"[];

-- 2. Copy existing role value into the roles array
UPDATE "User"
SET "roles" = ARRAY["role"]::"UserRole"[];

-- 3. Drop the old column
ALTER TABLE "User"
DROP COLUMN "role";
