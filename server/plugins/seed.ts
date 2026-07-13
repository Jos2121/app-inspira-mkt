import { db } from '../utils/db';
import { appRoles } from '../db/schema';

export default async function() {
  console.log('[Seed] Verificando roles de prueba en base de datos...');
  try {
    const rolesToSeed = [
      { email: 'prueba01@gmail.com', role: 'SUPERADMIN' as const },
      { email: 'prueba02@gmail.com', role: 'ADMIN' as const },
      { email: 'prueba03@gmail.com', role: 'EMPLEADO' as const }
    ];

    for (const r of rolesToSeed) {
      await db.insert(appRoles).values(r)
        .onConflictDoUpdate({ target: appRoles.email, set: { role: r.role } });
    }
    console.log('[Seed] Roles insertados correctamente.');
  } catch (e) {
    console.error('[Seed] Error al insertar roles:', e);
  }
}