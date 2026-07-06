import { defineHandler } from 'nitro';
import { db, sql } from '../../utils/db';
import { orders } from '../../db/schema';
import { sql as drizzleSql, eq, and, gte, lt } from 'drizzle-orm';

export default defineHandler(async (event) => {
  // Check auth and role
  const userId = event.context.userId;
  const userRole = event.context.userRole;
  if (!userId || userRole !== 'Admin') {
    return new Response('Unauthorized', { status: 401 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const monthCondition = and(
    gte(orders.createdAt, startOfMonth),
    lt(orders.createdAt, startOfNextMonth)
  );

  const [revenueResult] = await db
    .select({ total: drizzleSql<number>`coalesce(sum(${orders.total}), 0)` })
    .from(orders)
    .where(and(monthCondition, eq(orders.status, 'Pagado')));

  const [receivablesResult] = await db
    .select({ total: drizzleSql<number>`coalesce(sum(${orders.total}), 0)` })
    .from(orders)
    .where(and(monthCondition, eq(orders.status, 'Pendiente')));

  const [salesCountResult] = await db
    .select({ count: drizzleSql<number>`count(*)` })
    .from(orders)
    .where(monthCondition);

  const count = Number(salesCountResult.count);
  const revenue = Number(revenueResult.total);
  const receivables = Number(receivablesResult.total);
  const avgTicket = count > 0 ? revenue / count : 0;

  return {
    revenue,
    receivables,
    salesCount: count,
    avgTicket: Math.round(avgTicket * 100) / 100,
  };
});
