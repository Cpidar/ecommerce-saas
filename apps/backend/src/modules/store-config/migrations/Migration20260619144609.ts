import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260619144609 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "store_config" add column if not exists "theme" text not null default 'default', add column if not exists "theme_overrides" jsonb not null default '{}';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "store_config" drop column if exists "theme", drop column if exists "theme_overrides";`);
  }

}
