import { NextRequest, NextResponse } from 'next/server';
import { success } from '@/lib/api/types';
import { withErrorHandling } from '@/lib/api/middleware';
import { db } from '@/lib/db/connection';
import { sql } from 'drizzle-orm';

async function healthHandler(request: NextRequest) {
  // Test database connection
  const dbTest = await db.run(sql`SELECT 1 as healthy`);
  
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbTest ? 'connected' : 'disconnected',
    version: '1.0.0'
  };

  return NextResponse.json(success(health));
}

export const GET = withErrorHandling(healthHandler);