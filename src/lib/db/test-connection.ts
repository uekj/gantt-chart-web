import { db } from './connection';
import { sql } from 'drizzle-orm';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection using Drizzle's select syntax
    const result = await db.run(sql`SELECT 1 as test`);
    console.log('✅ Database connection successful:', result);
    
    // Test schema tables exist
    const tables = await db.run(sql`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);
    
    console.log('📋 Available tables:', tables);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();