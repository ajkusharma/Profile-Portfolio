import { readFile, access } from "node:fs/promises";
import { articles, articlePath } from "../../shared/articles";
import { test, expect, expectMetadata, expectReader, publicUrl } from "./helpers";

for (const article of articles) {
  test(`${article.slug}: built HTML serves complete content without JavaScript`, async ({ browser, page, baseURL }) => {
    // A separate context cannot hydrate or repair missing server-rendered HTML.
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
    await context.route("**/*", route =>
      new URL(route.request().url()).origin === new URL(baseURL!).origin
        ? route.continue() : route.abort(),
    );
    try {
      const crawler = await context.newPage();
      const response = await crawler.goto(articlePath(article));
      expect(response?.status()).toBe(200);
      const html = await readFile(`dist/public${articlePath(article)}/index.html`, "utf8");
      // Confirm the server actually delivered the generated file, not SPA fallback.
      expect(await response!.text()).toBe(html);
      await expectReader(crawler, article);
      await expect(crawler.locator(".article-note")).toContainText("not a personal case study");
      const body = crawler.getByRole("article", { name: article.title, exact: true });
      expect(await body.locator("p").count()).toBeGreaterThan(20);
      for (const section of article.sections) {
        const content = body.locator(`section[id="${section.id}"]`);
        expect(await content.locator("p").count()).toBeGreaterThan(0);
        expect((await content.textContent())!.length).toBeGreaterThan(200);
      }
      await expect(body.getByRole("list", { name: "Architecture flow" })).toBeVisible();
      expect(await body.locator("figure figcaption").textContent()).toBeTruthy();
      if (article.slug === "deterministic-workflows-with-langgraph") {
        const code = body.getByLabel("Illustrative Python routing function");
        await expect(code).toContainText('Literal["review", "revise", "reject"]');
        await expect(code).toContainText('return "revise"');
        await expect(body.locator("#sources a")).toHaveCount(4);
      } else {
        await expect(body.locator("#sources a")).toHaveCount(2);
        await expect(body.locator("#ordering")).toContainText("not the same as Kafka producer transactions");
      }
      for (const link of await body.locator("#sources a").all()) {
        await expect(link).toHaveAttribute("href", /^https:\/\//);
      }
      await expect(crawler.locator(".article-share a").first()).toHaveAttribute(
        "href", `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl(article))}`,
      );

      // Compare every paragraph, list item, heading, code sample, and caption
      // with the client reader. This catches partial build output, not just h1s.
      await page.goto(articlePath(article));
      await expectReader(page, article);
      const contentSelector = ".article-body h2, .article-body p, .article-body li, .article-body pre, .article-body figcaption";
      expect(await crawler.locator(contentSelector).allTextContents())
        .toEqual(await page.locator(contentSelector).allTextContents());
      const toc = crawler.getByRole("navigation", { name: "In this article" });
      const last = article.sections.at(-1)!;
      await toc.getByRole("link", { name: last.title }).click();
      await expect(crawler.locator(`#${last.id} h2`)).toBeInViewport();
    } finally {
      await context.close();
    }
  });
}

test("built Home metadata is restored and no unknown-slug HTML is emitted", async ({ browser, baseURL }) => {
  await expect(access("dist/public/articles/not-a-real-article/index.html")).rejects.toThrow();
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  await context.route("**/*", route =>
    new URL(route.request().url()).origin === new URL(baseURL!).origin
      ? route.continue() : route.abort(),
  );
  try {
    const page = await context.newPage();
    await page.goto("/");
    await expectMetadata(page);
  } finally {
    await context.close();
  }
});
