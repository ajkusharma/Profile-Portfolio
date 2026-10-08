import { test as base, expect, type Page } from "@playwright/test";
import type { Article } from "../../shared/articles";

export const test = base.extend({
  context: async ({ context, baseURL }, use) => {
    // No live publication, remote fonts, email, or share submission is needed.
    await context.route("**/*", (route) => {
      const url = new URL(route.request().url());
      return url.origin === new URL(baseURL!).origin && !url.pathname.startsWith("/api/")
        ? route.continue()
        : route.abort();
    });
    await use(context);
  },
});
export { expect };

// Deliberately independent of pageMetadata()/articleUrl(): changing the public
// origin or metadata implementation must not silently change the test oracle.
export const publicUrl = (article?: Article) =>
  `https://www.ajkusharma.com/${article ? `articles/${article.slug}` : ""}`;

export async function expectMetadata(page: Page, article?: Article) {
  const title = article
    ? `${article.title} | Ajay Sharma`
    : "Ajay Sharma | Senior Full Stack Developer";
  const description = article?.description ??
    "Ajay Sharma's portfolio: enterprise full-stack development, system architecture, and practical engineering ideas.";
  await expect(page).toHaveTitle(title);
  const canonical = page.locator('head link[rel="canonical"]');
  await expect(canonical).toHaveCount(1);
  await expect(canonical).toHaveAttribute("href", publicUrl(article));
  const tags = [
    ["name", "description", description],
    ["property", "og:title", title],
    ["property", "og:description", description],
    ["property", "og:type", article ? "article" : "website"],
    ["property", "og:url", publicUrl(article)],
    ["property", "og:site_name", "Ajay Sharma — Engineering"],
    ["property", "og:image", "https://www.ajkusharma.com/portfolio-social-preview.png"],
    ["property", "og:image:width", "1200"],
    ["property", "og:image:height", "630"],
    ["property", "og:image:alt", "Ajay Sharma engineering portfolio"],
    ["name", "twitter:card", "summary_large_image"],
    ["name", "twitter:title", title],
    ["name", "twitter:description", description],
    ["name", "twitter:image", "https://www.ajkusharma.com/portfolio-social-preview.png"],
    ["name", "twitter:image:alt", "Ajay Sharma engineering portfolio"],
  ];
  for (const [attribute, key, value] of tags) {
    const tag = page.locator(`head meta[${attribute}="${key}"]`);
    await expect(tag).toHaveCount(1);
    await expect(tag).toHaveAttribute("content", value);
  }
}

export async function expectReader(page: Page, article: Article) {
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(article.title);
  await expect(page.getByRole("article", { name: article.title, exact: true })).toBeVisible();
  for (const section of article.sections) {
    await expect(page.locator(`section[id="${section.id}"]`)).toHaveCount(1);
    await expect(page.locator(`section[id="${section.id}"] h2`)).toHaveText(section.title);
  }
  await expectMetadata(page, article);
}

export async function expectTop(page: Page) {
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
}
