import type { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';

export default async function sendOrderConfirmationHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const notificationModuleService = container.resolve(Modules.NOTIFICATION);

  const {
    data: [order],
  } = await query.graph({
    entity: 'order',
    fields: [
      'id',
      'currency_code',
      'total',
      'subtotal',
      'tax_total',
      'discount_total',
      'discount_tax_total',
      'original_total',
      'original_tax_total',
      'item_total',
      'item_subtotal',
      'item_tax_total',
      'original_item_total',
      'original_item_subtotal',
      'original_item_tax_total',
      'shipping_total',
      'shipping_subtotal',
      'shipping_tax_total',
      'original_shipping_tax_total',
      'original_shipping_subtotal',
      'original_shipping_total',
      'email',
      'shipping_address.*',
      'billing_address.*',
      'customer_id',
      'items.*',
      'items.subtotal',
      'items.tax_total',
      'items.total',
      'items.original_subtotal',
      'items.original_tax_total',
      'items.original_total',
      'items.discount_total',
      'items.discount_tax_total',
      'summary.*',
    ],
    filters: { id: data.id },
  });

  const {
    data: [customer],
  } = await query.graph({
    entity: 'customer',
    fields: ['id', 'email', 'first_name', 'last_name'],
    filters: { id: order.customer_id! },
  });

  await notificationModuleService.createNotifications({
    to: order.email as string,
    channel: 'email',
    template: 'order-placed',
    data: { order, customer },
  });
}

// export const config: SubscriberConfig = {
//   event: 'order.placed',
// };
