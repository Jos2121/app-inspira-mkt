import { defineHandler } from 'nitro';
import { readBody, createError } from 'nitro/h3';
import { db } from '../../utils/db';
import { products } from '../../db/schema';

export default defineHandler(async (event) => {
  const body = await readBody(event);
  
  if (!body.name || body.price === undefined) {
    throw createError({ statusCode: 400, message: 'Name and price are required' });
  }

  const [newProduct] = await db.insert(products).values({
    name: body.name,
    description: body.description,
    price: body.price.toString(),
  }).returning();

  return newProduct;
});
