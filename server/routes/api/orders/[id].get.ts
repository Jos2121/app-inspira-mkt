import { defineHandler } from 'nitro';
import { db } from '../../../utils/db';
import { orders, orderItems, products, clients } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { createError, getRouterParam } from 'nitro/h3';

export default defineHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID required' });

  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) throw createError({ statusCode: 404, message: 'Not found' });

  const [client] = await db.select().from(clients).where(eq(clients.id, order.clientId));

  const items = await db.select({
    item: orderItems,
    product: products
  })
  .from(orderItems)
  .innerJoin(products, eq(orderItems.productId, products.id))
  .where(eq(orderItems.orderId, id));

  return {
    ...order,
    client,
    items: items.map(i => ({ ...i.item, product: i.product }))
  };
});
