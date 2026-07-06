import { defineHandler } from 'nitro';
import { db } from '../../utils/db';
import { orders, orderItems, clients } from '../../db/schema';
import { desc, eq } from 'drizzle-orm';

export default defineHandler(async (event) => {
  const result = await db.select({
    order: orders,
    client: {
      id: clients.id,
      name: clients.name
    }
  })
  .from(orders)
  .innerJoin(clients, eq(orders.clientId, clients.id))
  .orderBy(desc(orders.createdAt));

  return result.map(r => ({
    ...r.order,
    client: r.client
  }));
});
