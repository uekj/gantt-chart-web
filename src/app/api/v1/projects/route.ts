import { NextRequest, NextResponse } from 'next/server';
import { success, error, ERROR_CODES } from '@/lib/api/types';
import { withErrorHandling, getValidatedBody } from '@/lib/api/middleware';
import { createProjectSchema } from '@/lib/api/schemas';
import { getProjects, createProject } from '@/lib/db/queries/projects';

// GET /api/v1/projects
async function getProjectsHandler(request: NextRequest) {
  const projects = await getProjects();
  return NextResponse.json(success(projects));
}

// POST /api/v1/projects
async function createProjectHandler(request: NextRequest) {
  const body = await getValidatedBody(request, createProjectSchema);
  
  // Validate start date is not in the past
  const startDate = new Date(body.startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to compare dates only
  
  if (startDate < today) {
    return NextResponse.json(
      error(ERROR_CODES.VALIDATION_ERROR, 'Start date cannot be in the past'),
      { status: 400 }
    );
  }

  const project = await createProject(body);
  
  return NextResponse.json(success(project), { status: 201 });
}

export const GET = withErrorHandling(getProjectsHandler);
export const POST = withErrorHandling(createProjectHandler);