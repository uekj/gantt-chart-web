import { withErrorHandling } from '@/lib/api/middleware';
import { reorderTasksSchema, projectParamsSchema } from '@/lib/api/schemas';
import { reorderTasks } from '@/lib/db/queries/tasks';
import { projectExists } from '@/lib/db/queries/projects';
import { createNestedReorderHandler } from '@/lib/api/handler-utils';

// Adapter function for reorderTasks to match generic handler signature
async function reorderTasksAdapter(projectId: number, body: any) {
  return reorderTasks(projectId, body.taskIds);
}

// PUT /api/v1/projects/:id/tasks/reorder - Using generic nested reorder handler
const reorderTasksHandler = createNestedReorderHandler(
  reorderTasksAdapter,
  projectParamsSchema,
  reorderTasksSchema,
  projectExists,
  'Project not found'
);

export const PUT = withErrorHandling(reorderTasksHandler);