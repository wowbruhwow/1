// SPDX-License-Identifier: LicenseRef-CityLegends-Proprietary-Software

import { test, expect } from '@playwright/test';

// У CI (GitHub Actions) візуальні снапшоти можуть падати через різні шрифти/рендерінг.
// Тому в CI ми їх скіпаємо, а реально перевіряємо локально.
test.skip(!!process.env.CI, 'Visual snapshot tests are only enforced locally (skipped on CI).');

test.describe('Visual snapshots — ключові екрани', () => {
  test('Home: базовий снапшот', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveScreenshot('home.png', {
      fullPage: true
    });
  });

  test('Auth → Lobby: базові стейти UI', async ({ page }) => {
    await page.goto('/auth');
    await page.getByLabel(/Email/i).fill('qa@example.com');
    await page.getByLabel(/Password/i).fill('secret123');
    await page.getByRole('button', { name: /Sign in/i }).click();
    await expect(page.getByRole('heading', { name: /Lobby/i })).toBeVisible();

    await expect(page).toHaveScreenshot('lobby.png', {
      fullPage: true
    });
  });

  test('Play Screen — idle state', async ({ page }) => {
    await page.goto('/play/123?state=idle');

    await expect(page).toHaveScreenshot('play-idle.png', {
      fullPage: true
    });
  });

  test('Play Screen — myTurn state', async ({ page }) => {
    await page.goto('/play/123?state=myTurn');

    await expect(page).toHaveScreenshot('play-myTurn.png', {
      fullPage: true
    });
  });

  test('Play Screen — finished state', async ({ page }) => {
    await page.goto('/play/123?state=finished');

    await expect(page).toHaveScreenshot('play-finished.png', {
      fullPage: true
    });
  });
});
