import { NextRequest, NextResponse } from 'next/server';
import { success, error, ERROR_CODES } from '@/lib/api/types';
import { withErrorHandling, getValidatedBody, getValidatedParams } from '@/lib/api/middleware';
import { createTaskSchema, projectParamsSchema } from '@/lib/api/schemas';
import { getTasksByProject, createTask } from '@/lib/db/queries/tasks';
import { projectExists } from '@/lib/db/queries/projects';
import { validateDateNotInPast } from '@/lib/utils';
import { createGetCollectionHandler } from '@/lib/api/handler-utils';

// GET /api/v1/projects/:id/tasks - Using generic collection handler
const getTasksHandler = createGetCollectionHandler(
  getTasksByProject,
  projectParamsSchema,
  projectExists
);

// POST /api/v1/projects/:id/tasks
async function createTaskHandler(request: NextRequest, { params }: { params: Record<string, string | string[]> }) {
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