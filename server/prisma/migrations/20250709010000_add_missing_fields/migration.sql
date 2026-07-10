-- PaymentStatus: pending -> unpaid
ALTER TYPE "PaymentStatus" RENAME VALUE 'pending' TO 'unpaid';

-- Split payout status into its own enum
CREATE TYPE "PayoutStatus" AS ENUM ('pending', 'paid');
ALTER TABLE "orders" ALTER COLUMN "payoutStatus" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "payoutStatus" TYPE "PayoutStatus" USING "payoutStatus"::text::"PayoutStatus";
ALTER TABLE "orders" ALTER COLUMN "payoutStatus" SET DEFAULT 'pending';

-- User audit fields
ALTER TABLE "users" ADD COLUMN "developerRequestedAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "developerReviewedAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "developerReviewedBy" TEXT;
ALTER TABLE "users" ADD COLUMN "updatedBy" TEXT;

-- Order fields used by the frontend
ALTER TABLE "orders" ADD COLUMN "priceExplanation" TEXT NOT NULL DEFAULT '';
ALTER TABLE "orders" ADD COLUMN "companyRating" INTEGER;
ALTER TABLE "orders" ADD COLUMN "customerReview" TEXT NOT NULL DEFAULT '';
ALTER TABLE "orders" ADD COLUMN "completionAttachment" JSONB;
ALTER TABLE "orders" ADD COLUMN "quoteConfirmedAt" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN "assignedAt" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN "viewedAt" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN "confirmedAt" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN "arrivedAt" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN "startedAt" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN "completedAt" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN "managerApprovedAt" TIMESTAMP(3);

-- Attachments: string[] -> jsonb
ALTER TABLE "orders" ALTER COLUMN "attachments" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "attachments" TYPE JSONB USING to_jsonb("attachments");
ALTER TABLE "orders" ALTER COLUMN "attachments" SET DEFAULT '[]';
