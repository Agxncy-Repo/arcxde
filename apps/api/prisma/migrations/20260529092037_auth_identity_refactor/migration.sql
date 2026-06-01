/*
  Warnings:

  - You are about to drop the column `primaryDomain` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `password_hash` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "IdentityProvider" AS ENUM ('EMAIL_PASSWORD', 'GOOGLE', 'APPLE', 'GITHUB', 'MICROSOFT', 'OKTA', 'SAML');

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_user_id_fkey";

-- AlterTable
ALTER TABLE "admin_logs" ALTER COLUMN "id" SET DEFAULT 'alog_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "admin_users" ALTER COLUMN "id" SET DEFAULT 'adm_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "assessment_attempts" ALTER COLUMN "id" SET DEFAULT 'aat_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "assessment_questions" ALTER COLUMN "id" SET DEFAULT 'aq_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "assessments" ALTER COLUMN "id" SET DEFAULT 'asm_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "awards" ALTER COLUMN "id" SET DEFAULT 'awd_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "briefs" ALTER COLUMN "id" SET DEFAULT 'brf_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "course_awards" ALTER COLUMN "id" SET DEFAULT 'ca_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "course_catalogs" ALTER COLUMN "id" SET DEFAULT 'cat_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "courses" ALTER COLUMN "id" SET DEFAULT 'crs_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "faq_items" ALTER COLUMN "id" SET DEFAULT 'faq_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "feeds" ALTER COLUMN "id" SET DEFAULT 'feed_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "glossary_terms" ALTER COLUMN "id" SET DEFAULT 'gloss_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "lessons" ALTER COLUMN "id" SET DEFAULT 'les_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "leveling_quizzes" ALTER COLUMN "id" SET DEFAULT 'quiz_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "libraries" ALTER COLUMN "id" SET DEFAULT 'lib_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "media" ALTER COLUMN "id" SET DEFAULT 'med_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "memberships" ALTER COLUMN "id" SET DEFAULT 'mem_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "modules" ALTER COLUMN "id" SET DEFAULT 'mod_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "news" ALTER COLUMN "id" SET DEFAULT 'news_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "news_read" ALTER COLUMN "id" SET DEFAULT 'nr_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "oauth_connections" ALTER COLUMN "id" SET DEFAULT 'oauth_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "organizations" DROP COLUMN "primaryDomain",
ALTER COLUMN "id" SET DEFAULT 'org_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "partner_apis" ALTER COLUMN "id" SET DEFAULT 'papi_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "id" SET DEFAULT 'pay_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "quiz_attempts" ALTER COLUMN "id" SET DEFAULT 'qa_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "quiz_questions" ALTER COLUMN "id" SET DEFAULT 'qq_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "reviews" ALTER COLUMN "id" SET DEFAULT 'rev_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "rewards" ALTER COLUMN "id" SET DEFAULT 'rwd_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "saved_courses" ALTER COLUMN "id" SET DEFAULT 'sc_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "saved_media" ALTER COLUMN "id" SET DEFAULT 'sm_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "sso_configs" ALTER COLUMN "id" SET DEFAULT 'sso_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "team_members" ALTER COLUMN "id" SET DEFAULT 'tm_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "teams" ALTER COLUMN "id" SET DEFAULT 'team_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "token_balances" ALTER COLUMN "id" SET DEFAULT 'tb_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "token_prices" ALTER COLUMN "id" SET DEFAULT 'tp_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "token_transactions" ALTER COLUMN "id" SET DEFAULT 'tt_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "user_awards" ALTER COLUMN "id" SET DEFAULT 'ua_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "user_lesson_progress" ALTER COLUMN "id" SET DEFAULT 'ulp_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "user_rewards" ALTER COLUMN "id" SET DEFAULT 'ur_' || gen_random_uuid()::text;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "password_hash",
ALTER COLUMN "id" SET DEFAULT 'usr_' || gen_random_uuid()::text;

-- DropTable
DROP TABLE "sessions";

-- CreateTable
CREATE TABLE "Identity" (
    "id" TEXT NOT NULL DEFAULT 'iden_' ||gen_random_uuid()::text,
    "user_id" VARCHAR(255) NOT NULL,
    "provider" "IdentityProvider" NOT NULL,
    "providerId" TEXT NOT NULL,
    "passwordHash" TEXT,
    "providerEmail" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Identity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL DEFAULT 'ses_' || gen_random_uuid()::text,
    "tokenHash" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Identity_user_id_idx" ON "Identity"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Identity_provider_providerId_key" ON "Identity"("provider", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_user_id_idx" ON "Session"("user_id");

-- CreateIndex
CREATE INDEX "Session_tokenHash_idx" ON "Session"("tokenHash");

-- AddForeignKey
ALTER TABLE "Identity" ADD CONSTRAINT "Identity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
