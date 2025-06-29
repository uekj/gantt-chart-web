import { eq, sql, max, and } from 'drizzle-orm';
import { db } from '../connection';
import { tasks, projects, type Task, type NewTask } from '../schema';

// Create a new task
export async function createTask(data: {
  projectId: number;
  name: string;
  startDate: string;
  endDate: string;
  insertAfterTaskId?: number;
}): Promise<Task> {
  return await db.transaction(async (tx) => {
    // Verify project exists
    const project = await tx
      .select({ id: projects.id, startDate: projects.startDate })
      .from(projects)
      .where(eq(projects.id, data.projectId))
      .limit(1);

    if (project.length === 0) {
      throw new Error('Project not found');
    }

    // Validate task start date is not before project start date
    if (data.startDate < project[0].startDate) {
      throw new Error('Task start date cannot be before project start date');
    }

    let displayOrder = 10; // Default order

    if (data.insertAfterTaskId) {
      // Insert after specific task
      const afterTask = await tx
        .select({ displayOrder: tasks.displayOrder })
        .from(tasks)
        .where(and(
          eq(tasks.id, data.insertAfterTaskId),
          eq(tasks.projectId, data.projectId)
        ))
        .limit(1);

      if (afterTask.length > 0) {
        displayOrder = afterTask[0].displayOrder + 5;
      }
    } else {
      // Append to end within project
      const maxOrder = await tx
        .select({ max: max(tasks.displayOrder) })
        .from(tasks)
        .where(eq(tasks.projectId, data.projectId))
        .limit(1);

      if (maxOrder[0]?.max) {
        displayOrder = maxOrder[0].max + 10;
      }
    }

    const [newTask] = await tx
      .insert(tasks)
      .values({
        projectId: data.projectId,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        displayOrder,
        updatedAt: sql`CURRENT_TIMESTAMP`
      })
      .returning();

    return newTask;
  });
}

// Get tasks by project ID
export async function getTasksByProject(projectId: number): Promise<Task[]> {
  return await db
    .select()
    .from(tasks)
    .where(eq(tasks.projectId, projectId))
    .orderBy(tasks.displayOrder);
}

// Get task by ID
export async function getTaskById(id: number): Promise<Task | null> {
  const result = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, id))
    .limit(1);

  return result[0] || null;
}

// Update task
export async function updateTask(
  id: number,
  data: Partial<Pick<Task, 'name' | 'startDate' | 'endDate'>>
): Promise<Task | null> {
  return await db.transaction(async (tx) => {
    // Get current task to validate project constraints
    const currentTask = await tx
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
      .limit(1);

    if (currentTask.length === 0) {
      return null;
    }

    // If updating start date, validate against project start date
    if (data.startDate) {
      const project = await tx
        .select({ startDate: projects.startDate })
        .from(projects)
        .where(eq(projects.id, currentTask[0].projectId))
        .limit(1);

      if (project.length > 0 && data.startDate < project[0].startDate) {
        throw new Error('Task start date cannot be before project start date');
      }
    }

    const [updated] = await tx
      .update(tasks)
      .set({
        ...data,
        updatedAt: sql`CURRENT_TIMESTAMP`
      })
      .where(eq(tasks.id, id))
      .returning();

    return updated || null;
  });
}

// Delete task
export async function deleteTask(id: number): Promise<boolean> {
  const result = await db
    .delete(tasks)
    .where(eq(tasks.id, id));

  return result.changes > 0;
}

// Reorder tasks within a project
export async function reorderTasks(projectId: number, taskIds: number[]): Promise<Task[]> {
  return await db.transaction(async (tx) => {
    // Verify all tasks belong to the project
    const taskCheck = await tx
      .select({ id: tasks.id })
      .from(tasks)
      .where(eq(tasks.projectId, projectId));

    const projectTaskIds = taskCheck.map(t => t.id);
    const invalidTasks = taskIds.filter(id => !projectTaskIds.includes(id));

    if (invalidTasks.length > 0) {
      throw new Error(`Tasks [${invalidTasks.join(', ')}] do not belong to project ${projectId}`);
    }

    // Update display orders with gaps
    const updates = taskIds.map((taskId, index) =>
      tx
        .update(tasks)
        .set({
          displayOrder: (index + 1) * 10,
          updatedAt: sql`CURRENT_TIMESTAMP`
        })
        .where(eq(tasks.id, taskId))
    );

    await Promise.all(updates);

    // Return updated tasks in new order
    return await tx
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, projectId))
      .orderBy(tasks.displayOrder);
  });
}

// Check if task exists
export async function taskExists(id: number): Promise<boolean> {
  const result = await db
    .select({ id: tasks.id })
    .from(tasks)
    .where(eq(tasks.id, id))
    .limit(1);

  return result.length > 0;
}