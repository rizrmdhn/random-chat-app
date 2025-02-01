CREATE TABLE "random-chat-app_messages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"message" varchar(500) NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "random-chat-app_users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" varchar(150) NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE INDEX "messages_message_idx" ON "random-chat-app_messages" USING btree ("message");--> statement-breakpoint
CREATE INDEX "messages_user_idx" ON "random-chat-app_messages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "messages_message_id_idx" ON "random-chat-app_messages" USING btree ("id");--> statement-breakpoint
CREATE INDEX "username_idx" ON "random-chat-app_users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "user_idx" ON "random-chat-app_users" USING btree ("id");