import { describe, it, expect } from 'vitest';

describe('Example Unit Test', () => {
  it('should pass basic math test', () => {
    expect(2 + 2).toBe(4);
  });

  it('should handle string operations', () => {
    const testString = 'Gantt Chart App';
    expect(testString).toContain('Gantt');
    expect(testString.length).toBeGreaterThan(0);
  });
});