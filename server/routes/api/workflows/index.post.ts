import { defineHandler } from 'nitro';
import { readBody, createError } from 'nitro/h3';
import { db } from '../../../utils/db';
import { workflows, workflowColumns } from '../../../db/schema';

export default defineHandler(async (event) => {
  const body = await readBody(event);
  if (!body.name) {
    throw createError({ statusCode: 400, message: 'El nombre es obligatorio' });
  }

  // 1. Crear el flujo
  const [newWorkflow] = await db.insert(workflows).values({
    name: body.name,
  }).returning();

  // 2. Crear columnas base por defecto para acelerar el inicio
  const defaultColumns = ['Por Asignar', 'Staff / Operativo', 'Recepción', 'Administración'];
  
  const columnsToInsert = defaultColumns.map((title, index) => ({
    workflowId: newWorkflow.id,
    title,
    orderIndex: index
  }));

  await db.insert(workflowColumns).values(columnsToInsert);

  return newWorkflow;
});