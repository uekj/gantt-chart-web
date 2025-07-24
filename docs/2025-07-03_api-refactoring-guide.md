# API Refactoring Guide - Gantt Chart App

## Overview

This guide documents the comprehensive API refactoring completed through Phase 1.2 and Phase 2, demonstrating how to eliminate code duplication and create maintainable, type-safe API handlers.

## Before & After Comparison

### Code Duplication Eliminated
- **Similarity Analysis**: 87-97% duplication → Near-zero duplication
- **Lines of Code**: ~200+ duplicate lines eliminated
- **Handler Complexity**: 15-32 lines → 3-7 lines per operation

### Handler Implementation Examples

#### Before Refactoring (Manual Implementation)
```typescript
// Typical CREATE handler before refactoring
async function createProjectHandler(request: NextRequest) {
  const body = await getValidatedBody(request, createProjectSchema);
  
  // Manual date validation
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
```

#### After Refactoring (Generic Handler)
```typescript
// Same functionality with generic handler
const createProjectHandler = createCreateHandler(
  createProject,
  createProjectSchema,
  ['startDate']
);
```

## Generic Handler Patterns

### 1. CREATE Operations

#### Simple CREATE Handler
```typescript
const createProjectHandler = createCreateHandler(
  createProject,           // Database operation function
  createProjectSchema,     // Zod validation schema
  ['startDate']           // Date fields to validate
);
```

#### Nested CREATE Handler
```typescript
const createTaskHandler = createNestedCreateHandler(
  createTaskAdapter,       // Adapter function for parameter mapping
  projectParamsSchema,     // URL parameters schema
  createTaskSchema,        // Body validation schema
  ['startDate', 'endDate'] // Date fields to validate
);
```

### 2. UPDATE Operations

#### Simple UPDATE Handler
```typescript
const updateProjectHandler = createUpdateHandler(
  updateProject,           // Database operation function
  projectParamsSchema,     // URL parameters schema
  updateProjectSchema,     // Body validation schema
  ['startDate'],          // Date fields to validate
  'Project not found'     // Not found error message
);
```

#### Nested UPDATE Handler
```typescript
const updateTaskHandler = createNestedUpdateHandler(
  updateTask,              // Database operation function
  taskParamsSchema,        // URL parameters schema  
  updateTaskSchema,        // Body validation schema
  ['startDate', 'endDate'], // Date fields to validate
  'Task not found',        // Not found error message
  'taskId'                 // ID field name in parameters
);
```

### 3. GET Operations

#### Simple GET Handler
```typescript
const getProjectHandler = createGetHandler(
  getProjectById,          // Database query function
  projectParamsSchema,     // URL parameters schema
  'Project not found'      // Not found error message
);
```

#### Collection GET Handler
```typescript
const getTasksHandler = createGetCollectionHandler(
  getTasksByProject,       // Database query function
  projectParamsSchema,     // URL parameters schema
  projectExists           // Parent existence check function (optional)
);
```

### 4. DELETE Operations

#### Simple DELETE Handler
```typescript
const deleteProjectHandler = createDeleteHandler(
  deleteProject,           // Database operation function
  projectParamsSchema,     // URL parameters schema
  'Project not found',     // Not found error message
  'Project deleted successfully' // Success message
);
```

### 5. REORDER Operations

#### Simple REORDER Handler
```typescript
const reorderProjectsHandler = createReorderHandler(
  reorderProjectsAdapter,  // Adapter function
  reorderProjectsSchema    // Body validation schema
);
```

#### Nested REORDER Handler
```typescript
const reorderTasksHandler = createNestedReorderHandler(
  reorderTasksAdapter,     // Adapter function
  projectParamsSchema,     // URL parameters schema
  reorderTasksSchema,      // Body validation schema
  projectExists,           // Parent existence check function
  'Project not found'      // Parent not found error message
);
```

## Validation System

### Unified Date Validation
```typescript
// Create date validator with past date checking
export const createDateValidator = (pastAllowed = false, fieldName = 'Date') => 
  dateString.refine(
    val => pastAllowed || !isDateInPast(val), 
    `${fieldName} cannot be in the past`
  );

// Usage in schemas
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  startDate: createDateValidator(false, 'Start date'), // Custom field name
  insertAfterProjectId: z.number().optional()
});
```

