import { NextResponse } from 'next/server';
import { success } from '@/lib/api/types';
import { withErrorHandling } from '@/lib/api/middleware';
import { db } from '@/lib/db/connection';
import { sql } from 'drizzle-orm';

async function healthHandler() {
  // Test database connection
  let dbStatus = 'disconnected';
  try {
    await db.run(sql`SELECT 1 as healthy`);
    dbStatus = 'connected';
  } catch (error) {
    // Database is disconnected, but don't throw - this is a health check
    console.error('Health check database error:', error);
  }
  
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    version: '1.0.0'
  };

  return NextResponse.json(success(health));
}

export const GET = withErrorHandling(healthHandler);