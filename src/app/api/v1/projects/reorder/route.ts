import { NextRequest, NextResponse } from 'next/server';
import { success } from '@/lib/api/types';
import { withErrorHandling, getValidatedBody } from '@/lib/api/middleware';
import { reorderProjectsSchema } from '@/lib/api/schemas';
import { reorderProjects } from '@/lib/db/queries/projects';

// PUT /api/v1/projects/reorder
async function reorderProjectsHandler(request: NextRequest) {
  const body = await getValidatedBody(request, reorderProjectsSchema);
  
  const updatedProjects = await reorderProjects(body.projectIds);
  
  return NextResponse.json(success({
    success: true,
    updatedProjects
  }));
}

export const PUT = withErrorHandling(reorderProjectsHandler);