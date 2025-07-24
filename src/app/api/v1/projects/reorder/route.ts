import { withErrorHandling } from '@/lib/api/middleware';
import { reorderProjectsSchema } from '@/lib/api/schemas';
import { reorderProjects } from '@/lib/db/queries/projects';
import { createReorderHandler } from '@/lib/api/handler-utils';

// Adapter function for reorderProjects to match generic handler signature
async function reorderProjectsAdapter(body: any) {
  return reorderProjects(body.projectIds);
}

// PUT /api/v1/projects/reorder - Using generic reorder handler
const reorderProjectsHandler = createReorderHandler(
  reorderProjectsAdapter,
  reorderProjectsSchema
);

export const PUT = withErrorHandling(reorderProjectsHandler);