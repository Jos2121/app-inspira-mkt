import { defineHandler } from 'nitro';
import { readBody, createError } from 'nitro/h3';
import { db } from '../../../utils/db';
import { orders, orderItems } from '../../../db/schema';

export default defineHandler(async (event) => {
  const body = await readBody(event);
  
  if (!body.clientId || !body.items || body.items.length === 0) {
    throw createError({ statusCode: 400, message: 'Client and items are required' });
  }

  const total = body.items.reduce((acc: number, item: any) => acc + (item.quantity * item.unitPrice), 0);

  // Sequential inserts (Neon HTTP does not support interactive transactions)
  const [order] = await db.insert(orders).values({
    clientId: body.clientId,
    total: total.toString(),
    status: 'Pendiente'
  }).returning();

  const itemsToInsert = body.items.map((item: any) => ({
    orderId: order.id,
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.unitPrice.toString(),
    subtotal: (item.quantity * item.unitPrice).toString()
  }));

  await db.insert(orderItems).values(itemsToInsert);

  return order;
});
