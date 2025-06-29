import { NextRequest, NextResponse } from 'next/server';
import { success, error, ERROR_CODES } from '@/lib/api/types';
import { withErrorHandling, getValidatedBody, getValidatedParams } from '@/lib/api/middleware';
import { updateProjectSchema, projectParamsSchema } from '@/lib/api/schemas';
import { getProjectById, updateProject, deleteProject } from '@/lib/db/queries/projects';

// GET /api/v1/projects/:id
async function getProjectHandler(request: NextRequest, { params }: { params: any }) {
  const { id } = getValidatedParams(projectParamsSchema, params);
  
  const project = await getProjectById(id);
  
  if (!project) {
    return NextResponse.json(
      error(ERROR_CODES.NOT_FOUND, 'Project not found'),
      { status: 404 }
    );
  }
  
  return NextResponse.json(success(project));
}

// PUT /api/v1/projects/:id
async function updateProjectHandler(request: NextRequest, { params }: { params: any }) {
  const { id } = getValidatedParams(projectParamsSchema, params);
  const body = await getValidatedBody(request, updateProjectSchema);
  
  // Validate start date is not in the past (if provided)
  if (body.startDate) {
    const startDate = new Date(body.startDate);
    const today = new Date();
    const todayUTC = new Date(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate()
    );
    const startDateUTC = new Date(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate()
    );
    
    if (startDateUTC < todayUTC) {
      return NextResponse.json(
        error(ERROR_CODES.VALIDATION_ERROR, 'Start date cannot be in the past'),
        { status: 400 }
      );
    }
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

// DELETE /api/v1/projects/:id
async function deleteProjectHandler(request: NextRequest, { params }: { params: any }) {
  const { id } = getValidatedParams(projectParamsSchema, params);
  
  const deleted = await deleteProject(id);
  
  if (!deleted) {
    return NextResponse.json(
      error(ERROR_CODES.NOT_FOUND, 'Project not found'),
      { status: 404 }
    );
  }
  
  return NextResponse.json(success({ deleted: true }));
}

export const GET = withErrorHandling(getProjectHandler);
export const PUT = withErrorHandling(updateProjectHandler);
export const DELETE = withErrorHandling(deleteProjectHandler);