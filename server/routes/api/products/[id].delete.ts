import { defineHandler } from 'nitro';
import { db } from '../../../utils/db';
import { products } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { createError, getRouterParam } from 'nitro/h3';

export default defineHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID required' });

  if (event.context.userRole !== 'Admin') {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  await db.delete(products).where(eq(products.id, id));
  return { success: true };
});
