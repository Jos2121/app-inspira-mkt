import { defineHandler } from 'nitro';
import { readBody, createError } from 'nitro/h3';
import { db } from '../../../../utils/db';
import { workflowTasks } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineHandler(async (event) => {
  const body = await readBody<{ items: { id: string; columnId: string; orderIndex: number }[] }>(event);
  
  if (!body.items || !Array.isArray(body.items)) {
    throw createError({ statusCode: 400, message: 'Estructura inválida' });
  }

  // Actualizamos el orden y columna de cada tarjeta afectada (Batch Update MVP)
  for (const item of body.items) {
    await db.update(workflowTasks)
      .set({ columnId: item.columnId, orderIndex: item.orderIndex })
      .where(eq(workflowTasks.id, item.id));
  }

  return { success: true };
});