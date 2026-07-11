import { defineHandler } from 'nitro';
import { createError } from 'nitro/h3';
import { db } from '../../../utils/db';
import { transactions, dailyLogs, tasks, clients, partners, diagnosticRecords } from '../../../db/schema';
import { eq, and, gte, lt, like, sql } from 'drizzle-orm';

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

    // Ejecutamos TODAS las consultas a la base de datos al mismo tiempo para máxima velocidad y evitar cuelgues
    const [
      incomeRows,
      expenseRows,
      patientsRows,
      tasksRows,
      clientsRows,
      partnersRows,
      diagnosticsRows
    ] = await Promise.all([
      db.select({ total: sql<number>`coalesce(sum(${transactions.amount}), 0)` })
        .from(transactions)
        .where(and(monthConditionTx, eq(transactions.type, 'Ingreso'))),
        
      db.select({ total: sql<number>`coalesce(sum(${transactions.amount}), 0)` })
        .from(transactions)
        .where(and(monthConditionTx, eq(transactions.type, 'Gasto'))),
        
      db.select({ total: sql<number>`coalesce(sum(${dailyLogs.count}), 0)` })
        .from(dailyLogs)
        .where(monthConditionLogs),
        
      db.select({ value: sql<number>`count(*)` })
        .from(tasks)
        .where(like(tasks.startTime, `${todayStr}%`)),
        
      db.select({ value: sql<number>`count(*)` })
        .from(clients),
        
      db.select({ value: sql<number>`count(*)` })
        .from(partners)
        .where(eq(partners.status, 'Activo')),
        
      db.select({ value: sql<number>`count(*)` })
        .from(diagnosticRecords)
    ]);

    const incomes = Number(incomeRows[0]?.total || 0);
    const expenses = Number(expenseRows[0]?.total || 0);
    const balance = incomes - expenses;

    return {
      incomes,
      expenses,
      balance,
      totalPatients: Number(patientsRows[0]?.total || 0),
      todayTasks: Number(tasksRows[0]?.value || 0),
      totalClients: Number(clientsRows[0]?.value || 0),
      activePartners: Number(partnersRows[0]?.value || 0),
      totalDiagnostics: Number(diagnosticsRows[0]?.value || 0),
    };

  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    throw createError({ 
      statusCode: 500, 
      message: error.message || 'Error interno calculando KPIs'
    });
  }
});