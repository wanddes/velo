import { Page, expect } from '@playwright/test'

export type OptionalFeature = 'Precision Park' | 'Flux Capacitor'

export function createConfiguratorActions(page: Page) {
  const optionalCheckbox = (name: OptionalFeature) =>
    page.getByRole('checkbox', { name: new RegExp(`^${name}`) })

  return {
    async open() {
      await page.goto('/configure')
    },

    async selectColor(name: string) {
      await page.getByRole('button', { name }).click()
    },

    async selectWheels(name: string | RegExp) {
      await page.getByRole('button', { name }).click()
    },

    async expectPrice(price: string) {
      const priceElement = page.getByTestId('total-price')
      await expect(priceElement).toBeVisible()
      await expect(priceElement).toHaveText(price)
    },

    async expectCarImageSrc(src: string | RegExp) {
      const carImage = page.locator('img[alt^="Velô Sprint"]')
      await expect(carImage).toHaveAttribute('src', src)
    },

    async checkOptional(name: OptionalFeature) {
      await optionalCheckbox(name).check()
      await expect(optionalCheckbox(name)).toBeChecked()
    },

    async uncheckOptional(name: OptionalFeature) {
      await optionalCheckbox(name).uncheck()
      await expect(optionalCheckbox(name)).not.toBeChecked()
    },

    async goToCheckout() {
      await page.getByRole('button', { name: 'Monte o Seu' }).click()
      await expect(page).toHaveURL(/\/order$/)
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()
    },
  }
}
