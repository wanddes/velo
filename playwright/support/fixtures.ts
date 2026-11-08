import { test as base } from '@playwright/test'

import { createCheckoutActions } from './actions/checkoutActions'
import { createConfiguratorActions } from './actions/configuratorActions'
import { createHeroActions } from './actions/heroActions'
import { createOrderLookupActions } from './actions/orderLookupActions'

import { mockCreditAnalysis } from './mock.api'

type App = {
  checkout: ReturnType<typeof createCheckoutActions>
  configurator: ReturnType<typeof createConfiguratorActions>
  hero: ReturnType<typeof createHeroActions>
  orderLookup: ReturnType<typeof createOrderLookupActions>
  mock: {
    creditAnalysis: (score: number) => Promise<void>
  }
}

export const test = base.extend<{ app: App }>({
  app: async ({ page }, use) => {
    const app: App = {
      checkout: createCheckoutActions(page),
      configurator: createConfiguratorActions(page),
      hero: createHeroActions(page),
      orderLookup: createOrderLookupActions(page),
      mock: {
        creditAnalysis: async (score: number) => await mockCreditAnalysis(page, score),
      },
    }
    await use(app)
  },
})

export { expect } from '@playwright/test'
