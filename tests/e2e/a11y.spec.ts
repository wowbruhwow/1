// SPDX-License-Identifier: LicenseRef-CityLegends-Proprietary-Software

import { test, expect, Page } from '@playwright/test';

/**
 * Обчислення контрасту елемента проти фону (WCAG 2.1).
 * Повертає коефіцієнт контрасту (напр. 4.5 = AA для звичайного тексту).
 */
async function getContrastRatio(page: Page, selector: string): Promise<number> {
  return await page.$eval(selector, (el) => {
    const parseRGB = (value: string): [number, number, number] => {
      if (value === 'transparent') {
        // Вважаємо, що прозорий фон рендериться на білому бекграунді
        return [255, 255, 255];
      }

      const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      if (!match) {
        // fallback: чорний
        return [0, 0, 0];
      }

      const [, r, g, b] = match;
      return [parseInt(r, 10), parseInt(g, 10), parseInt(b, 10)];
    };

    const relativeLuminance = (r: number, g: number, b: number): number => {
      const srgb = [r, g, b].map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
    };

    const style = window.getComputedStyle(el as HTMLElement);
    const color = style.color;
    let bgColor = style.backgroundColor;

    // Якщо фон прозорий, піднімаємося вгору по дереву
    let parent: HTMLElement | null = (el as HTMLElement).parentElement;
    while (bgColor === 'rgba(0, 0, 0, 0)' && parent) {
      const parentStyle = window.getComputedStyle(parent);
      bgColor = parentStyle.backgroundColor;
      parent = parent.parentElement;
    }

    if (bgColor === 'rgba(0, 0, 0, 0)') {
      // якщо так і не знайшли фон, вважаємо, що це білий body
      bgColor = 'rgb(255, 255, 255)';
    }

    const [fr, fg, fb] = parseRGB(color);
    const [br, bg, bb] = parseRGB(bgColor);

    const L1 = relativeLuminance(fr, fg, fb);
    const L2 = relativeLuminance(br, bg, bb);
    const lighter = Math.max(L1, L2);
    const darker = Math.min(L1, L2);

    return (lighter + 0.05) / (darker + 0.05);
  });
}

test.describe('A11y smoke — Home/Auth/Lobby', () => {
  test('Home: семантика, фокус з клавіатури, базовий контраст', async ({ page }) => {
    await page.goto('/');

    const title = page.getByRole('heading', { name: /City Legends/i, level: 1 });
    await expect(title).toBeVisible();

    // Перевіряємо, що перший фокусний елемент з клавіатури — це primary CTA (лінк на Auth)
    await page.keyboard.press('Tab');
    const authLink = page.getByRole('link', { name: /Auth/i });
    await expect(authLink).toBeFocused();

    // Базовий контраст для заголовка і CTA
    const headingContrast = await getContrastRatio(page, 'h1');
    expect(headingContrast).toBeGreaterThanOrEqual(4.5);

    const linkContrast = await getContrastRatio(page, 'a');
    expect(linkContrast).toBeGreaterThanOrEqual(3.0);
  });

  test('Auth: поля з label, стани помилки та alert', async ({ page }) => {
    await page.goto('/auth');

    const email = page.getByLabel(/Email/i);
    const password = page.getByLabel(/Password/i);
    await expect(email).toBeVisible();
    await expect(password).toBeVisible();

    // Тригеримо помилку валідації (порожня форма)
    await page.getByRole('button', { name: /Sign in/i }).click();

    // Перевіряємо, що повідомлення лежить у role="alert"
    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toHaveText(/required/i);
  });

  test('Lobby: заголовок, primary action та фокус з клавіатури + контраст', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /Auth/i }).click();
    await page.getByLabel(/Email/i).fill('qa@example.com');
    await page.getByLabel(/Password/i).fill('secret123');
    await page.getByRole('button', { name: /Sign in/i }).click();

    const lobbyHeading = page.getByRole('heading', { name: /Lobby/i });
    await expect(lobbyHeading).toBeVisible();

    const createRoomBtn = page.getByRole('button', { name: /Create Room/i });
    await expect(createRoomBtn).toBeVisible();

    await page.keyboard.press('Tab');
    await expect(createRoomBtn).toBeFocused();

    const headingContrast = await getContrastRatio(page, 'h1');
    expect(headingContrast).toBeGreaterThanOrEqual(4.5);

    const buttonContrast = await getContrastRatio(page, 'button');
    expect(buttonContrast).toBeGreaterThanOrEqual(3.0);
  });
});

test.describe('A11y smoke — Play Screen', () => {
  test('Play screen has main landmark, heading and status region', async ({ page }) => {
    await page.goto('/play/123?state=idle');

    const main = page.getByRole('main');
    await expect(main).toBeVisible();

    const heading = page.getByRole('heading', { name: /Play/i, level: 1 });
    await expect(heading).toBeVisible();

    const status = page.getByRole('status');
    await expect(status).toBeVisible();
    await expect(status).toHaveText(/waiting/i);
  });

  test('Finished state exposes a result dialog with proper role and name', async ({ page }) => {
    await page.goto('/play/123?state=finished');

    const dialog = page.getByRole('dialog', { name: /match result/i });
    await expect(dialog).toBeVisible();

    await expect(dialog).toContainText(/wins/i);
  });
});
