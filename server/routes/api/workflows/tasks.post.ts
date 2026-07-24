import { defineHandler } from 'nitro';
import { readBody, createError } from 'nitro/h3';
import { db } from '../../../utils/db';
import { workflowTasks } from '../../../db/schema';

export default defineHandler(async (event) => {
  const body = await readBody(event);
  if (!body.columnId || !body.content) {
    throw createError({ statusCode: 400, message: 'Faltan campos' });
  }

  const [newTask] = await db.insert(workflowTasks).values({
    columnId: body.columnId,
    content: body.content,
    orderIndex: body.orderIndex || 0,
  }).returning();

  return newTask;
});