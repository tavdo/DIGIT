-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('customer', 'manager', 'developer', 'admin');

-- CreateEnum
CREATE TYPE "DeveloperRequestStatus" AS ENUM ('none', 'pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "OrderPriority" AS ENUM ('urgent', 'tomorrow', 'flexible');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('new', 'quote_offered', 'quote_confirmed', 'quote_rejected', 'assigned', 'in_progress', 'waiting_approval', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "role" "UserRole" NOT NULL DEFAULT 'customer',
    "developerRequestStatus" "DeveloperRequestStatus" NOT NULL DEFAULT 'none',
    "companyName" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL DEFAULT '',
    "experienceCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "experienceYears" TEXT NOT NULL DEFAULT '',
    "ratingAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "ratingSum" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completedTasksCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "managerId" TEXT,
    "managerName" TEXT,
    "assignedDeveloperId" TEXT,
    "assignedDeveloperName" TEXT,
    "assignedDeveloperComment" TEXT NOT NULL DEFAULT '',
    "serviceId" TEXT NOT NULL DEFAULT '',
    "serviceType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "OrderPriority" NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'new',
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "developerPayout" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "payoutStatus" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "customerRating" DOUBLE PRECISION,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "managerNotes" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL DEFAULT '',
    "customerName" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "assignedDeveloperId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_content" (
    "id" TEXT NOT NULL,
    "docId" TEXT NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "site_content_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "orders_customerId_idx" ON "orders"("customerId");

-- CreateIndex
CREATE INDEX "orders_assignedDeveloperId_idx" ON "orders"("assignedDeveloperId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "reviews_assignedDeveloperId_idx" ON "reviews"("assignedDeveloperId");

-- CreateIndex
CREATE UNIQUE INDEX "site_content_docId_key" ON "site_content"("docId");
