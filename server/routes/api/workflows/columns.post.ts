import { defineHandler } from 'nitro';
import { readBody, createError } from 'nitro/h3';
import { db } from '../../../utils/db';
import { workflowColumns } from '../../../db/schema';

export default defineHandler(async (event) => {
  const body = await readBody(event);
  if (!body.workflowId || !body.title) {
    throw createError({ statusCode: 400, message: 'Faltan campos' });
  }

  const [newColumn] = await db.insert(workflowColumns).values({
    workflowId: body.workflowId,
    title: body.title,
    orderIndex: body.orderIndex || 0,
  }).returning();

  return newColumn;
});