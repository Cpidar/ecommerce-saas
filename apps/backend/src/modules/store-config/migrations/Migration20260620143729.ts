import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260620143729 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`drop table if exists "shipping_method_config" cascade;`);

    this.addSql(`drop table if exists "payment_config" cascade;`);

    this.addSql(`alter table if exists "store_config" add column if not exists "payment_configs" jsonb not null default '{"pp_system_default":{"name":"پرداخت حضوری","is_enabled":true,"config":{}}}', add column if not exists "shipping_method_configs" jsonb not null default '{}';`);
  }

  override async down(): Promise<void> {
    this.addSql(`create table if not exists "shipping_method_config" ("id" text not null, "name" text not null, "provider_id" text not null, "medusa_shipping_option_id" text null, "provider_shipping_method_id" text null, "is_default" boolean not null default false, "is_enabled" boolean not null default true, "config" jsonb not null default '{}', "store_config_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "shipping_method_config_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_shipping_method_config_store_config_id" ON "shipping_method_config" ("store_config_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_shipping_method_config_deleted_at" ON "shipping_method_config" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "payment_config" ("id" text not null, "name" text not null, "provider_id" text not null, "is_default" boolean not null default false, "is_enabled" boolean not null default true, "config" jsonb not null default '{}', "store_config_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "payment_config_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_payment_config_store_config_id" ON "payment_config" ("store_config_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_payment_config_deleted_at" ON "payment_config" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "shipping_method_config" add constraint "shipping_method_config_store_config_id_foreign" foreign key ("store_config_id") references "store_config" ("id") on update cascade;`);

    this.addSql(`alter table if exists "payment_config" add constraint "payment_config_store_config_id_foreign" foreign key ("store_config_id") references "store_config" ("id") on update cascade;`);

    this.addSql(`alter table if exists "store_config" drop column if exists "payment_configs", drop column if exists "shipping_method_configs";`);
  }

}
