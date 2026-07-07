import { defineHandler } from 'nitro';
import { readBody, createError } from 'nitro/h3';
import { db } from '../../../utils/db';
import { partners } from '../../../db/schema';

export default defineHandler(async (event) => {
  const body = await readBody(event);
  if (!body.name || !body.role) throw createError({ statusCode: 400, message: 'Faltan campos' });

  const [newPartner] = await db.insert(partners).values({
    name: body.name,
    role: body.role,
    phone: body.phone,
    status: body.status || 'Activo',
  }).returning();

  return newPartner;
});