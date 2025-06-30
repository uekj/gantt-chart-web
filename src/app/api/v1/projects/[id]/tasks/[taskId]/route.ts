import { NextRequest, NextResponse } from 'next/server';
import { success, error, ERROR_CODES } from '@/lib/api/types';
import { withErrorHandling, getValidatedBody, getValidatedParams } from '@/lib/api/middleware';
import { updateTaskSchema, taskParamsSchema } from '@/lib/api/schemas';
import { getTaskById, updateTask, deleteTask } from '@/lib/db/queries/tasks';
import { validateDateNotInPast } from '@/lib/utils';
import { createNestedGetHandler, createNestedDeleteHandler } from '@/lib/api/handler-utils';

// GET /api/v1/projects/:id/tasks/:taskId - Using generic handler
const getTaskHandler = createNestedGetHandler(
  getTaskById,
  taskParamsSchema,
  'Task not found',
  'taskId'
);

// PUT /api/v1/projects/:id/tasks/:taskId
async function updateTaskHandler(request: NextRequest, { params }: { params: Record<string, string | string[]> }) {
  const { taskId } = getValidatedParams(taskParamsSchema, params);
  const body = await getValidatedBody(request, updateTaskSchema);
  
  // Validate dates are not in the past (if provided)
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

  const task = await updateTask(taskId, body);
  
  if (!task) {
    return NextResponse.json(
      error(ERROR_CODES.NOT_FOUND, 'Task not found'),
      { status: 404 }
    );
  }
  
  return NextResponse.json(success(task));
}

// DELETE /api/v1/projects/:id/tasks/:taskId - Using generic handler
const deleteTaskHandler = createNestedDeleteHandler(
  deleteTask,
  taskParamsSchema,
  'Task not found',
  'Task deleted successfully',
  'taskId'
);

export const GET = withErrorHandling(getTaskHandler);
export const PUT = withErrorHandling(updateTaskHandler);
export const DELETE = withErrorHandling(deleteTaskHandler);