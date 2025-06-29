import { NextRequest, NextResponse } from 'next/server';
import { success, error, ERROR_CODES } from '@/lib/api/types';
import { withErrorHandling, getValidatedBody, getValidatedParams } from '@/lib/api/middleware';
import { createTaskSchema, projectParamsSchema } from '@/lib/api/schemas';
import { getTasksByProject, createTask } from '@/lib/db/queries/tasks';
import { projectExists } from '@/lib/db/queries/projects';
import { validateDateNotInPast } from '@/lib/utils';

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
  const startDateValidation = validateDateNotInPast(body.startDate, 'Start date');
  if (!startDateValidation.isValid) {
    return NextResponse.json(
      error(ERROR_CODES.VALIDATION_ERROR, startDateValidation.error!),
      { status: 400 }
    );
  }
  
  const endDateValidation = validateDateNotInPast(body.endDate, 'End date');
  if (!endDateValidation.isValid) {
    return NextResponse.json(
      error(ERROR_CODES.VALIDATION_ERROR, endDateValidation.error!),
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