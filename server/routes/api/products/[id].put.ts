import { defineHandler } from 'nitro';
import { readBody, createError, getRouterParam } from 'nitro/h3';
import { db } from '../../../utils/db';
import { products } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID required' });

  // Solo Admin puede editar (manteniendo la misma regla que para eliminar)
  if (event.context.userRole !== 'Admin') {
    throw createError({ statusCode: 403, message: 'Forbidden' });
  }

  const body = await readBody(event);
  
  if (!body.name || body.price === undefined) {
    throw createError({ statusCode: 400, message: 'Name and price are required' });
  }

  const [updatedProduct] = await db.update(products).set({
    name: body.name,
    description: body.description,
    price: body.price.toString(),
  }).where(eq(products.id, id)).returning();

  return updatedProduct;
});