/*
  Warnings:

  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "thresholdFirma" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."UserSignature" ADD COLUMN     "isX" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "storageUrl" TEXT;

-- CreateIndex
CREATE INDEX "ContractSignature_contractId_createdAt_idx" ON "public"."ContractSignature"("contractId", "createdAt");

-- CreateIndex
CREATE INDEX "UserSignature_userId_createdAt_idx" ON "public"."UserSignature"("userId", "createdAt");
