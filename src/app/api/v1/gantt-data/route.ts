import { NextResponse } from 'next/server';
import { success } from '@/lib/api/types';
import { withErrorHandling } from '@/lib/api/middleware';
import { getGanttData } from '@/lib/db/queries/combined';

async function ganttDataHandler() {
  const data = await getGanttData();
  
  return NextResponse.json(success(data));
}

export const GET = withErrorHandling(ganttDataHandler);