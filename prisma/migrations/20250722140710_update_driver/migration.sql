/*
  Warnings:

  - You are about to alter the column `nationalId` on the `Driver` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(18)`.
  - You are about to alter the column `licenseNumber` on the `Driver` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(10)`.

*/
-- AlterTable
ALTER TABLE "Driver" ALTER COLUMN "nationalId" SET DATA TYPE CHAR(18),
ALTER COLUMN "licenseNumber" SET DATA TYPE CHAR(10);
