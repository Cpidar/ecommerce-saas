import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260623114617 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "store_config" add column if not exists "puck_data" jsonb not null default '{}';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "store_config" drop column if exists "puck_data";`);
  }

}
