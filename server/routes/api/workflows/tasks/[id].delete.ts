import { defineHandler } from 'nitro';
import { db } from '../../../../utils/db';
import { workflowTasks } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { createError, getRouterParam } from 'nitro/h3';

export default defineHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID required' });

  try {
    await db.delete(workflowTasks).where(eq(workflowTasks.id, id));
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar tarea de flujo:', error);
    throw createError({ statusCode: 500, message: 'Error interno al eliminar la tarea' });
  }
});