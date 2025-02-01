CREATE TYPE "public"."users" AS ENUM('user', 'guest');--> statement-breakpoint
ALTER TABLE "random-chat-app_users" ADD COLUMN "type" "users" NOT NULL;