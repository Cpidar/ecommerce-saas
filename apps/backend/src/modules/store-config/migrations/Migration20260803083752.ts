import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260803083752 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "store_config" add column if not exists "tagline" text null default '';`);
    this.addSql(`alter table if exists "store_config" alter column "domain" type text using ("domain"::text);`);
    this.addSql(`alter table if exists "store_config" alter column "domain" drop not null;`);
    this.addSql(`alter table if exists "store_config" alter column "description" type text using ("description"::text);`);
    this.addSql(`alter table if exists "store_config" alter column "description" drop not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "store_config" drop column if exists "tagline";`);

    this.addSql(`alter table if exists "store_config" alter column "domain" type text using ("domain"::text);`);
    this.addSql(`alter table if exists "store_config" alter column "domain" set not null;`);
    this.addSql(`alter table if exists "store_config" alter column "description" type text using ("description"::text);`);
    this.addSql(`alter table if exists "store_config" alter column "description" set not null;`);
  }

}
