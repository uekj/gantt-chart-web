import { eq, sql } from 'drizzle-orm';
import { db } from '../connection';
import { projects, tasks } from '../schema';
import type { Project, Task } from '../schema';

// Combined data structure for Gantt chart
export interface GanttProject extends Project {
  tasks: Task[];
}

// Get all projects with their tasks for Gantt chart display
export async function getGanttData(): Promise<GanttProject[]> {
  // Get all projects and tasks in separate queries for better performance
  const [allProjects, allTasks] = await Promise.all([
    db.select().from(projects).orderBy(projects.displayOrder),
    db.select().from(tasks).orderBy(tasks.projectId, tasks.displayOrder)
  ]);

  // Group tasks by project ID
  const tasksByProject = allTasks.reduce((acc, task) => {
    if (!acc[task.projectId]) {
      acc[task.projectId] = [];
    }
    acc[task.projectId].push(task);
    return acc;
  }, {} as Record<number, Task[]>);

  // Combine projects with their tasks
  return allProjects.map(project => ({
    ...project,
    tasks: tasksByProject[project.id] || []
  }));
}

// Get project with tasks by project ID
export async function getProjectWithTasks(projectId: number): Promise<GanttProject | null> {
  const [projectResult, projectTasks] = await Promise.all([
    db.select().from(projects).where(eq(projects.id, projectId)).limit(1),
    db.select().from(tasks).where(eq(tasks.projectId, projectId)).orderBy(tasks.displayOrder)
  ]);

  if (projectResult.length === 0) {
    return null;
  }

  return {
    ...projectResult[0],
    tasks: projectTasks
  };
}

// Get statistics for dashboard
export async function getGanttStatistics() {
  const [projectCount, taskCount] = await Promise.all([
    db.select({ count: sql`COUNT(*)` }).from(projects),
    db.select({ count: sql`COUNT(*)` }).from(tasks)
  ]);

  return {
    totalProjects: Number(projectCount[0]?.count || 0),
    totalTasks: Number(taskCount[0]?.count || 0)
  };
}