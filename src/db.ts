import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

// Debug Check: This will print out in your terminal if your string is being read
if (!process.env.DATABASE_URL) {
  console.error("❌ CRITICAL: DATABASE_URL is missing from process.env!");
}

// 1. Create a PostgreSQL connection pool using Node-PG
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// 2. Instantiate the Prisma Client with the PG adapter
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });