-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('OFFER', 'REQUEST');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('ACTIVE', 'MATCHED', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "UrgencyLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "VolunteerApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "phone" TEXT,
    "bio" TEXT,
    "district_id" TEXT,
    "impact_score" INTEGER NOT NULL DEFAULT 0,
    "tasks_completed" INTEGER NOT NULL DEFAULT 0,
    "average_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "icon" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "districts" (
    "id" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "type" "PostType" NOT NULL,
    "description" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "district_id" TEXT NOT NULL,
    "urgency" "UrgencyLevel" NOT NULL DEFAULT 'MEDIUM',
    "status" "PostStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_id" TEXT NOT NULL,
    "ai_moderated" BOOLEAN NOT NULL DEFAULT false,
    "ai_score" DOUBLE PRECISION,
    "ai_summary" TEXT,
    "blockchain_tx" TEXT,
    "blockchain_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connections" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "giver_id" TEXT NOT NULL,
    "requester_id" TEXT NOT NULL,
    "status" "ConnectionStatus" NOT NULL DEFAULT 'PENDING',
    "proof_image_url" TEXT,
    "proof_note" TEXT,
    "completed_at" TIMESTAMP(3),
    "giver_rating" INTEGER,
    "requester_rating" INTEGER,
    "giver_review" TEXT,
    "requester_review" TEXT,
    "blockchain_tx" TEXT,
    "blockchain_verified" BOOLEAN NOT NULL DEFAULT false,
    "giver_points" INTEGER NOT NULL DEFAULT 0,
    "requester_points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "description" TEXT,
    "description_ar" TEXT,
    "logo_url" TEXT,
    "website" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "charities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteer_programs" (
    "id" TEXT NOT NULL,
    "charity_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "description" TEXT,
    "description_ar" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "enrolled" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "volunteer_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteer_applications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "status" "VolunteerApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "volunteer_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zakat_donations" (
    "id" TEXT NOT NULL,
    "donor_id" TEXT NOT NULL,
    "charity_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'JOD',
    "receipt_url" TEXT,
    "blockchain_tx" TEXT,
    "blockchain_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zakat_donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "reported_user_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "admin_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "posts_type_status_idx" ON "posts"("type", "status");

-- CreateIndex
CREATE INDEX "posts_category_id_idx" ON "posts"("category_id");

-- CreateIndex
CREATE INDEX "posts_district_id_idx" ON "posts"("district_id");

-- CreateIndex
CREATE INDEX "posts_urgency_idx" ON "posts"("urgency");

-- CreateIndex
CREATE INDEX "posts_user_id_idx" ON "posts"("user_id");

-- CreateIndex
CREATE INDEX "connections_post_id_idx" ON "connections"("post_id");

-- CreateIndex
CREATE INDEX "connections_giver_id_idx" ON "connections"("giver_id");

-- CreateIndex
CREATE INDEX "connections_requester_id_idx" ON "connections"("requester_id");

-- CreateIndex
CREATE INDEX "connections_status_idx" ON "connections"("status");

-- CreateIndex
CREATE INDEX "messages_connection_id_created_at_idx" ON "messages"("connection_id", "created_at");

-- CreateIndex
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

-- CreateIndex
CREATE INDEX "volunteer_programs_charity_id_idx" ON "volunteer_programs"("charity_id");

-- CreateIndex
CREATE UNIQUE INDEX "volunteer_applications_user_id_program_id_key" ON "volunteer_applications"("user_id", "program_id");

-- CreateIndex
CREATE INDEX "zakat_donations_donor_id_idx" ON "zakat_donations"("donor_id");

-- CreateIndex
CREATE INDEX "zakat_donations_charity_id_idx" ON "zakat_donations"("charity_id");

-- CreateIndex
CREATE INDEX "reports_reporter_id_idx" ON "reports"("reporter_id");

-- CreateIndex
CREATE INDEX "reports_reported_user_id_idx" ON "reports"("reported_user_id");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_giver_id_fkey" FOREIGN KEY ("giver_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_programs" ADD CONSTRAINT "volunteer_programs_charity_id_fkey" FOREIGN KEY ("charity_id") REFERENCES "charities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_applications" ADD CONSTRAINT "volunteer_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_applications" ADD CONSTRAINT "volunteer_applications_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "volunteer_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zakat_donations" ADD CONSTRAINT "zakat_donations_donor_id_fkey" FOREIGN KEY ("donor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zakat_donations" ADD CONSTRAINT "zakat_donations_charity_id_fkey" FOREIGN KEY ("charity_id") REFERENCES "charities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_user_id_fkey" FOREIGN KEY ("reported_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
