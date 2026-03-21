import { test, expect } from '@playwright/test'

test.describe('Enterprise App Store', () => {
  test('should display the home page correctly', async ({ page }) => {
    await page.goto('/')
    
    // Check title
    await expect(page).toHaveTitle(/AppStore/)
    
    // Check hero section
    await expect(page.getByText('Your Universal')).toBeVisible()
    await expect(page.getByText('App Store')).toBeVisible()
    
    // Check navigation
    await expect(page.getByText('Home')).toBeVisible()
    await expect(page.getByText('Explore')).toBeVisible()
  })

  test('should navigate to explore page', async ({ page }) => {
    await page.goto('/')
    
    await page.getByText('Explore').click()
    await expect(page).toHaveURL('/explore')
    await expect(page.getByText('Explore Apps')).toBeVisible()
  })

  test('should search for apps', async ({ page }) => {
    await page.goto('/explore')
    
    const searchInput = page.getByPlaceholder(/search/i)
    await searchInput.fill('DataFlow')
    await expect(page.getByText('DataFlow')).toBeVisible()
  })

  test('should display app details', async ({ page }) => {
    await page.goto('/')
    
    // Click on first app card
    await page.getByRole('button', { name: /get app/i }).first().click()
    
    // Wait for modal
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('should navigate to downloads page', async ({ page }) => {
    await page.goto('/')
    
    await page.getByText('Downloads').click()
    await expect(page).toHaveURL('/downloads')
    await expect(page.getByText('Downloads')).toBeVisible()
  })

  test('should navigate to profile page', async ({ page }) => {
    await page.goto('/')
    
    await page.getByText('Profile').click()
    await expect(page).toHaveURL('/profile')
    await expect(page.getByText('Profile')).toBeVisible()
  })

  test('should navigate to settings page', async ({ page }) => {
    await page.goto('/')
    
    await page.getByText('Settings').click()
    await expect(page).toHaveURL('/settings')
    await expect(page.getByText('Settings')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Check mobile navigation is visible
    await expect(page.getByRole('navigation')).toBeVisible()
    
    // Check menu button
    await expect(page.getByRole('button', { name: /menu/i })).toBeVisible()
  })

  test('should open and close sidebar on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Open sidebar
    await page.getByRole('button', { name: /menu/i }).click()
    await expect(page.getByText('AppStore')).toBeVisible()
    
    // Close sidebar
    await page.getByRole('button', { name: /close/i }).click()
  })

  test('should display categories', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.getByText('Categories')).toBeVisible()
    await expect(page.getByText('All Apps')).toBeVisible()
    await expect(page.getByText('Web Apps')).toBeVisible()
  })

  test('should filter by category', async ({ page }) => {
    await page.goto('/explore')
    
    // Click on a category
    await page.getByText('Web Apps').click()
    
    // Wait for filter to apply
    await page.waitForTimeout(500)
    
    // Check results updated
    const appsFound = await page.getByText(/apps? found/).isVisible()
    expect(appsFound).toBe(true)
  })
})
