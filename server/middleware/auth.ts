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

  const role = session.user.role;

  // 1. Block any unknown/unauthorized users from accessing ANY API
  if (role === 'Guest' || !role) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Account pending admin approval' });
  }

  // 2. Enforce Roles for critical operations
  const method = event.method;
  if (method === 'DELETE') {
    // Only Admin can perform DELETE operations
    if (role !== 'Admin') {
      throw createError({ statusCode: 403, statusMessage: `Forbidden: Role '${role}' cannot perform DELETE operations` });
    }
  }
  
  event.context.userId = session.user.id;
  event.context.userRole = role;
});
