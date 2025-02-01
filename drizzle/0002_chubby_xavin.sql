ALTER TABLE "random-chat-app_messages" ADD COLUMN "channel_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "random-chat-app_messages" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "random-chat-app_messages" ADD CONSTRAINT "random-chat-app_messages_channel_id_random-chat-app_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."random-chat-app_channels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "random-chat-app_messages" ADD CONSTRAINT "random-chat-app_messages_user_id_random-chat-app_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."random-chat-app_users"("id") ON DELETE no action ON UPDATE no action;