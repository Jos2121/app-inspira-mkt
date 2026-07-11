import { defineHandler } from 'nitro';
import { db } from '../../../utils/db';
import { transactions, dailyLogs, tasks } from '../../../db/schema';
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

  // Obtenemos los datos puros y hacemos los cálculos en memoria
  // Esto elimina CUALQUIER posibilidad de error por sintaxis SQL o casteo de tipos en Neon/Postgres
  
  const monthTransactions = await db
    .select({ amount: transactions.amount, type: transactions.type })
    .from(transactions)
    .where(monthConditionTx);
    
  let incomes = 0;
  let expenses = 0;
  
  monthTransactions.forEach(tx => {
    const amount = Number(tx.amount);
    if (tx.type === 'Ingreso') {
      incomes += amount;
    } else if (tx.type === 'Gasto') {
      expenses += amount;
    }
  });

  const balance = incomes - expenses;

  const monthLogs = await db
    .select({ count: dailyLogs.count })
    .from(dailyLogs)
    .where(monthConditionLogs);

  const totalPatients = monthLogs.reduce((acc, log) => acc + Number(log.count), 0);

  // Filtro de tareas para HOY
  const todayStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  
  const todayTasks = await db
    .select({ status: tasks.status })
    .from(tasks)
    .where(like(tasks.startTime, `${todayStr}%`));

  const todayTasksTotal = todayTasks.length;
  const todayTasksCompleted = todayTasks.filter(t => t.status === 'Completada').length;

  return {
    incomes,
    expenses,
    balance,
    totalPatients,
    todayTasksTotal,
    todayTasksCompleted,
  };
});