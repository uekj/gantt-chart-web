import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { config } from 'dotenv';
import * as schema from './schema';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Database configuration
const isDevelopment = process.env.NODE_ENV === 'development';

// Validate production environment variables
if (!isDevelopment) {
  if (!process.env.TURSO_DATABASE_URL) {
    throw new Error(
      'TURSO_DATABASE_URL environment variable is required for production. ' +
      'Please set this variable in your deployment environment.'
    );
  }
  if (!process.env.TURSO_AUTH_TOKEN) {
    throw new Error(
      'TURSO_AUTH_TOKEN environment variable is required for production. ' +
      'Please set this variable in your deployment environment.'
    );
  }
}

// Create libSQL client
const client = createClient({
  url: isDevelopment 
    ? 'file:./local.db' // Local SQLite for development
    : process.env.TURSO_DATABASE_URL, // Turso for production (validated above)
  authToken: isDevelopment 
    ? undefined 
    : process.env.TURSO_AUTH_TOKEN // Validated above
});

// Create Drizzle instance
export const db = drizzle(client, { schema });

// Export client for direct access if needed
export { client };

// Type exports
export type Database = typeof db;