import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { error, validationError, ERROR_CODES } from './types';

// Error handling wrapper for API routes
export function withErrorHandling<T>(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (err) {
      console.error('API Error:', err);

      // Handle validation errors
      if (err instanceof z.ZodError) {
        return NextResponse.json(
          validationError(err.issues),
          { status: 400 }
        );
      }

      // Handle known application errors
      if (err instanceof Error) {
        // Database constraint violations
        if (err.message.includes('FOREIGN KEY constraint failed')) {
          return NextResponse.json(
            error(ERROR_CODES.CONSTRAINT_VIOLATION, 'Related record not found'),
            { status: 400 }
          );
        }

        // Unique constraint violations
        if (err.message.includes('UNIQUE constraint failed')) {
          return NextResponse.json(
            error(ERROR_CODES.CONSTRAINT_VIOLATION, 'Duplicate record'),
            { status: 409 }
          );
        }
      }

      // Generic internal error
      return NextResponse.json(
        error(ERROR_CODES.INTERNAL_ERROR, 'An unexpected error occurred'),
        { status: 500 }
      );
    }
  };
}

// Validation middleware
export function withValidation<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest): Promise<T> => {
    const body = await request.json();
    return schema.parse(body);
  };
}

// Parse route parameters
export function parseParams<T>(schema: z.ZodSchema<T>, params: any): T {
  return schema.parse(params);
}

// Helper to get request body with validation
export async function getValidatedBody<T>(
  request: NextRequest, 
  schema: z.ZodSchema<T>
): Promise<T> {
  const body = await request.json();
  return schema.parse(body);
}

// Helper to validate URL parameters
export function getValidatedParams<T>(
  schema: z.ZodSchema<T>, 
  params: any
): T {
  return schema.parse(params);
}