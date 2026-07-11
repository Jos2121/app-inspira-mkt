import { defineHandler } from 'nitro';
import { createError, getRequestHeader, getRequestURL } from 'nitro/h3';
import { getSessionFromCookie } from '../utils/session';

const PUBLIC_PREFIXES = ['/api/auth/', '/auth/'];

export default defineHandler(async (event) => {
  const url = getRequestURL(event);
  const pathname = url.pathname;
  
  if (PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
    return;
  }
  
  if (!pathname.startsWith('/api/')) {
    return;
  }
  
  const cookie = getRequestHeader(event, 'cookie') ?? null;
  const session = await getSessionFromCookie(cookie);
  
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const role = session.user.role || 'EMPLEADO';
  const method = event.method;

  if (method === 'DELETE') {
    if (role !== 'SUPERADMIN' && role !== 'ADMIN') {
      throw createError({ statusCode: 403, statusMessage: `Acceso denegado: El rol '${role}' no tiene permisos para eliminar registros` });
    }
  }
  
  event.context.userId = session.user.id;
  event.context.userRole = role;
  event.context.userWhatsapp = session.user.whatsapp;
});