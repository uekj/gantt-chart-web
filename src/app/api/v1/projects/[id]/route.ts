import { withErrorHandling } from '@/lib/api/middleware';
import { updateProjectSchema, projectParamsSchema } from '@/lib/api/schemas';
import { getProjectById, updateProject, deleteProject } from '@/lib/db/queries/projects';
import { createGetHandler, createDeleteHandler, createUpdateHandler } from '@/lib/api/handler-utils';

// GET /api/v1/projects/:id - Using generic handler
const getProjectHandler = createGetHandler(
  getProjectById,
  projectParamsSchema,
  'Project not found'
);

// PUT /api/v1/projects/:id - Using generic update handler
const updateProjectHandler = createUpdateHandler(
  updateProject,
  projectParamsSchema,
  updateProjectSchema,
  ['startDate'],
  'Project not found'
);

// DELETE /api/v1/projects/:id - Using generic handler
const deleteProjectHandler = createDeleteHandler(
  deleteProject,
  projectParamsSchema,
  'Project not found',
  'Project deleted successfully'
);

export const GET = withErrorHandling(getProjectHandler);
export const PUT = withErrorHandling(updateProjectHandler);
export const DELETE = withErrorHandling(deleteProjectHandler);