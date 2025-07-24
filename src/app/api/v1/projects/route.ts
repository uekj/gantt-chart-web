import { NextResponse } from 'next/server';
import { success } from '@/lib/api/types';
import { withErrorHandling } from '@/lib/api/middleware';
import { createProjectSchema } from '@/lib/api/schemas';
import { getProjects, createProject } from '@/lib/db/queries/projects';
import { createCreateHandler } from '@/lib/api/handler-utils';

// GET /api/v1/projects
async function getProjectsHandler() {
  const projects = await getProjects();
  return NextResponse.json(success(projects));
}

// POST /api/v1/projects - Using generic create handler
const createProjectHandler = createCreateHandler(
  createProject,
  createProjectSchema,
  ['startDate']
);

export const GET = withErrorHandling(getProjectsHandler);
export const POST = withErrorHandling(createProjectHandler);