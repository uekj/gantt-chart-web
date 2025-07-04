import { eq, sql, max } from 'drizzle-orm';
import { db } from '../connection';
import { projects, type Project } from '../schema';

// Create a new project
export async function createProject(data: {
  name: string;
  startDate: string;
  insertAfterProjectId?: number;
}): Promise<Project> {
  return await db.transaction(async (tx) => {
    let displayOrder = 10; // Default order

    if (data.insertAfterProjectId) {
      // Insert after specific project
      const afterProject = await tx
        .select({ displayOrder: projects.displayOrder })
        .from(projects)
        .where(eq(projects.id, data.insertAfterProjectId))
        .limit(1);

      if (afterProject.length > 0) {
        displayOrder = afterProject[0].displayOrder + 5;
      }
    } else {
      // Append to end
      const maxOrder = await tx
        .select({ max: max(projects.displayOrder) })
        .from(projects)
        .limit(1);

      if (maxOrder[0]?.max) {
        displayOrder = maxOrder[0].max + 10;
      }
    }

    const [newProject] = await tx
      .insert(projects)
      .values({
        name: data.name,
        startDate: data.startDate,
        displayOrder,
        updatedAt: sql`CURRENT_TIMESTAMP`
      })
      .returning();

    return newProject;
  });
}

// Get all projects ordered by display order
export async function getProjects(): Promise<Project[]> {
  return await db
    .select()
    .from(projects)
    .orderBy(projects.displayOrder);
}

// Get project by ID
export async function getProjectById(id: number): Promise<Project | null> {
  const result = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);

  return result[0] || null;
}

// Update project
export async function updateProject(
  id: number, 
  data: Partial<Pick<Project, 'name' | 'startDate'>>
): Promise<Project | null> {
  const [updated] = await db
    .update(projects)
    .set({
      ...data,
      updatedAt: sql`CURRENT_TIMESTAMP`
    })
    .where(eq(projects.id, id))
    .returning();

  return updated || null;
}

// Delete project (cascade deletes tasks)
export async function deleteProject(id: number): Promise<boolean> {
  const result = await db
    .delete(projects)
    .where(eq(projects.id, id));

  return result.changes > 0;
}

// Reorder projects
export async function reorderProjects(projectIds: number[]): Promise<Project[]> {
  return await db.transaction(async (tx) => {
    // Update display orders with gaps
    const updates = projectIds.map((projectId, index) => 
      tx
        .update(projects)
        .set({ 
          displayOrder: (index + 1) * 10,
          updatedAt: sql`CURRENT_TIMESTAMP`
        })
        .where(eq(projects.id, projectId))
    );

    await Promise.all(updates);

    // Return updated projects in new order
    return await tx
      .select()
      .from(projects)
      .orderBy(projects.displayOrder);
  });
}

// Check if project exists
export async function projectExists(id: number): Promise<boolean> {
  const result = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);

  return result.length > 0;
}