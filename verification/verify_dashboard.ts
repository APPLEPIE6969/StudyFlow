import { chromium } from 'playwright';

async function verifyDashboard() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the dashboard (assuming localhost:3000)
    // Note: Since auth is required, we might hit the login page first.
    // However, for a quick check of the component, we might need to mock auth or check if the component renders.
    // Given the complexity of mocking next-auth in a simple script, we'll try to reach the page.
    // If redirected to login, we'll take a screenshot there too, but ideally we'd want to see the dashboard.

    // Attempt to set a fake session cookie if possible, or just navigate and see.
    // For now, let's just go to the dashboard and wait a bit.
    await page.goto('http://localhost:3000/dashboard');

    // Wait for network idle to ensure content loads
    await page.waitForLoadState('networkidle');

    // Take a screenshot
    await page.screenshot({ path: 'verification/dashboard_view.png', fullPage: true });

    console.log('Screenshot taken at verification/dashboard_view.png');

  } catch (error) {
    console.error('Error verifying dashboard:', error);
  } finally {
    await browser.close();
  }
}

verifyDashboard();
