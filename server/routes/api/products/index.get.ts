import { defineHandler } from 'nitro';
import { db } from '../../../utils/db';
import { products } from '../../../db/schema';
import { desc } from 'drizzle-orm';

export default defineHandler(async (event) => {
  return await db.select().from(products).orderBy(desc(products.createdAt));
});
