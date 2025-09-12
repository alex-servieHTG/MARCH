/*
  Warnings:

  - You are about to drop the column `photographerUrl` on the `Project` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "STAKEHOLDER_TYPE" ADD VALUE 'PHOTOGRAPHER';

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "photographerUrl";
