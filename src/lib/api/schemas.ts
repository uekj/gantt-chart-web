import { z } from 'zod';

// Date validation helper
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format');

// Project schemas
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  startDate: dateString,
  insertAfterProjectId: z.number().optional()
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long').optional(),
  startDate: dateString.optional()
});

export const projectParamsSchema = z.object({
  id: z.string().transform(val => {
    const num = parseInt(val, 10);
    if (isNaN(num)) throw new Error('ID must be a number');
    return num;
  })
});

// Task schemas
export const createTaskSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  startDate: dateString,
  endDate: dateString,
  insertAfterTaskId: z.number().optional()
}).refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: 'End date must be on or after start date',
  path: ['endDate']
});

export const updateTaskSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long').optional(),
  startDate: dateString.optional(),
  endDate: dateString.optional()
}).refine(data => {
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
  }
  return true;
}, {
  message: 'End date must be on or after start date',
  path: ['endDate']
});

export const taskParamsSchema = z.object({
  id: z.string().transform(val => {
    const num = parseInt(val, 10);
    if (isNaN(num)) throw new Error('Project ID must be a number');
    return num;
  }),
  taskId: z.string().transform(val => {
    const num = parseInt(val, 10);
    if (isNaN(num)) throw new Error('Task ID must be a number');
    return num;
  })
});

// Reorder schemas
export const reorderProjectsSchema = z.object({
  projectIds: z.array(z.number()).min(1, 'At least one project ID required')
});

export const reorderTasksSchema = z.object({
  taskIds: z.array(z.number()).min(1, 'At least one task ID required')
});

// Type exports
export type CreateProjectData = z.infer<typeof createProjectSchema>;
export type UpdateProjectData = z.infer<typeof updateProjectSchema>;
export type ProjectParams = z.infer<typeof projectParamsSchema>;

export type CreateTaskData = z.infer<typeof createTaskSchema>;
export type UpdateTaskData = z.infer<typeof updateTaskSchema>;
export type TaskParams = z.infer<typeof taskParamsSchema>;

export type ReorderProjectsData = z.infer<typeof reorderProjectsSchema>;
export type ReorderTasksData = z.infer<typeof reorderTasksSchema>;