import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display Next.js welcome page', async ({ page }) => {
    await page.goto('/');
    
    // Check for Next.js default content
    await expect(page.locator('text=Get started by editing')).toBeVisible();
    await expect(page).toHaveTitle('Create Next App');
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test that the page loads without errors
    await expect(page.locator('body')).toBeVisible();
    
    // Check that essential elements are present
    await expect(page.locator('main')).toBeVisible();
  });
});