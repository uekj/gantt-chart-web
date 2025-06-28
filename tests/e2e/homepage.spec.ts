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
    
    // Test navigation to Next.js documentation link
    const docsLink = page.locator('a', { hasText: 'Docs' }).first();
    if (await docsLink.count() > 0) {
      // Store current URL
      const currentUrl = page.url();
      
      // Click the docs link and verify navigation
      await docsLink.click();
      
      // Wait for navigation and verify URL changed or new tab opened
      await page.waitForTimeout(1000);
      
      // If still on same page, verify it's because link opens in new tab
      if (page.url() === currentUrl) {
        await expect(docsLink).toHaveAttribute('target', '_blank');
      }
    }
    
    // Test browser navigation (back/forward)
    await page.goBack();
    await expect(page).toHaveURL('/');
    
    // Verify page content is still accessible after navigation
    await expect(page.locator('text=Get started by editing')).toBeVisible();
  });
});