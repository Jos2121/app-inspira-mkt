import { defineHandler } from 'nitro';
import { db } from '../../../utils/db';
import { orders } from '../../../db/schema';
import { sql as drizzleSql, eq, and, gte, lt } from 'drizzle-orm';

export default defineHandler(async (event) => {
  const userId = event.context.userId;
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Usar Intl.DateTimeFormat para extraer de forma segura el año y mes en la hora de Lima
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Lima',
    year: 'numeric', month: 'numeric', day: 'numeric',
  });
  
  const parts = formatter.formatToParts(now);
  const getPart = (type: string) => parseInt(parts.find(p => p.type === type)!.value, 10);
  
  const year = getPart('year');
  const month = getPart('month') - 1; // 0-indexado

  // Lima es UTC-5, construimos el Date en UTC basándonos en medianoche local (+5 horas a la medianoche UTC)
  const startOfMonth = new Date(Date.UTC(year, month, 1, 5, 0, 0));
  
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const startOfNextMonth = new Date(Date.UTC(nextYear, nextMonth, 1, 5, 0, 0));

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