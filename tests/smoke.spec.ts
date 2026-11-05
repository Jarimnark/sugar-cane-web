import { test, expect, Page } from "@playwright/test";

const BASE = "http://localhost:3000";
const DEV_COOKIE = {
  name: "session_id",
  value: "dev_session_token_1234567890abcdef0000000000000000",
  domain: "localhost",
  path: "/",
};
const UUID = "c3333333-0000-0000-0000-000000000001"; // seed: Neon Runner, owned by test user

type RouteObservation = {
  path: string;
  status: number;
  consoleErrors: string[];
  failedRequests: Array<{ url: string; status: number | string }>;
};

async function visit(page: Page, path: string): Promise<RouteObservation> {
  const consoleErrors: string[] = [];
  const failedRequests: Array<{ url: string; status: number | string }> = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("requestfailed", (req) =>
    failedRequests.push({ url: req.url(), status: req.failure()?.errorText ?? "failed" }),
  );
  page.on("response", (resp) => {
    if (resp.status() >= 400 && resp.url().includes("/api/v1/")) {
      failedRequests.push({ url: resp.url(), status: resp.status() });
    }
  });

  const resp = await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
  return {
    path,
    status: resp?.status() ?? 0,
    consoleErrors,
    failedRequests,
  };
}

test.describe.configure({ mode: "serial" });

test.describe("Public (no cookie)", () => {
  test("home renders games", async ({ page }) => {
    const obs = await visit(page, "/");
    expect(obs.status).toBe(200);
    const headings = await page.locator("h1, h2").allInnerTexts();
    console.log(`[/] headings:`, headings);
    console.log(`[/] console errors:`, obs.consoleErrors);
    console.log(`[/] failed /api/v1 requests:`, obs.failedRequests);
    await page.screenshot({ path: "tests/_shots/01-home.png", fullPage: true });
  });

  test("browse", async ({ page }) => {
    const obs = await visit(page, "/browse");
    expect(obs.status).toBe(200);
    const bodyText = (await page.locator("body").innerText()).slice(0, 500);
    console.log(`[/browse] body preview:`, bodyText);
    console.log(`[/browse] console errors:`, obs.consoleErrors);
    console.log(`[/browse] failed /api/v1 requests:`, obs.failedRequests);
    await page.screenshot({ path: "tests/_shots/02-browse.png", fullPage: true });
  });

  test("game detail (by UUID)", async ({ page }) => {
    const obs = await visit(page, `/games/${UUID}`);
    expect(obs.status).toBe(200);
    const h1 = await page.locator("h1").first().innerText();
    console.log(`[/games/${UUID}] h1:`, h1);
    const commentsHeading = await page
      .locator('h2:has-text("Comments")')
      .first()
      .innerText()
      .catch(() => "<missing>");
    console.log(`[/games/${UUID}] comments heading:`, commentsHeading);
    console.log(`[/games/${UUID}] console errors:`, obs.consoleErrors);
    console.log(`[/games/${UUID}] failed /api/v1 requests:`, obs.failedRequests);
    await page.screenshot({ path: "tests/_shots/03-game-detail.png", fullPage: true });
  });

  test("login page", async ({ page }) => {
    const obs = await visit(page, "/login");
    expect(obs.status).toBe(200);
    const buttons = await page.locator("button, a").allInnerTexts();
    console.log(`[/login] buttons:`, buttons.filter((t) => t.trim()));
    await page.screenshot({ path: "tests/_shots/04-login.png", fullPage: true });
  });
});

