-- CreateEnum
CREATE TYPE "CancellationStatus" AS ENUM ('NONE', 'REQUESTED', 'APPROVED', 'REJECTED', 'REFUNDED');

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "cancellationRequestedAt" TIMESTAMP(3),
ADD COLUMN     "cancellationStatus" "CancellationStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "refundAccountDetails" JSONB;
