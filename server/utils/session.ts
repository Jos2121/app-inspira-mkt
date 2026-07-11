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
    whatsapp?: string;
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
    
    // Extraer WhatsApp del correo falso utilizado para autenticar (ej. +51999000001@inspira.local)
    const whatsapp = session.user.email.split('@')[0];
    session.user.whatsapp = whatsapp;
    
    const roleRecord = await db.select().from(appRoles).where(eq(appRoles.whatsapp, whatsapp)).limit(1);
    if (roleRecord.length > 0) {
      session.user.role = roleRecord[0].role;
    } else {
      session.user.role = 'EMPLEADO';
    }
    
    return session;
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
}