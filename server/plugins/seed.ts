import { defineNitroPlugin } from 'nitro/runtime/plugin';
import { db } from '../utils/db';
import { appRoles } from '../db/schema';

export default defineNitroPlugin(async () => {
  console.log('[Seed] Verificando roles de prueba en base de datos...');
  try {
    const rolesToSeed = [
      { whatsapp: '+51999000001', role: 'SUPERADMIN' as const },
      { whatsapp: '+51999000002', role: 'ADMIN' as const },
      { whatsapp: '+51999000003', role: 'EMPLEADO' as const }
    ];

    for (const r of rolesToSeed) {
      await db.insert(appRoles).values(r)
        .onConflictDoUpdate({ target: appRoles.whatsapp, set: { role: r.role } });
    }
    console.log('[Seed] Roles insertados correctamente.');
  } catch (e) {
    console.error('[Seed] Error al insertar roles:', e);
  }
});