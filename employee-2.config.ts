import { PlaywrightTestConfig } from '@playwright/test';
import { GetBaseConfig } from 'cxone-playwright-test-utils';

// if (!process.env.PLAYWRIGHT_BASE_URL) {
//     //process.env.PLAYWRIGHT_BASE_URL = 'http://na1.dev.localhost:8088';
//     process.env.PLAYWRIGHT_BASE_URL = 'https://na1.test.nice-incontact.com';
// }

process.env.TM_LOGIN_EMAIL_ADDRESS = 'webapp_automation_user_tm_admin@nice.com';
process.env.TM_LOGIN_PASSWORD = 'Biq6LD2g1fN$';

const config: PlaywrightTestConfig = {
  ...GetBaseConfig('employee-2-suite'),
  globalSetup: require.resolve('./employee-2.setup.ts'),
  use: {
    // Browser options
    headless: process.env.SUITE_DIR ? true : true,
    ignoreHTTPSErrors: true,
    timezoneId: 'Asia/Jerusalem',

    trace: 'retain-on-failure',
    // Artifacts
    screenshot: 'only-on-failure',
    video: 'on-first-retry'
  },
  timeout: 60000 * 4
};

export default config;
