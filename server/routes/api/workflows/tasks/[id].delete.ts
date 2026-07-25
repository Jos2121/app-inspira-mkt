import { defineHandler } from 'nitro';
import { createError, getRouterParam } from 'nitro/h3';
import { db } from '../../../utils/db';
import { workflowTasks } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID requerido' });

  await db.delete(workflowTasks).where(eq(workflowTasks.id, id));
  return { success: true };
});