import { z } from 'zod';
import { isDateInPast } from '@/lib/utils';

// Unified date validation helpers
const dateString = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format')
  .refine(val => !isNaN(Date.parse(val)), 'Must be a valid date');

/**
 * Creates a date validator with configurable past date checking
 * @param pastAllowed - Whether past dates are allowed (default: false)
 * @param fieldName - Field name for error messages (default: 'Date')
 */
export const createDateValidator = (pastAllowed = false, fieldName = 'Date') => 
  dateString.refine(
    val => pastAllowed || !isDateInPast(val), 
    `${fieldName} cannot be in the past`
  );

/**
 * Creates an optional date validator
 */
export const createOptionalDateValidator = (pastAllowed = false, fieldName = 'Date') =>
  createDateValidator(pastAllowed, fieldName).optional();

/**
 * Creates a unified ID parameter validator
 * @param fieldName - Field name for error messages (default: 'ID')
 */
export const createIdParam = (fieldName = 'ID') => 
  z.string().transform((val, ctx) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${fieldName} must be a number`
      });
      return z.NEVER;
    }
    return num;
  });

// Project schemas
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  startDate: createDateValidator(false, 'Start date'),
  insertAfterProjectId: z.number().optional()
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long').optional(),
  startDate: createOptionalDateValidator(false, 'Start date')
});

export const projectParamsSchema = z.object({
  id: createIdParam('Project ID')
});

// Task schemas
export const createTaskSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  startDate: createDateValidator(false, 'Start date'),
  endDate: createDateValidator(false, 'End date'),
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
  startDate: createOptionalDateValidator(false, 'Start date'),
  endDate: createOptionalDateValidator(false, 'End date')
})
// NOTE: This validation only checks date consistency when both startDate and endDate 
// are provided in the update payload. It does not validate against existing data when 
// only one date is updated. API handlers should perform additional validation by 
// fetching existing task data and checking date consistency during partial updates 
// to ensure the new date doesn't conflict with the existing counterpart date.
.refine(data => {
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
  id: createIdParam('Project ID'),
  taskId: createIdParam('Task ID')
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