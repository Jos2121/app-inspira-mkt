import { defineHandler } from 'nitro';
import { readBody, createError } from 'nitro/h3';
import { db } from '../../../utils/db';
import { partners } from '../../../db/schema';

export default defineHandler(async (event) => {
  const body = await readBody(event);
  if (!body.name || !body.role) throw createError({ statusCode: 400, message: 'Faltan campos obligatorios' });

  // Si envían correo y contraseña (modo creación), creamos el usuario en Neon Auth 
  // mediante una petición de servidor a servidor para NO cerrar la sesión actual del Superadmin.
  if (body.email && body.password) {
    try {
      const authRes = await fetch(`${process.env.NEON_AUTH_BASE_URL}/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: body.email,
          password: body.password,
          name: body.name
        })
      });
      
      if (!authRes.ok) {
        const errorData = await authRes.json().catch(() => ({}));
        throw createError({ 
          statusCode: 400, 
          message: errorData.message || 'Error creando la cuenta de acceso. Es posible que el correo ya exista.' 
        });
      }
    } catch (e: any) {
      throw createError({ 
        statusCode: 400, 
        message: e.message || 'Error de conexión con el sistema de autenticación.' 
      });
    }
  }

  const [newPartner] = await db.insert(partners).values({
    name: body.name,
    role: body.role,
    phone: body.phone,
    email: body.email,
    status: body.status || 'Activo',
    systemRole: body.systemRole || 'ADMIN',
    accessibleTabs: body.accessibleTabs || [],
  }).returning();

  return newPartner;
});