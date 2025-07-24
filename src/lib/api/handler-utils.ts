import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { success, error, ERROR_CODES } from './types';
import { getValidatedParams, getValidatedBody } from './middleware';
import { validateDateNotInPast, type DateValidationResult } from '@/lib/utils';

/**
 * Generic GET handler factory for fetching single resources by ID
 * Eliminates duplication in parameter validation and error handling
 */
export function createGetHandler<T>(
  fetchFn: (id: number) => Promise<T | null>,
  paramsSchema: ZodSchema,
  notFoundMessage: string
) {
  return async (request: NextRequest, { params }: { params: Record<string, string | string[]> }) => {
    const { id } = getValidatedParams(paramsSchema, params);
    const result = await fetchFn(id);
    
    if (!result) {
      return NextResponse.json(
        error(ERROR_CODES.NOT_FOUND, notFoundMessage),
        { status: 404 }
      );
    }
    
    return NextResponse.json(success(result));
  };
}

/**
 * Generic DELETE handler factory for deleting resources by ID
 * Eliminates duplication in parameter validation and error handling
 */
export function createDeleteHandler<T>(
  deleteFn: (id: number) => Promise<T | null>,
  paramsSchema: ZodSchema,
  notFoundMessage: string,
  successMessage: string
) {
  return async (request: NextRequest, { params }: { params: Record<string, string | string[]> }) => {
    const { id } = getValidatedParams(paramsSchema, params);
    const result = await deleteFn(id);
    
    if (!result) {
      return NextResponse.json(
        error(ERROR_CODES.NOT_FOUND, notFoundMessage),
        { status: 404 }
      );
    }
    
    return NextResponse.json(success({ 
      message: successMessage,
      deleted: result 
    }));
  };
}

/**
 * Generic GET handler factory for fetching collections with filtering
 * Useful for endpoints like GET /projects/:id/tasks
 */
export function createGetCollectionHandler<T>(
  fetchFn: (id: number) => Promise<T[]>,
  paramsSchema: ZodSchema,
  parentNotFoundFn?: (id: number) => Promise<boolean>
) {
  return async (request: NextRequest, { params }: { params: Record<string, string | string[]> }) => {
    const { id } = getValidatedParams(paramsSchema, params);
    
    // Optional: Check if parent resource exists
    if (parentNotFoundFn) {
      const parentExists = await parentNotFoundFn(id);
      if (!parentExists) {
        return NextResponse.json(
          error(ERROR_CODES.NOT_FOUND, 'Parent resource not found'),
          { status: 404 }
        );
      }
    }
    
    const results = await fetchFn(id);
    return NextResponse.json(success(results));
  };
}

/**
 * Generic handler factory for operations requiring multiple parameters
 * Useful for nested resources like /projects/:id/tasks/:taskId
 */
export function createNestedResourceHandler<T, P extends Record<string, string | number>>(
  operation: (params: P) => Promise<T | null>,
  paramsSchema: ZodSchema<P>,
  notFoundMessage: string
) {
  return async (request: NextRequest, { params }: { params: Record<string, string | string[]> }) => {
    const validatedParams = getValidatedParams(paramsSchema, params);
    const result = await operation(validatedParams);
    
    if (!result) {
      return NextResponse.json(
        error(ERROR_CODES.NOT_FOUND, notFoundMessage),
        { status: 404 }
      );
    }
    
    return NextResponse.json(success(result));
  };
}

/**
 * Generic GET handler for nested resources that only need one ID
 * Useful for tasks where we only need taskId: /projects/:id/tasks/:taskId
 */
export function createNestedGetHandler<T>(
  fetchFn: (id: number) => Promise<T | null>,
  paramsSchema: ZodSchema,
  notFoundMessage: string,
  idField: string = 'taskId'
) {
  return async (request: NextRequest, { params }: { params: Record<string, string | string[]> }) => {
    const validatedParams = getValidatedParams(paramsSchema, params);
    const id = validatedParams[idField];
    const result = await fetchFn(id);
    
    if (!result) {
      return NextResponse.json(
        error(ERROR_CODES.NOT_FOUND, notFoundMessage),
        { status: 404 }
      );
    }
    
    return NextResponse.json(success(result));
  };
}

