// SPDX-License-Identifier: LicenseRef-CityLegends-Proprietary-Software

import { test, expect } from '@playwright/test';

test('Flow: Home → Auth (login) → Lobby → Create Room → Join Room → Play', async ({ page }) => {
  // Home
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /City Legends/i })).toBeVisible();

  // Auth
  await page.getByRole('link', { name: /Auth/i }).click();
  await expect(page.getByRole('heading', { name: /Auth/i })).toBeVisible();

  await page.getByLabel(/Email/i).fill('qa@example.com');
  await page.getByLabel(/Password/i).fill('secret123');
  await page.getByRole('button', { name: /Sign in/i }).click();

  // Lobby
  await expect(page.getByRole('heading', { name: /Lobby/i })).toBeVisible();
  await expect(page).toHaveURL(/\/lobby$/);

  // Create Room
  await page.getByRole('button', { name: /Create Room/i }).click();

  // Room
  await expect(page).toHaveURL(/\/room\/\d+$/);
  await expect(page.getByRole('heading', { name: /Room/i })).toBeVisible();

  // Join Room
  await page.getByRole('button', { name: /Join/i }).click();

  // Play
  await expect(page).toHaveURL(/\/play\/\d+$/);
  await expect(page.getByRole('heading', { name: /Play/i })).toBeVisible();
});
