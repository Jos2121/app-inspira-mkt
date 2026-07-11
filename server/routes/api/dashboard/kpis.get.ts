import { defineHandler } from 'nitro';
import { db } from '../../../utils/db';
import { transactions, dailyLogs, tasks, clients, partners, diagnosticRecords } from '../../../db/schema';
import { sql as drizzleSql, eq, and, gte, lt, like } from 'drizzle-orm';

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
  const month = getPart('month'); // 1-12
  const day = getPart('day');

  const startMonthStr = `${year}-${month.toString().padStart(2, '0')}-01`;
  const todayStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  const nextMonthYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextMonthStr = `${nextMonthYear}-${nextMonth.toString().padStart(2, '0')}-01`;

  // Condición de filtro por mes actual (String ISO comparison seguro para SQLite/PG sin zonas complejas)
  const monthConditionTx = and(
    gte(transactions.date, startMonthStr),
    lt(transactions.date, nextMonthStr)
  );

  const monthConditionLogs = and(
    gte(dailyLogs.date, startMonthStr),
    lt(dailyLogs.date, nextMonthStr)
  );

  const [incomeResult] = await db
    .select({ total: drizzleSql<number>`coalesce(sum(${transactions.amount}), 0)` })
    .from(transactions)
    .where(and(monthConditionTx, eq(transactions.type, 'Ingreso')));

  const [expenseResult] = await db
    .select({ total: drizzleSql<number>`coalesce(sum(${transactions.amount}), 0)` })
    .from(transactions)
    .where(and(monthConditionTx, eq(transactions.type, 'Gasto')));

  const [patientsResult] = await db
    .select({ total: drizzleSql<number>`coalesce(sum(${dailyLogs.count}), 0)` })
    .from(dailyLogs)
    .where(monthConditionLogs);

  // Nuevas métricas
  const [tasksResult] = await db
    .select({ count: drizzleSql<number>`count(*)` })
    .from(tasks)
    .where(like(tasks.startTime, `${todayStr}%`));

  const [clientsResult] = await db
    .select({ count: drizzleSql<number>`count(*)` })
    .from(clients);

  const [partnersResult] = await db
    .select({ count: drizzleSql<number>`count(*)` })
    .from(partners)
    .where(eq(partners.status, 'Activo'));

  const [diagnosticsResult] = await db
    .select({ count: drizzleSql<number>`count(*)` })
    .from(diagnosticRecords);

  const incomes = Number(incomeResult.total);
  const expenses = Number(expenseResult.total);
  const balance = incomes - expenses;
  const totalPatients = Number(patientsResult.total);

  return {
    incomes,
    expenses,
    balance,
    totalPatients,
    todayTasks: Number(tasksResult.count),
    totalClients: Number(clientsResult.count),
    activePartners: Number(partnersResult.count),
    totalDiagnostics: Number(diagnosticsResult.count),
  };
});