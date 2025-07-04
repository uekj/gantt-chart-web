import { NextRequest, NextResponse } from 'next/server';
import { success, error, ERROR_CODES } from '@/lib/api/types';
import { withErrorHandling, getValidatedBody } from '@/lib/api/middleware';
import { createProjectSchema } from '@/lib/api/schemas';
import { getProjects, createProject } from '@/lib/db/queries/projects';
import { validateDateNotInPast } from '@/lib/utils';

// GET /api/v1/projects
async function getProjectsHandler() {
  const projects = await getProjects();
  return NextResponse.json(success(projects));
}

// POST /api/v1/projects
async function createProjectHandler(request: NextRequest) {
  const body = await getValidatedBody(request, createProjectSchema);
  
  // Validate start date is not in the past
  const startDateValidation = validateDateNotInPast(body.startDate, 'Start date');
  if (!startDateValidation.isValid) {
    return NextResponse.json(
      error(ERROR_CODES.VALIDATION_ERROR, startDateValidation.error!),
      { status: 400 }
    );
  }

  const project = await createProject(body);
  
  return NextResponse.json(success(project), { status: 201 });
}

export const GET = withErrorHandling(getProjectsHandler);
export const POST = withErrorHandling(createProjectHandler);