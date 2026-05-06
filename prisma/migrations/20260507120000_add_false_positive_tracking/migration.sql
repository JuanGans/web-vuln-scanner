-- AlterTable
ALTER TABLE "Vulnerability" ADD COLUMN "isFalsePositive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "falsePositiveReason" TEXT,
ADD COLUMN "falsePositiveMarkedAt" TIMESTAMP(3);
