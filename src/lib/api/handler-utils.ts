import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { success, error, ERROR_CODES } from './types';
import { getValidatedParams } from './middleware';

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