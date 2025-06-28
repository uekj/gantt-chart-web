import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Projects Table
export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  startDate: text('start_date').notNull(), // ISO date string (YYYY-MM-DD)
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  displayOrderIdx: index('idx_projects_display_order').on(table.displayOrder)
}));

// Tasks Table
export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  startDate: text('start_date').notNull(), // ISO date string (YYYY-MM-DD)
  endDate: text('end_date').notNull(), // ISO date string (YYYY-MM-DD)
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  projectIdIdx: index('idx_tasks_project_id').on(table.projectId),
  displayOrderIdx: index('idx_tasks_display_order').on(table.projectId, table.displayOrder)
}));

// Relations
export const projectsRelations = relations(projects, ({ many }) => ({
  tasks: many(tasks)
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id]
  })
}));

// Zod Schemas for validation
export const insertProjectSchema = createInsertSchema(projects);
export const selectProjectSchema = createSelectSchema(projects);
export const insertTaskSchema = createInsertSchema(tasks);
export const selectTaskSchema = createSelectSchema(tasks);

// Type exports
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;