/**
 * Generic DELETE handler for nested resources that only need one ID
 */
export function createNestedDeleteHandler<T>(
  deleteFn: (id: number) => Promise<T | null>,
  paramsSchema: ZodSchema,
  notFoundMessage: string,
  successMessage: string,
  idField: string = 'taskId'
) {
  return async (request: NextRequest, { params }: { params: Record<string, string | string[]> }) => {
    const validatedParams = getValidatedParams(paramsSchema, params);
    const id = validatedParams[idField];
    const result = await deleteFn(id);
    
    if (!result) {
      return NextResponse.json(
        error(ERROR_CODES.NOT_FOUND, notFoundMessage),
        { status: 404 }
      );
    }
    
    return NextResponse.json(success({ 
      message: successMessage,
      deleted: result 
    }));
  };
}

/**
 * Utility type for handler configuration
 */
export interface HandlerConfig<T> {
  schema: ZodSchema;
  operation: (id: number) => Promise<T | null>;
  messages: {
    notFound: string;
    success?: string;
  };
}

/**
 * Factory function to create both GET and DELETE handlers with shared config
 */
export function createResourceHandlers<T>(config: HandlerConfig<T>) {
  const getHandler = createGetHandler(
    config.operation,
    config.schema,
    config.messages.notFound
  );
  
  const deleteHandler = createDeleteHandler(
    config.operation,
    config.schema,
    config.messages.notFound,
    config.messages.success || 'Resource deleted successfully'
  );
  
  return { getHandler, deleteHandler };
}

/**
 * Date validation helper for CREATE operations
 */
function validateDates(data: Record<string, any>, dateFields: string[]): DateValidationResult {
  for (const field of dateFields) {
    if (data[field]) {
      const validation = validateDateNotInPast(data[field], field);
      if (!validation.isValid) {
        return validation;
      }
    }
  }
  return { isValid: true };
}

/**
 * Generic CREATE handler factory for POST operations
 * Handles body validation, date validation, and resource creation
 */
export function createCreateHandler<TBody, TResult>(
  createFn: (data: TBody) => Promise<TResult>,
  bodySchema: ZodSchema<TBody>,
  dateFields: string[] = []
) {
  return async (request: NextRequest) => {
    const body = await getValidatedBody(request, bodySchema);
    
    // Validate dates are not in the past
    const dateValidation = validateDates(body as Record<string, any>, dateFields);
    if (!dateValidation.isValid) {
      return NextResponse.json(
        error(ERROR_CODES.VALIDATION_ERROR, dateValidation.error!),
        { status: 400 }
      );
    }
    
    const result = await createFn(body);
    return NextResponse.json(success(result), { status: 201 });
  };
}

/**
 * Generic CREATE handler factory for nested resources
 * Handles params validation, body validation, date validation, and resource creation
 */
export function createNestedCreateHandler<TBody, TResult>(
  createFn: (params: Record<string, any>, data: TBody) => Promise<TResult>,
  paramsSchema: ZodSchema,
  bodySchema: ZodSchema<TBody>,
  dateFields: string[] = []
) {
  return async (request: NextRequest, { params }: { params: Record<string, string | string[]> }) => {
    const validatedParams = getValidatedParams(paramsSchema, params);
    const body = await getValidatedBody(request, bodySchema);
    
    // Validate dates are not in the past
    const dateValidation = validateDates(body as Record<string, any>, dateFields);
    if (!dateValidation.isValid) {
      return NextResponse.json(
        error(ERROR_CODES.VALIDATION_ERROR, dateValidation.error!),
        { status: 400 }
      );
    }
    
    const result = await createFn(validatedParams, body);
    return NextResponse.json(success(result), { status: 201 });
  };
}

/**
 * Generic REORDER handler factory for simple reorder operations
 * Handles body validation and reorder operation
 */
