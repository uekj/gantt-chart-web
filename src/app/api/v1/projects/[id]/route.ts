import { NextRequest, NextResponse } from 'next/server';
import { success, error, ERROR_CODES } from '@/lib/api/types';
import { withErrorHandling, getValidatedBody, getValidatedParams } from '@/lib/api/middleware';
import { updateProjectSchema, projectParamsSchema } from '@/lib/api/schemas';
import { getProjectById, updateProject, deleteProject } from '@/lib/db/queries/projects';
import { validateDateNotInPast } from '@/lib/utils';
import { createGetHandler, createDeleteHandler } from '@/lib/api/handler-utils';

// GET /api/v1/projects/:id - Using generic handler
const getProjectHandler = createGetHandler(
  getProjectById,
  projectParamsSchema,
  'Project not found'
);

// PUT /api/v1/projects/:id
async function updateProjectHandler(request: NextRequest, { params }: { params: Record<string, string | string[]> }) {
  const { id } = getValidatedParams(projectParamsSchema, params);
  const body = await getValidatedBody(request, updateProjectSchema);
  
  // Validate start date is not in the past (if provided)
  const startDateValidation = validateDateNotInPast(body.startDate, 'Start date');
  if (!startDateValidation.isValid) {
    return NextResponse.json(
      error(ERROR_CODES.VALIDATION_ERROR, startDateValidation.error!),
      { status: 400 }
    );
  }

  const project = await updateProject(id, body);
  
  if (!project) {
    return NextResponse.json(
      error(ERROR_CODES.NOT_FOUND, 'Project not found'),
      { status: 404 }
    );
  }
  
  return NextResponse.json(success(project));
}

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