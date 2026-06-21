import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260619140331 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "store_config" alter column "subscription_status" type text using ("subscription_status"::text);`);
    this.addSql(`alter table if exists "store_config" alter column "subscription_status" set default 'PENDING';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "store_config" alter column "subscription_status" drop default;`);
    this.addSql(`alter table if exists "store_config" alter column "subscription_status" type text using ("subscription_status"::text);`);
  }

}
