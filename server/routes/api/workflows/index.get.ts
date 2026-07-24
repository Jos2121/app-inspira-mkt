import { defineHandler } from 'nitro';
import { db } from '../../../utils/db';
import { workflows, workflowColumns, workflowTasks } from '../../../db/schema';
import { desc, asc } from 'drizzle-orm';

export default defineHandler(async () => {
  return await db.query.workflows.findMany({
    with: {
      columns: {
        orderBy: [asc(workflowColumns.orderIndex)],
        with: {
          tasks: {
            orderBy: [asc(workflowTasks.orderIndex)]
          }
        }
      }
    },
    orderBy: [desc(workflows.createdAt)]
  });
});