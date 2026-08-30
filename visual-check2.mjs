import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto("http://localhost:5173/admin/login", { waitUntil: "networkidle" });
await page.fill('input[type="password"]', "crochet2026");
await page.click('button[type="submit"]');
await page.waitForLoadState("networkidle");
const tabs = await page.$$(".admin-tab");
for (const t of tabs) {
  const text = await t.textContent();
  if (text?.trim().toLowerCase().includes("content")) { await t.click(); break; }
}
await page.waitForTimeout(500);
const el = await page.$(".admin-fieldset:has(legend:text('Theme Colors'))");
await el.screenshot({ path: "C:\\Users\\ADMINI~1\\AppData\\Local\\Temp\\claude\\C--Users-Administrator\\9890efb4-d573-4a46-9f0c-551e6021296f\\scratchpad\\08-theme-zoom.png" });
const vals = await page.$$eval(".admin-fieldset:has(legend:text('Theme Colors')) input[type=color]", (els) => els.map(e => e.value));
console.log("VALUES", vals);
await browser.close();