export function createReorderHandler<TBody, TResult>(
  reorderFn: (data: TBody) => Promise<TResult>,
  bodySchema: ZodSchema<TBody>
) {
  return async (request: NextRequest) => {
    const body = await getValidatedBody(request, bodySchema);
    const result = await reorderFn(body);
    
    return NextResponse.json(success({
      success: true,
      result
    }));
  };
}

/**
 * Generic REORDER handler factory for nested reorder operations
 * Handles params validation, body validation, parent existence check, and reorder operation
 */
export function createNestedReorderHandler<TBody, TResult>(
  reorderFn: (parentId: number, data: TBody) => Promise<TResult>,
  paramsSchema: ZodSchema,
  bodySchema: ZodSchema<TBody>,
  parentExistsFn?: (id: number) => Promise<boolean>,
  parentNotFoundMessage: string = 'Parent resource not found'
) {
  return async (request: NextRequest, { params }: { params: Record<string, string | string[]> }) => {
    const { id: parentId } = getValidatedParams(paramsSchema, params);
    const body = await getValidatedBody(request, bodySchema);
    
    // Check if parent resource exists
    if (parentExistsFn) {
      const exists = await parentExistsFn(parentId);
      if (!exists) {
        return NextResponse.json(
          error(ERROR_CODES.NOT_FOUND, parentNotFoundMessage),
          { status: 404 }
        );
      }
    }
    
    const result = await reorderFn(parentId, body);
    
    return NextResponse.json(success({
      success: true,
      result
    }));
  };
}

/**
 * Generic UPDATE handler factory for PUT operations
 * Handles params validation, body validation, date validation, and resource update
 */
export function createUpdateHandler<TBody, TResult>(
  updateFn: (id: number, data: TBody) => Promise<TResult | null>,
  paramsSchema: ZodSchema,
  bodySchema: ZodSchema<TBody>,
  dateFields: string[] = [],
  notFoundMessage: string = 'Resource not found'
) {
  return async (request: NextRequest, { params }: { params: Record<string, string | string[]> }) => {
    const { id } = getValidatedParams(paramsSchema, params);
    const body = await getValidatedBody(request, bodySchema);
    
    // Validate dates are not in the past
    const dateValidation = validateDates(body as Record<string, any>, dateFields);
    if (!dateValidation.isValid) {
      return NextResponse.json(
        error(ERROR_CODES.VALIDATION_ERROR, dateValidation.error!),
        { status: 400 }
      );
    }
    
    const result = await updateFn(id, body);
    
    if (!result) {
      return NextResponse.json(
        error(ERROR_CODES.NOT_FOUND, notFoundMessage),
        { status: 404 }
      );
    }
    
    return NextResponse.json(success(result));
  };
}

/**
 * Generic UPDATE handler factory for nested resources
 * Handles params validation, body validation, date validation, and nested resource update
 */
export function createNestedUpdateHandler<TBody, TResult>(
  updateFn: (id: number, data: TBody) => Promise<TResult | null>,
  paramsSchema: ZodSchema,
  bodySchema: ZodSchema<TBody>,
  dateFields: string[] = [],
  notFoundMessage: string = 'Resource not found',
  idField: string = 'taskId'
) {
  return async (request: NextRequest, { params }: { params: Record<string, string | string[]> }) => {
    const validatedParams = getValidatedParams(paramsSchema, params);
    const body = await getValidatedBody(request, bodySchema);
    
    // Validate dates are not in the past
    const dateValidation = validateDates(body as Record<string, any>, dateFields);
    if (!dateValidation.isValid) {
      return NextResponse.json(
        error(ERROR_CODES.VALIDATION_ERROR, dateValidation.error!),
        { status: 400 }
      );
    }
    
    const id = validatedParams[idField];
    const result = await updateFn(id, body);
    
    if (!result) {
      return NextResponse.json(
        error(ERROR_CODES.NOT_FOUND, notFoundMessage),
        { status: 404 }
      );
    }
    
    return NextResponse.json(success(result));
  };
}