import { chromium } from "playwright";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: "C:/Users/Administrator/Downloads/projects/crochet-shop/server/.env" });

const PASSWORD = process.env.ADMIN_PASSWORD;
if (!PASSWORD) {
  console.error("FAIL: ADMIN_PASSWORD not found in server/.env");
  process.exit(1);
}

const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage();
page.on("pageerror", (err) => errors.push(`[pageerror] ${err.message}`));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(`[console.error] ${msg.text()}`);
});
page.on("dialog", (d) => d.accept());

async function report(step) {
  console.log(`-- ${step} --`);
}

try {
  await report("navigate to admin login");
  await page.goto("http://localhost:5173/admin/login", { waitUntil: "networkidle" });

  await page.fill("#admin-password", PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/admin", { timeout: 10000 });
  await report("logged in, on dashboard");

  await page.click('button:has-text("Sections")');
  await page.waitForTimeout(800);
  const sectionsText = await page.locator(".admin-section-manager").isVisible().catch(() => false);
  await report(`Sections tab visible: ${sectionsText}`);

  const toggle = page.locator(".admin-section-row .admin-switch").first();
  if (await toggle.count()) {
    await toggle.click();
    await page.waitForTimeout(200);
    await toggle.click(); // revert — this script must not leave persisted state changed
    await page.click('.admin-section-manager button:has-text("Save Sections")');
    await page.waitForTimeout(1000);
    await report("toggled first section on/off (reverted) + saved no-op");
  }

  await page.click('button:has-text("Tags")');
  await page.waitForTimeout(800);
  const tagsVisible = await page.locator(".admin-tag-manager").isVisible().catch(() => false);
  await report(`Tags tab visible: ${tagsVisible}`);

  await page.fill(".admin-tag-add input", "TestTagXYZ");
  await page.click('.admin-tag-add button:has-text("Add Tag")');
  await page.waitForTimeout(400);
  await page.click('.admin-tag-manager button:has-text("Save Tags")');
  await page.waitForTimeout(1000);
  await report("added TestTagXYZ tag + saved");

  const removeBtn = page.locator(".admin-tag-chip", { hasText: "TestTagXYZ" }).locator("button");
  if (await removeBtn.count()) {
    await removeBtn.click();
    await page.click('.admin-tag-manager button:has-text("Save Tags")');
    await page.waitForTimeout(1000);
    await report("removed TestTagXYZ tag + saved (cleanup)");
  }

  await page.click('button:has-text("Products")');
  await page.waitForTimeout(500);
  await report("Products tab loaded (tag dropdown check)");

  // multi-image product create
  await page.fill('.admin-product-form label:has-text("Name") input', "Playwright Test Product");
  await page.fill('.admin-product-form label:has-text("Category") input', "TestCategory");
  await page.fill('.admin-product-form label:has-text("Price") input', "123");
  const fileInput = page.locator('.admin-product-form input[type="file"]');
  await fileInput.setInputFiles(["test-image.png", "test-image.png"]);
  await page.waitForTimeout(2000);
  const imageCount = await page.locator(".admin-image-grid-item").count();
  await report(`uploaded images, grid item count: ${imageCount}`);

  await page.click('.admin-product-form button:has-text("Add Product")');
  await page.waitForTimeout(1500);
  await report("created multi-image product");

  const newRow = page.locator("tr", { hasText: "Playwright Test Product" });
  if (await newRow.count()) {
    await newRow.locator('button:has-text("Delete")').click();
    await page.waitForTimeout(1000);
    await report("cleaned up test product");
  }

  await page.click('button:has-text("Site Content")');
  await page.waitForTimeout(500);
  const testimonialPhotoInput = page.locator(".admin-testimonial-photo input[type='file']").first();
  if (await testimonialPhotoInput.count()) {
    await testimonialPhotoInput.setInputFiles("test-image.png");
    await page.waitForTimeout(1500);
    const avatarPreview = await page.locator(".admin-image-preview-round").count();
    await report(`testimonial photo uploaded, preview count: ${avatarPreview}`);
  }

  await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await report("homepage loaded");

  const firstCard = page.locator(".product-card").first();
  await firstCard.hover();
  await page.waitForTimeout(300);
  await report("hovered first product card (checking for slider arrows / crash)");

  const firstLink = page.locator(".product-card-link").first();
  await firstLink.click();
  await page.waitForURL("**/product/**", { timeout: 5000 });
  await page.waitForTimeout(500);
  await report("opened product detail page");
} catch (err) {
  errors.push(`[test error] ${err.message}`);
}

await browser.close();

console.log("\n=== CONSOLE/PAGE ERRORS ===");
if (errors.length === 0) {
  console.log("none");
} else {
  errors.forEach((e) => console.log(e));
}
process.exit(errors.length ? 1 : 0);
