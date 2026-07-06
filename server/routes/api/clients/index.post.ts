import { defineHandler } from 'nitro';
import { readBody, createError } from 'nitro/h3';
import { db } from '../../../utils/db';
import { clients } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineHandler(async (event) => {
  const body = await readBody(event);
  
  if (!body.name) {
    throw createError({ statusCode: 400, message: 'Name is required' });
  }

  const [newClient] = await db.insert(clients).values({
    name: body.name,
    email: body.email,
    phone: body.phone,
    address: body.address,
  }).returning();

  return newClient;
});
