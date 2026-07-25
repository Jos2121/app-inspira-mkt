import { defineHandler } from 'nitro';
import { readBody, createError } from 'nitro/h3';
import { db } from '../../../../utils/db';
import { workflowTasks } from '../../../../db/schema';

export default defineHandler(async (event) => {
  const body = await readBody(event);
  if (!body.workflowId || !body.content) {
    throw createError({ statusCode: 400, message: 'Faltan campos' });
  }

  try {
    const [newTask] = await db.insert(workflowTasks).values({
      workflowId: body.workflowId,
      partnerId: body.partnerId || null,
      content: body.content,
      orderIndex: body.orderIndex || 0,
    }).returning();

    return newTask;
  } catch (error) {
    console.error('Error al crear tarea de flujo:', error);
    throw createError({ statusCode: 500, message: 'Error interno al crear la tarea' });
  }
});