test.describe("Authed (dev cookie)", () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([DEV_COOKIE]);
  });

  test("home with session", async ({ page }) => {
    const obs = await visit(page, "/");
    expect(obs.status).toBe(200);
    console.log(`[/ authed] failed /api/v1:`, obs.failedRequests);
    await page.screenshot({ path: "tests/_shots/05-home-authed.png", fullPage: true });
  });

  test("my-list", async ({ page }) => {
    const obs = await visit(page, "/my-list");
    expect(obs.status).toBe(200);
    const bodyText = (await page.locator("body").innerText()).slice(0, 500);
    console.log(`[/my-list] body preview:`, bodyText);
    console.log(`[/my-list] console errors:`, obs.consoleErrors);
    console.log(`[/my-list] failed /api/v1:`, obs.failedRequests);
    await page.screenshot({ path: "tests/_shots/06-my-list.png", fullPage: true });
  });

  test("games/mine", async ({ page }) => {
    const obs = await visit(page, "/games/mine");
    expect(obs.status).toBe(200);
    const rows = await page.locator("article, h3").allInnerTexts();
    console.log(`[/games/mine] rows:`, rows);
    console.log(`[/games/mine] console errors:`, obs.consoleErrors);
    console.log(`[/games/mine] failed /api/v1:`, obs.failedRequests);
    await page.screenshot({ path: "tests/_shots/07-games-mine.png", fullPage: true });
  });

  test("games/new (form)", async ({ page }) => {
    const obs = await visit(page, "/games/new");
    expect(obs.status).toBe(200);
    const inputs = await page.locator("input, textarea, select").count();
    console.log(`[/games/new] input count:`, inputs);
    console.log(`[/games/new] console errors:`, obs.consoleErrors);
    console.log(`[/games/new] failed /api/v1:`, obs.failedRequests);
    await page.screenshot({ path: "tests/_shots/08-games-new.png", fullPage: true });
  });

  test("settings", async ({ page }) => {
    const obs = await visit(page, "/settings");
    expect(obs.status).toBe(200);
    const nameValue = await page.locator('#displayName').inputValue().catch(() => "<none>");
    const bioValue = await page.locator('#bio').inputValue().catch(() => "<none>");
    console.log(`[/settings] display_name:`, nameValue);
    console.log(`[/settings] bio:`, bioValue);
    console.log(`[/settings] console errors:`, obs.consoleErrors);
    console.log(`[/settings] failed /api/v1:`, obs.failedRequests);
    await page.screenshot({ path: "tests/_shots/09-settings.png", fullPage: true });
  });

  test("game detail — post + delete a comment", async ({ page }) => {
    await page.goto(`${BASE}/games/${UUID}`, { waitUntil: "domcontentloaded" });
    // Wait for client-side session to hydrate; composer only renders when useSession resolves
    await page.waitForSelector("textarea", { timeout: 10000 }).catch(() => undefined);
    const beforeCount = await page.locator('h2:has-text("Comments")').first().innerText().catch(() => "<missing>");
    console.log(`[comment flow] header before:`, beforeCount);

    const textarea = page.locator('textarea').first();
    if (await textarea.count() === 0) {
      console.log(`[comment flow] textarea missing — signed-out branch rendered?`);
      await page.screenshot({ path: "tests/_shots/10-comment-no-textarea.png", fullPage: true });
      return;
    }
    const marker = `playwright-e2e-${Date.now()}`;
    await textarea.fill(marker);

    const postBtn = page.getByRole("button", { name: /post/i }).first();
    await postBtn.click();
    await page.waitForTimeout(1000);
    const afterCount = await page.locator('h2:has-text("Comments")').first().innerText().catch(() => "<missing>");
    console.log(`[comment flow] header after post:`, afterCount);
    await page.screenshot({ path: "tests/_shots/10-comment-posted.png", fullPage: true });

    const row = page.locator(`text=${marker}`).first();
    const rowVisible = await row.count();
    console.log(`[comment flow] posted marker visible:`, rowVisible);

    if (rowVisible > 0) {
      const deleteBtn = page.getByRole("button", { name: /delete/i }).first();
      if (await deleteBtn.count() > 0) {
        await deleteBtn.click();
        await page.waitForTimeout(1000);
        const stillVisible = await page.locator(`text=${marker}`).count();
        console.log(`[comment flow] after delete, marker visible:`, stillVisible);
      } else {
        console.log(`[comment flow] no delete button found`);
      }
    }
    await page.screenshot({ path: "tests/_shots/11-comment-deleted.png", fullPage: true });
  });
});
