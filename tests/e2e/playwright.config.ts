// SPDX-License-Identifier: LicenseRef-CityLegends-Proprietary-Software

import { defineConfig } from '@playwright/test';
import path from 'path';

const isWin = process.platform === 'win32';
const py = isWin ? 'py' : 'python';

export default defineConfig({
  testDir: __dirname,
  timeout: 30000,
  use: {
    baseURL: 'http://127.0.0.1:5001',
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: `${py} ${path.join(__dirname, 'mock_server.py')}`,
    url: 'http://127.0.0.1:5001',
    reuseExistingServer: !process.env.CI,
    timeout: 30000
  },
  reporter: [
    ['html', { open: 'never' }]
  ]
});
