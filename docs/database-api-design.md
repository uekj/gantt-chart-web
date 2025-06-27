# Database Schema & API Design

## Database Schema (Drizzle ORM)

### Projects Table

```typescript
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  startDate: text('start_date').notNull(), // ISO date string (YYYY-MM-DD)
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const insertProjectSchema = createInsertSchema(projects);
export const selectProjectSchema = createSelectSchema(projects);
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
```

### Tasks Table

```typescript
export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  startDate: text('start_date').notNull(), // ISO date string (YYYY-MM-DD)
  endDate: text('end_date').notNull(), // ISO date string (YYYY-MM-DD)
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const insertTaskSchema = createInsertSchema(tasks);
export const selectTaskSchema = createSelectSchema(tasks);
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
```

### Relations

```typescript
export const projectsRelations = relations(projects, ({ many }) => ({
  tasks: many(tasks)
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id]
  })
}));
```

### Indexes

```typescript
import { index } from 'drizzle-orm/sqlite-core';

export const projectsDisplayOrderIndex = index('idx_projects_display_order')
  .on(projects.displayOrder);

export const tasksProjectIdIndex = index('idx_tasks_project_id')
  .on(tasks.projectId);

export const tasksDisplayOrderIndex = index('idx_tasks_display_order')
  .on(tasks.projectId, tasks.displayOrder);
```

## API Design

### Base URL Structure
- Base: `/api/v1`
- Projects: `/api/v1/projects`
- Tasks: `/api/v1/projects/:projectId/tasks`

### Projects API

#### GET /api/v1/projects
```typescript
// Response - Always ordered by display_order
{
  projects: Project[] // Sorted by display_order ASC
}
```

#### POST /api/v1/projects
```typescript
// Request
{
  name: string;
  startDate: string; // YYYY-MM-DD
  insertAfterProjectId?: number; // Optional: insert after specific project
}

// Response
{
  project: Project
}

// Implementation:
// - If insertAfterProjectId provided: insert with appropriate display_order
// - Otherwise: append to end (MAX(display_order) + 10)
```

#### PUT /api/v1/projects/:id
```typescript
// Request
{
  name?: string;
  startDate?: string; // YYYY-MM-DD
}

// Response
{
  project: Project
}
```

#### DELETE /api/v1/projects/:id
```typescript
// Response
{
  success: boolean
}
```

#### PUT /api/v1/projects/reorder
```typescript
// Request
{
  projectIds: number[] // Complete ordered list of project IDs
}

// Response
{
  success: boolean;
  updatedProjects: Project[]
}

// Implementation:
// 1. Validate all projectIds exist
// 2. Update display_order with gaps (10, 20, 30, ...)
// 3. Return updated projects in new order
```

### Tasks API

#### GET /api/v1/projects/:projectId/tasks
```typescript
// Response - Always ordered by display_order within project
{
  tasks: Task[] // Sorted by display_order ASC
}
```

#### POST /api/v1/projects/:projectId/tasks
```typescript
// Request
{
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  insertAfterTaskId?: number; // Optional: insert after specific task
}

// Response
{
  task: Task
}

// Implementation:
// - If insertAfterTaskId provided: insert with appropriate display_order
// - Otherwise: append to end within project (MAX(display_order) + 10)
```

#### PUT /api/v1/projects/:projectId/tasks/:id
```typescript
// Request
{
  name?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}

// Response
{
  task: Task
}
```

#### DELETE /api/v1/projects/:projectId/tasks/:id
```typescript
// Response
{
  success: boolean
}
```

#### PUT /api/v1/projects/:projectId/tasks/reorder
```typescript
// Request
{
  taskIds: number[] // Complete ordered list of task IDs within project
}

// Response
{
  success: boolean;
  updatedTasks: Task[]
}

// Implementation:
// 1. Validate all taskIds belong to the project
// 2. Update display_order with gaps (10, 20, 30, ...)
// 3. Return updated tasks in new order
```

### Combined Data API

#### GET /api/v1/gantt-data
```typescript
// Response - Optimized for Gantt chart display with proper ordering
{
  projects: Array<{
    id: number;
    name: string;
    startDate: string;
    displayOrder: number;
    tasks: Task[]; // Sorted by display_order ASC
  }> // Sorted by display_order ASC
}
```

## Order Management Strategy

### Display Order Logic
- **New items**: `MAX(display_order) + 10`
- **Reordering**: Use increments of 10 (10, 20, 30, ...)
- **Gaps**: Allow insertions without full renumbering
- **Scoped ordering**: Tasks ordered within their project

### Transaction Safety
```typescript
// Pseudo-code for reordering
await db.transaction(async (tx) => {
  for (let i = 0; i < projectIds.length; i++) {
    await tx.update(projects)
      .set({ displayOrder: (i + 1) * 10 })
      .where(eq(projects.id, projectIds[i]));
  }
});
```

## Validation Rules

### Project Validation
- `name`: Required, min 1 char, max 255 chars
- `startDate`: Required, valid ISO date (YYYY-MM-DD), not in the past

### Task Validation
- `name`: Required, min 1 char, max 255 chars
- `startDate`: Required, valid ISO date, >= project start date
- `endDate`: Required, valid ISO date, >= startDate (minimum 1 day duration)
- `projectId`: Must reference existing project

## Error Handling

### Standard Error Response
```typescript
{
  error: {
    code: string;
    message: string;
    details?: any;
  }
}
```

### Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `CONSTRAINT_VIOLATION`: Database constraint violation (e.g., task before project start)
- `INTERNAL_ERROR`: Server error

## Business Logic Constraints

1. **Task Duration**: Minimum 1 day (endDate >= startDate)
2. **Project Boundary**: Tasks must start on or after project start date
3. **Date Format**: All dates in ISO format (YYYY-MM-DD)
4. **Display Order**: Auto-managed with gap strategy for drag & drop
5. **Cascade Delete**: Deleting project removes all associated tasks
6. **No Past Dates**: Projects and tasks cannot be set to past dates

## Performance Considerations

1. **Indexes**: Strategic indexes on display_order and foreign keys
2. **Batch Operations**: Reorder operations handle multiple items in transactions
3. **Optimized Queries**: Combined gantt-data endpoint reduces API calls
4. **Gap Strategy**: Minimizes database updates during reordering
5. **Timestamps**: Automatic created_at/updated_at for audit trail