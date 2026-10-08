import { articles, articlePath } from "../../shared/articles";
import { test, expect, expectMetadata, expectReader, expectTop } from "./helpers";

for (const article of articles) {
  const other = articles.find(candidate => candidate.slug !== article.slug)!;

  test(`${article.slug}: Home → article → other article → Home`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/");
    await expectMetadata(page);
    const cardLink = page.locator("#thought-leadership").getByRole("link", {
      name: "Read article", exact: true,
    }).and(page.locator(`a[href="${articlePath(article)}"]`));
    await expect(cardLink).toHaveCount(1);
    // Record a marker to prove navigation stays in the SPA, not a fresh document.
    await page.evaluate(() => { document.documentElement.dataset.journey = "same-document"; });
    await cardLink.click();
    await expect(page).toHaveURL(articlePath(article));
    await expectReader(page, article);
    await expectTop(page);
    await expect(page.locator("html")).toHaveAttribute("data-journey", "same-document");

    await page.getByRole("link", { name: "Read the other article" }).click();
    await expect(page).toHaveURL(articlePath(other));
    await expectReader(page, other);
    await expectTop(page);
    await expect(page.locator("html")).toHaveAttribute("data-journey", "same-document");

    await page.getByRole("link", { name: "Back to thought leadership on the portfolio" }).click();
    await expect(page).toHaveURL("/#thought-leadership");
    await expect(page.locator("#thought-leadership-title")).toBeInViewport();
    await expect(page.locator(".article-shell")).toHaveCount(0);
    await expectMetadata(page);
    await expect(page.locator("html")).toHaveAttribute("data-journey", "same-document");
    expect(errors).toEqual([]);
  });

  test(`${article.slug}: direct load, reload, and every TOC target`, async ({ page }) => {
    await page.goto(articlePath(article));
    await expectReader(page, article);
    await expectTop(page);
    await page.reload();
    await expectReader(page, article);
    await expectTop(page);
    const toc = page.getByRole("navigation", { name: "In this article" });
    await expect(toc.getByRole("link")).toHaveCount(article.sections.length);
    for (const section of article.sections) {
      const link = toc.getByRole("link", { name: section.title });
      await expect(link).toHaveAttribute("href", `#${section.id}`);
      await link.click();
      await expect.poll(() => new URL(page.url()).hash).toBe(`#${section.id}`);
      expect(new URL(page.url()).pathname.replace(/\/$/, "")).toBe(articlePath(article));
      await expect(page.locator(`section[id="${section.id}"] h2`)).toBeInViewport();
    }
    await page.reload();
    await expectReader(page, article);
    await expect(page.locator("#sources h2")).toBeInViewport();
  });

  test(`${article.slug}: direct section link and scroll reset after reading`, async ({ page }) => {
    const section = article.sections[3];
    await page.goto(`${articlePath(article)}#${section.id}`);
    await expectReader(page, article);
    await expect(page.locator(`#${section.id} h2`)).toBeInViewport();
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
    await page.getByRole("link", { name: "Read the other article" }).click();
    await expectReader(page, other);
    await expectTop(page);
    await expect(page).toHaveURL(articlePath(other)); // no stale section hash
  });

  test(`${article.slug}: browser back/forward restores article and Home metadata`, async ({ page }) => {
    await page.goto("/#thought-leadership");
    await page.locator(`#thought-leadership a[href="${articlePath(article)}"]`).click();
    await expectReader(page, article);
    await page.getByRole("link", { name: "Read the other article" }).click();
    await expectReader(page, other);
    await page.goBack();
    await expectReader(page, article);
    await page.goBack();
    await expectMetadata(page);
    await expect(page.locator("#thought-leadership-title")).toBeInViewport();
    await page.goForward();
    await expectReader(page, article);
  });
}

test("unknown article slugs never render a known article, including after SPA navigation", async ({ page }) => {
  await page.goto("/articles/not-a-real-article");
  await expect(page.getByRole("heading", { name: "404 Page Not Found" })).toBeVisible();
  await expect(page.locator(".article-shell")).toHaveCount(0);
  await expectMetadata(page);
  await page.reload();
  await expect(page.getByRole("heading", { name: "404 Page Not Found" })).toBeVisible();

  await page.goto(articlePath(articles[0]));
  await expectReader(page, articles[0]);
  // Use the same pushState/popstate mechanism as Wouter to reach an absent slug.
  await page.evaluate(() => {
    window.history.pushState(null, "", "/articles/not-a-real-article");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  await expect(page.getByRole("heading", { name: "404 Page Not Found" })).toBeVisible();
  await expect(page.locator(".article-shell")).toHaveCount(0);
  await expectMetadata(page);
});
