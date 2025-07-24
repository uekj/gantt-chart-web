import { withErrorHandling } from '@/lib/api/middleware';
import { createTaskSchema, projectParamsSchema } from '@/lib/api/schemas';
import { getTasksByProject, createTask } from '@/lib/db/queries/tasks';
import { projectExists } from '@/lib/db/queries/projects';
import { createGetCollectionHandler, createNestedCreateHandler } from '@/lib/api/handler-utils';

// GET /api/v1/projects/:id/tasks - Using generic collection handler
const getTasksHandler = createGetCollectionHandler(
  getTasksByProject,
  projectParamsSchema,
  projectExists
);

// Adapter function for createTask to match generic handler signature
async function createTaskAdapter(params: Record<string, any>, body: any) {
  return createTask({
    projectId: params.id,
    ...body
  });
}

// POST /api/v1/projects/:id/tasks - Using generic nested create handler
const createTaskHandler = createNestedCreateHandler(
  createTaskAdapter,
  projectParamsSchema,
  createTaskSchema,
  ['startDate', 'endDate']
);

export const GET = withErrorHandling(getTasksHandler);
export const POST = withErrorHandling(createTaskHandler);