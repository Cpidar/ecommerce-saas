import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260619102518 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "store_config" drop constraint if exists "store_config_subscription_product_id_unique";`);
    this.addSql(`alter table if exists "store_config" drop constraint if exists "store_config_handle_unique";`);
    this.addSql(`create table if not exists "store_config" ("id" text not null, "medusa_store_id" text not null, "title" text not null, "handle" text not null, "domain" text not null, "description" text not null default '', "logo_url" text null, "logo_alt" text null, "favicon_url" text null, "homepage_layout" jsonb not null default '{}', "about_page_layout" jsonb not null default '{}', "seo_config" jsonb not null default '{}', "marketing_config" jsonb not null default '{}', "config" jsonb not null default '{}', "subscription_product_id" text null, "subscription_status" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "store_config_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_store_config_handle_unique" ON "store_config" ("handle") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_store_config_subscription_product_id_unique" ON "store_config" ("subscription_product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_store_config_deleted_at" ON "store_config" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "shipping_method_config" ("id" text not null, "name" text not null, "provider_id" text not null, "medusa_shipping_option_id" text null, "provider_shipping_method_id" text null, "is_default" boolean not null default false, "is_enabled" boolean not null default true, "config" jsonb not null default '{}', "store_config_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "shipping_method_config_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_shipping_method_config_store_config_id" ON "shipping_method_config" ("store_config_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_shipping_method_config_deleted_at" ON "shipping_method_config" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "payment_config" ("id" text not null, "name" text not null, "provider_id" text not null, "is_default" boolean not null default false, "is_enabled" boolean not null default true, "config" jsonb not null default '{}', "store_config_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "payment_config_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_payment_config_store_config_id" ON "payment_config" ("store_config_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_payment_config_deleted_at" ON "payment_config" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "shipping_method_config" add constraint "shipping_method_config_store_config_id_foreign" foreign key ("store_config_id") references "store_config" ("id") on update cascade;`);

    this.addSql(`alter table if exists "payment_config" add constraint "payment_config_store_config_id_foreign" foreign key ("store_config_id") references "store_config" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "shipping_method_config" drop constraint if exists "shipping_method_config_store_config_id_foreign";`);

    this.addSql(`alter table if exists "payment_config" drop constraint if exists "payment_config_store_config_id_foreign";`);

    this.addSql(`drop table if exists "store_config" cascade;`);

    this.addSql(`drop table if exists "shipping_method_config" cascade;`);

    this.addSql(`drop table if exists "payment_config" cascade;`);
  }

}
