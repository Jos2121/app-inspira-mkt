import { defineHandler } from 'nitro';
import { readBody, createError, getRouterParam } from 'nitro/h3';
import { db } from '../../../utils/db';
import { plans } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID required' });

  const body = await readBody(event);
  if (!body.name || !body.activities || !Array.isArray(body.activities)) {
    throw createError({ statusCode: 400, message: 'Datos de plan inválidos' });
  }

  const [updated] = await db.update(plans).set({
    name: body.name,
    activities: body.activities,
  }).where(eq(plans.id, id)).returning();

  if (!updated) {
    throw createError({ statusCode: 404, message: 'Plan no encontrado' });
  }

  return updated;
});