import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260720160644 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "store_config" drop constraint if exists "store_config_subscription_product_id_unique";`);
    this.addSql(`alter table if exists "store_config" drop constraint if exists "store_config_handle_unique";`);
    this.addSql(`create table if not exists "store_config" ("id" text not null, "medusa_store_id" text not null, "title" text not null default '', "handle" text null, "domain" text not null default '', "description" text not null default '', "logo_url" text null, "logo_alt" text null, "favicon_url" text null, "theme" text not null default 'default', "theme_overrides" jsonb not null default '{}', "homepage_layout" jsonb not null default '{}', "about_page_layout" jsonb not null default '{}', "puck_data" jsonb not null default '{}', "seo_config" jsonb not null default '{}', "marketing_config" jsonb not null default '{}', "config" jsonb not null default '{}', "payment_configs" jsonb not null default '{}', "shipping_method_configs" jsonb not null default '{}', "subscription_product_id" text null, "subscription_status" text not null default 'PENDING', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "store_config_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_store_config_handle_unique" ON "store_config" ("handle") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_store_config_subscription_product_id_unique" ON "store_config" ("subscription_product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_store_config_deleted_at" ON "store_config" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "store_config" cascade;`);
  }

}
