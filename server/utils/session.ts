import { db } from './db';
import { appRoles } from '../db/schema';
import { eq } from 'drizzle-orm';

export type Session = {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    role?: string; // We will augment this with appRoles
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
    
    // Fetch user role from our DB
    const roleRecord = await db.select().from(appRoles).where(eq(appRoles.email, session!.user.email)).limit(1);
    if (roleRecord.length > 0) {
      session!.user.role = roleRecord[0].role;
    } else {
      // Default to Operador if not found
      session!.user.role = 'Operador';
    }
    
    return session;
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
}
