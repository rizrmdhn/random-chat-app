CREATE TABLE "random-chat-app_channels" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "channel_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE INDEX "channel_name_idx" ON "random-chat-app_channels" USING btree ("name");--> statement-breakpoint
CREATE INDEX "channel_idx" ON "random-chat-app_channels" USING btree ("id");