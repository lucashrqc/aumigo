import { expect, test } from '@playwright/test'

test('landing page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /find your new best friend/i })).toBeVisible()
})

test('can navigate to the pet browse page', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /browse pets/i }).first().click()
  await expect(page).toHaveURL(/\/pets$/)
})

test('login page renders', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByLabel('Password')).toBeVisible()
})

test('unauthenticated users are redirected away from the admin area', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/login/)
})
