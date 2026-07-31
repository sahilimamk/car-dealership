import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';

const BASE = 'https://car-dealership-teal-seven.vercel.app';
const OUT  = './screenshots';

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page    = await context.newPage();

async function shot(name, fn) {
  console.log(`📸  ${name}...`);
  await fn(page);
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  console.log(`    saved ${OUT}/${name}.png`);
}

// 1. Home / Inventory dashboard (not logged in)
await shot('01-inventory-dashboard', async (p) => {
  await p.goto(BASE, { waitUntil: 'networkidle' });
});

// 2. Login page
await shot('02-login-page', async (p) => {
  await p.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
});

// 3. Register page
await shot('03-register-page', async (p) => {
  await p.goto(`${BASE}/register`, { waitUntil: 'networkidle' });
});

// 4. Log in as admin then take dashboard with stats banner
await shot('04-admin-dashboard', async (p) => {
  await p.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await p.fill('input[name="username"]', 'admin');
  await p.fill('input[name="password"]', 'Admin123!');
  await p.click('button[type="submit"]');
  await p.waitForURL(BASE + '/', { timeout: 10000 });
  await p.waitForTimeout(2000);
});

// 5. Stats banner close-up (scroll to top)
await shot('05-stats-banner', async (p) => {
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(500);
});

// 6. Inventory grid with vehicle cards
await shot('06-vehicle-cards', async (p) => {
  await p.evaluate(() => window.scrollTo(0, 400));
  await p.waitForTimeout(500);
});

// 7. Filter sidebar
await shot('07-filter-sidebar', async (p) => {
  await p.evaluate(() => window.scrollTo(0, 300));
  await p.waitForTimeout(500);
});

// 8. Search in action
await shot('08-search', async (p) => {
  await p.evaluate(() => window.scrollTo(0, 0));
  const searchInput = p.locator('input[placeholder*="Search"]').first();
  await searchInput.fill('Toyota');
  await p.waitForTimeout(800);
});

// 9. Add vehicle modal (admin only)
await shot('09-add-vehicle-modal', async (p) => {
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(300);
  const addBtn = p.locator('button:has-text("Add New Vehicle")');
  if (await addBtn.isVisible()) {
    await addBtn.click();
    await p.waitForTimeout(600);
  }
});

// 10. About page
await shot('10-about-page', async (p) => {
  await p.goto(`${BASE}/about`, { waitUntil: 'networkidle' });
});

await browser.close();
console.log('\n✅  All screenshots saved to ./screenshots/');
