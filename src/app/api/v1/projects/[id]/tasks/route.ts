import { NextRequest, NextResponse } from 'next/server';
import { success, error, ERROR_CODES } from '@/lib/api/types';
import { withErrorHandling, getValidatedBody, getValidatedParams } from '@/lib/api/middleware';
import { createTaskSchema, projectParamsSchema } from '@/lib/api/schemas';
import { getTasksByProject, createTask } from '@/lib/db/queries/tasks';
import { projectExists } from '@/lib/db/queries/projects';

// GET /api/v1/projects/:id/tasks
async function getTasksHandler(request: NextRequest, { params }: { params: any }) {
  const { id } = getValidatedParams(projectParamsSchema, params);
  
  // Check if project exists
  if (!(await projectExists(id))) {
    return NextResponse.json(
      error(ERROR_CODES.NOT_FOUND, 'Project not found'),
      { status: 404 }
    );
  }
  
  const tasks = await getTasksByProject(id);
  
  return NextResponse.json(success(tasks));
}

// POST /api/v1/projects/:id/tasks
async function createTaskHandler(request: NextRequest, { params }: { params: any }) {
  const { id: projectId } = getValidatedParams(projectParamsSchema, params);
  const body = await getValidatedBody(request, createTaskSchema);
  
  // Validate dates are not in the past
  const startDate = new Date(body.startDate);
  const endDate = new Date(body.endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (startDate <= today) {
    return NextResponse.json(
      error(ERROR_CODES.VALIDATION_ERROR, 'Start date cannot be before tomorrow'),
      { status: 400 }
    );
  }
  
  if (endDate <= today) {
    return NextResponse.json(
      error(ERROR_CODES.VALIDATION_ERROR, 'End date cannot be before tomorrow'),
      { status: 400 }
    );
  }

  const task = await createTask({
    projectId,
    ...body
  });
  
  return NextResponse.json(success(task), { status: 201 });
}

export const GET = withErrorHandling(getTasksHandler);
export const POST = withErrorHandling(createTaskHandler);