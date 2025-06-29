import { NextRequest, NextResponse } from 'next/server';
import { success, error, ERROR_CODES } from '@/lib/api/types';
import { withErrorHandling, getValidatedBody, getValidatedParams } from '@/lib/api/middleware';
import { updateTaskSchema, taskParamsSchema } from '@/lib/api/schemas';
import { getTaskById, updateTask, deleteTask } from '@/lib/db/queries/tasks';

// GET /api/v1/projects/:id/tasks/:taskId
async function getTaskHandler(request: NextRequest, { params }: { params: any }) {
  const { taskId } = getValidatedParams(taskParamsSchema, params);
  
  const task = await getTaskById(taskId);
  
  if (!task) {
    return NextResponse.json(
      error(ERROR_CODES.NOT_FOUND, 'Task not found'),
      { status: 404 }
    );
  }
  
  return NextResponse.json(success(task));
}

// PUT /api/v1/projects/:id/tasks/:taskId
async function updateTaskHandler(request: NextRequest, { params }: { params: any }) {
  const { taskId } = getValidatedParams(taskParamsSchema, params);
  const body = await getValidatedBody(request, updateTaskSchema);
  
  // Validate dates are not in the past (if provided)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (body.startDate && new Date(body.startDate) < today) {
    return NextResponse.json(
      error(ERROR_CODES.VALIDATION_ERROR, 'Start date cannot be in the past'),
      { status: 400 }
    );
  }
  
  if (body.endDate && new Date(body.endDate) < today) {
    return NextResponse.json(
      error(ERROR_CODES.VALIDATION_ERROR, 'End date cannot be in the past'),
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

// DELETE /api/v1/projects/:id/tasks/:taskId
async function deleteTaskHandler(request: NextRequest, { params }: { params: any }) {
  const { taskId } = getValidatedParams(taskParamsSchema, params);
  
  const deleted = await deleteTask(taskId);
  
  if (!deleted) {
    return NextResponse.json(
      error(ERROR_CODES.NOT_FOUND, 'Task not found'),
      { status: 404 }
    );
  }
  
  return NextResponse.json(success({ deleted: true }));
}

export const GET = withErrorHandling(getTaskHandler);
export const PUT = withErrorHandling(updateTaskHandler);
export const DELETE = withErrorHandling(deleteTaskHandler);