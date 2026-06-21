import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260620161538 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "store_config" alter column "payment_configs" type jsonb using ("payment_configs"::jsonb);`);
    this.addSql(`alter table if exists "store_config" alter column "payment_configs" set default '{}';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "store_config" alter column "payment_configs" type jsonb using ("payment_configs"::jsonb);`);
    this.addSql(`alter table if exists "store_config" alter column "payment_configs" set default '{"pp_system_default":{"name":"پرداخت حضوری","is_enabled":true,"config":{}}}';`);
  }

}
