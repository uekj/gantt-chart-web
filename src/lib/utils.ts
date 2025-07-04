import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatting utilities
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateForInput(date: string | Date): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD format
}

// API utilities
export async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.');
  }
  return res.json();
}

// Validation utilities
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

export function isDateInPast(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  const todayUTC = new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const dateUTC = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return dateUTC < todayUTC;
}

// Date validation utility for API handlers
export interface DateValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateDateNotInPast(dateString: string | undefined, fieldName: string): DateValidationResult {
  if (!dateString) {
    return { isValid: true }; // Optional field, no validation needed
  }
  
  if (!isValidDate(dateString)) {
    return {
      isValid: false,
      error: `${fieldName} must be a valid date`
    };
  }
  
  if (isDateInPast(dateString)) {
    return {
      isValid: false,
      error: `${fieldName} cannot be in the past`
    };
  }
  
  return { isValid: true };
}