### Unified ID Parameter Validation
```typescript
// Create ID parameter validator
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

// Usage in parameter schemas
export const taskParamsSchema = z.object({
  id: createIdParam('Project ID'),      // Custom field name
  taskId: createIdParam('Task ID')      // Custom field name
});
```

## Implementation Guidelines

### 1. Creating New API Endpoints

When creating new API endpoints, follow this pattern:

```typescript
// 1. Import necessary utilities
import { createGetHandler, createCreateHandler } from '@/lib/api/handler-utils';

// 2. Define handlers using generic factories
const getResourceHandler = createGetHandler(
  getResourceById,
  resourceParamsSchema,
  'Resource not found'
);

const createResourceHandler = createCreateHandler(
  createResource,
  createResourceSchema,
  ['dateField1', 'dateField2'] // Only include actual date fields
);

// 3. Export with error handling
export const GET = withErrorHandling(getResourceHandler);
export const POST = withErrorHandling(createResourceHandler);
```

### 2. Adapter Functions

When database functions don't match generic handler signatures, create adapters:

```typescript
// Adapter for functions that need parameter transformation
async function createTaskAdapter(params: Record<string, any>, body: any) {
  return createTask({
    projectId: params.id,    // Map 'id' parameter to 'projectId'
    ...body
  });
}

// Adapter for functions that need data transformation
async function reorderTasksAdapter(projectId: number, body: any) {
  return reorderTasks(projectId, body.taskIds); // Extract taskIds from body
}
```

### 3. Schema Design

Follow these patterns for consistent validation:

```typescript
// For create operations - require all fields
export const createResourceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  startDate: createDateValidator(false, 'Start date'),
  endDate: createDateValidator(false, 'End date')
});

// For update operations - make fields optional
export const updateResourceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long').optional(),
  startDate: createOptionalDateValidator(false, 'Start date'),
  endDate: createOptionalDateValidator(false, 'End date')
});

// For parameters - use unified ID validation
export const resourceParamsSchema = z.object({
  id: createIdParam('Resource ID')
});
```

## Benefits Achieved

### 1. Maintainability
- **Single point of change**: Validation logic, error handling, and response formatting
- **Consistent behavior**: All endpoints follow identical patterns
- **Reduced complexity**: New endpoints require minimal code

### 2. Type Safety
- **Enhanced TypeScript support**: Generic types ensure compile-time checking
- **Schema consistency**: Unified validation across API and database layers
- **Parameter safety**: Automatic validation and transformation

### 3. Developer Experience
- **Pattern recognition**: Clear, predictable structure for all endpoints
- **Reduced boilerplate**: Focus on business logic rather than infrastructure
- **Easy debugging**: Centralized error handling and logging

### 4. Quality Assurance
- **Validation consistency**: Same rules applied everywhere
- **Error handling**: Standardized error responses and status codes
- **Testing**: Generic handlers can be tested once, covering multiple endpoints

## Migration Path

When refactoring existing API endpoints:

1. **Identify the pattern**: GET, POST, PUT, DELETE, or REORDER
2. **Check parameters**: Simple ID, nested IDs, or complex parameters
3. **Select generic handler**: Choose appropriate factory function
4. **Create adapter if needed**: Transform parameters or data as required
5. **Update imports**: Remove unused imports after refactoring
6. **Test thoroughly**: Ensure behavior remains identical

## Future Considerations

This refactoring provides a solid foundation for:
- **Rapid API development**: New resources can be implemented in minutes
- **Consistent documentation**: API patterns are self-documenting
- **Testing automation**: Generic patterns enable automated test generation
- **Performance optimization**: Centralized locations for caching and optimization
- **Security enhancements**: Single points to add authentication, authorization, and rate limiting

## Conclusion

The API refactoring demonstrates how systematic application of generic patterns can:
- Eliminate code duplication (87-97% → near-zero)
- Improve maintainability and consistency
- Enhance type safety and developer experience
- Provide a scalable foundation for future development

This approach serves as a template for similar refactoring efforts in other codebases and demonstrates the value of investing in systematic code improvement.