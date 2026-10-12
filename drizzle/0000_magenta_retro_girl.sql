CREATE TABLE "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" uuid NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"video_url" text NOT NULL,
	"duration" text NOT NULL,
	"notes" text,
	"admin_notes" text,
	"cliffnotes" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"has_video" boolean DEFAULT true NOT NULL,
	"video_status" varchar(50) DEFAULT 'not_started' NOT NULL,
	"filming_date" timestamp,
	CONSTRAINT "lessons_module_id_slug_unique" UNIQUE("module_id","slug")
);
--> statement-breakpoint
CREATE TABLE "levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level_id" uuid,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"wrapUpVideoUrl" text DEFAULT '',
	"is_published" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "modules_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"lesson_id" text NOT NULL,
	"last_position" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp DEFAULT now(),
	CONSTRAINT "progress_user_id_lesson_id_unique" UNIQUE("user_id","lesson_id")
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"customer_id" text,
	"payment_intent_id" text NOT NULL,
	"amount_total" integer,
	"applied_to_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "purchases_email_payment_intent_id_unique" UNIQUE("email","payment_intent_id")
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"description" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"is_paid" boolean DEFAULT false NOT NULL,
	"stripe_customer_id" text,
	"stripe_payment_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "waitlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"source" varchar(50) DEFAULT 'landing' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "welcome_content" (
	"id" text PRIMARY KEY DEFAULT 'welcome' NOT NULL,
	"title" text DEFAULT 'A letter from Daniele' NOT NULL,
	"content" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules" ADD CONSTRAINT "modules_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress" ADD CONSTRAINT "progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_applied_to_user_id_users_id_fk" FOREIGN KEY ("applied_to_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;