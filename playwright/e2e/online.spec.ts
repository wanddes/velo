import { test, expect } from '@playwright/test'

test('webapp deve estar online', async ({ page }) => {
  await page.goto('http://localhost:5173')

  await expect(page).toHaveTitle(/Velô by Papito/)
  await expect(page.getByTestId('header-logo')).toBeVisible()
  await expect(page.getByTestId('header-nav')).toBeVisible()
  await expect(page.getByTestId('header-cta')).toBeVisible()
  await expect(page.getByTestId('hero-section')).toBeVisible()
  await expect(page.getByTestId('specs-section')).toBeVisible()
  await expect(page.getByTestId('cta-section')).toBeVisible()
  await expect(page.getByTestId('faq-section')).toBeVisible()
  await expect(page.getByTestId('footer')).toBeVisible()
})
