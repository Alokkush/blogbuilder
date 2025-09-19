import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Check if we're in a development environment
const isDevelopment = process.env.NODE_ENV === 'development';

// For development, we might want to use mock database
// For production, we should always use the real database
let pool: any;
let db: any;

console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set. Using mock database for development.");
  // We'll create a mock database object for development
  const mockDb = {
    select: () => mockDb,
    from: () => mockDb,
    where: () => mockDb,
    execute: () => Promise.resolve({ rows: [] }),
  };
  
  // Assign the mock database
  pool = { connect: () => {}, release: () => {} };
  db = mockDb;
} else {
  console.log("Using real database connection");
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
}

export { pool, db };