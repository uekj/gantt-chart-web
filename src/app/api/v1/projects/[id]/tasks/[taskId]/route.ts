import { withErrorHandling } from '@/lib/api/middleware';
import { updateTaskSchema, taskParamsSchema } from '@/lib/api/schemas';
import { getTaskById, updateTask, deleteTask } from '@/lib/db/queries/tasks';
import { createNestedGetHandler, createNestedDeleteHandler, createNestedUpdateHandler } from '@/lib/api/handler-utils';

// GET /api/v1/projects/:id/tasks/:taskId - Using generic handler
const getTaskHandler = createNestedGetHandler(
  getTaskById,
  taskParamsSchema,
  'Task not found',
  'taskId'
);

// PUT /api/v1/projects/:id/tasks/:taskId - Using generic nested update handler
const updateTaskHandler = createNestedUpdateHandler(
  updateTask,
  taskParamsSchema,
  updateTaskSchema,
  ['startDate', 'endDate'],
  'Task not found',
  'taskId'
);

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