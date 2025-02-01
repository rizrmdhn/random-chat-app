ALTER TABLE "random-chat-app_users" ALTER COLUMN "password" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "random-chat-app_users" DROP COLUMN "type";--> statement-breakpoint
DROP TYPE "public"."users";