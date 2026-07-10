import { defineHandler } from 'nitro';
import { readBody, createError, getRouterParam } from 'nitro/h3';
import { sql } from '../../../utils/db';

export default defineHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID required' });

  const body = await readBody(event);
  
  if (!body.name || !body.price || !body.benefits) {
    throw createError({ statusCode: 400, message: 'Faltan datos requeridos' });
  }

  try {
    const updated = await sql`
      UPDATE agency_plans 
      SET name = ${body.name}, 
          price = ${body.price}, 
          benefits = ${body.benefits}
      WHERE id = ${id}
      RETURNING *
    `;

    if (updated.length === 0) {
      throw createError({ statusCode: 404, message: 'Plan no encontrado' });
    }

    return updated[0];
  } catch (error) {
    console.error('Error updating agency plan:', error);
    throw createError({ statusCode: 500, message: 'Error interno del servidor al actualizar el plan' });
  }
});