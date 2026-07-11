import { defineHandler } from 'nitro';
import { db } from '../../../utils/db';
import { transactions, dailyLogs, tasks, clients, partners, diagnosticRecords } from '../../../db/schema';
import { and, gte, lt, like, eq } from 'drizzle-orm';
import { createError } from 'nitro/h3';

export default defineHandler(async (event) => {
  // 1. Verificación de Autenticación
  if (!event.context.userId) {
    throw createError({ statusCode: 401, message: 'No autorizado' });
  }

  try {
    // 2. Configuración de Fechas (Zona horaria de Lima)
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

    // 3. Ejecución Concurrente Segura (sin métodos .query que dependan de relaciones)
    const [
      allTx,
      allLogs,
      todayTasksData,
      allClients,
      activePartnersData,
      allDiagnostics
    ] = await Promise.all([
      db.select().from(transactions).where(and(gte(transactions.date, startMonthStr), lt(transactions.date, nextMonthStr))),
      db.select().from(dailyLogs).where(and(gte(dailyLogs.date, startMonthStr), lt(dailyLogs.date, nextMonthStr))),
      db.select().from(tasks).where(like(tasks.startTime, `${todayStr}%`)),
      db.select({ id: clients.id }).from(clients),
      db.select({ id: partners.id }).from(partners).where(eq(partners.status, 'Activo')),
      db.select({ id: diagnosticRecords.id }).from(diagnosticRecords)
    ]);

    // 4. Cálculos Matemáticos en JS (Seguros)
    const incomes = allTx.filter(t => t.type === 'Ingreso').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const expenses = allTx.filter(t => t.type === 'Gasto').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const balance = incomes - expenses;
    const totalPatients = allLogs.reduce((sum, l) => sum + Number(l.count || 0), 0);

    // 5. Retorno de JSON Válido
    return {
      incomes,
      expenses,
      balance,
      totalPatients,
      todayTasks: todayTasksData.length,
      totalClients: allClients.length,
      activePartners: activePartnersData.length,
      totalDiagnostics: allDiagnostics.length,
    };

  } catch (error: any) {
    // 6. Manejo de Errores Críticos (Devuelve 500 para que el Frontend lo capture)
    console.error("Error crítico en Dashboard KPIs:", error);
    throw createError({ 
      statusCode: 500, 
      message: error.message || 'Fallo interno al procesar los KPIs de la base de datos'
    });
  }
});