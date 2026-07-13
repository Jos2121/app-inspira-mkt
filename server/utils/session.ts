import { db } from './db';
import { appRoles } from '../db/schema';
import { eq } from 'drizzle-orm';

export type Session = {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    role?: string;
  };
} | null;

export async function getSessionFromCookie(cookieHeader: string | null): Promise<Session> {
  if (!cookieHeader) return null;
  
  const cookie = cookieHeader
    .replaceAll('__Secure_', '__Secure-')
    .replaceAll('__Host_', '__Host-');
    
  if (!cookie) return null;
  
  try {
    const res = await fetch(`${process.env.NEON_AUTH_BASE_URL}/get-session`, {
      headers: { cookie },
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    if (!data?.user) return null;
    
    const session: Session = data;
    
    // Buscar rol asociado al correo
    const roleRecord = await db.select().from(appRoles).where(eq(appRoles.email, session.user.email)).limit(1);
    if (roleRecord.length > 0) {
      session.user.role = roleRecord[0].role;
    } else {
      session.user.role = 'ADMIN';
    }
    
    return session;
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
}