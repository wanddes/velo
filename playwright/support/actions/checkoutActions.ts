import { Page, expect } from '@playwright/test'

export function createCheckoutActions(page: Page) {
  return {
    async expectSummaryItem(label: string, value: string) {
      const item = page.getByRole('listitem').filter({ hasText: label })
      await expect(item).toContainText(value)
    },

    async expectTotalPrice(price: string) {
      await expect(page.getByTestId('summary-total-price')).toHaveText(price)
    },
  }
}
