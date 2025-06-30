import { NextRequest, NextResponse } from 'next/server';
import { success, error, ERROR_CODES } from '@/lib/api/types';
import { withErrorHandling, getValidatedBody, getValidatedParams } from '@/lib/api/middleware';
import { reorderTasksSchema, projectParamsSchema } from '@/lib/api/schemas';
import { reorderTasks } from '@/lib/db/queries/tasks';
import { projectExists } from '@/lib/db/queries/projects';

// PUT /api/v1/projects/:id/tasks/reorder
async function reorderTasksHandler(request: NextRequest, { params }: { params: Record<string, string | string[]> }) {
  const { id: projectId } = getValidatedParams(projectParamsSchema, params);
  const body = await getValidatedBody(request, reorderTasksSchema);
  
  // Check if project exists
  if (!(await projectExists(projectId))) {
    return NextResponse.json(
      error(ERROR_CODES.NOT_FOUND, 'Project not found'),
      { status: 404 }
    );
  }
  
  const updatedTasks = await reorderTasks(projectId, body.taskIds);
  
  return NextResponse.json(success({
    success: true,
    updatedTasks
  }));
}

export const PUT = withErrorHandling(reorderTasksHandler);