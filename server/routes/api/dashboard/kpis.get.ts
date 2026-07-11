import { defineHandler } from 'nitro';
import { createError } from 'nitro/h3';
import { db } from '../../../utils/db';
import { transactions, dailyLogs, tasks, clients, partners, diagnosticRecords } from '../../../db/schema';
import { eq, and, gte, lt, like, sum, count } from 'drizzle-orm';

export default defineHandler(async (event) => {
  const userId = event.context.userId;
  if (!userId) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Lima',
      year: 'numeric', month: 'numeric', day: 'numeric',
    });
    
    const parts = formatter.formatToParts(now);
    const getPart = (type: string) => parseInt(parts.find(p => p.type === type)!.value, 10);
    
    const year = getPart('year');
    const month = getPart('month');
    const day = getPart('day');

    const startMonthStr = `${year}-${month.toString().padStart(2, '0')}-01`;
    const todayStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const nextMonthYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextMonthStr = `${nextMonthYear}-${nextMonth.toString().padStart(2, '0')}-01`;

    const monthConditionTx = and(
      gte(transactions.date, startMonthStr),
      lt(transactions.date, nextMonthStr)
    );

    const monthConditionLogs = and(
      gte(dailyLogs.date, startMonthStr),
      lt(dailyLogs.date, nextMonthStr)
    );

    // Sumas
    const [incomeResult] = await db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(and(monthConditionTx, eq(transactions.type, 'Ingreso')));

    const [expenseResult] = await db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(and(monthConditionTx, eq(transactions.type, 'Gasto')));

    const [patientsResult] = await db
      .select({ total: sum(dailyLogs.count) })
      .from(dailyLogs)
      .where(monthConditionLogs);

    // Conteos
    const [tasksResult] = await db
      .select({ value: count() })
      .from(tasks)
      .where(like(tasks.startTime, `${todayStr}%`));

    const [clientsResult] = await db
      .select({ value: count() })
      .from(clients);

    const [partnersResult] = await db
      .select({ value: count() })
      .from(partners)
      .where(eq(partners.status, 'Activo'));

    const [diagnosticsResult] = await db
      .select({ value: count() })
      .from(diagnosticRecords);

    const incomes = Number(incomeResult?.total || 0);
    const expenses = Number(expenseResult?.total || 0);
    const balance = incomes - expenses;

    return {
      incomes,
      expenses,
      balance,
      totalPatients: Number(patientsResult?.total || 0),
      todayTasks: Number(tasksResult?.value || 0),
      totalClients: Number(clientsResult?.value || 0),
      activePartners: Number(partnersResult?.value || 0),
      totalDiagnostics: Number(diagnosticsResult?.value || 0),
    };
  } catch (error: any) {
    console.error("Error en KPIs:", error);
    // Devuelve ceros si algo falla para no romper la pantalla, además del error
    return {
      incomes: 0,
      expenses: 0,
      balance: 0,
      totalPatients: 0,
      todayTasks: 0,
      totalClients: 0,
      activePartners: 0,
      totalDiagnostics: 0,
      error: error.message
    };
  }
});