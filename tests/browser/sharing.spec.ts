import { articles, articlePath } from "../../shared/articles";
import { test, expect, expectReader, publicUrl } from "./helpers";

for (const article of articles) {
  test(`${article.slug}: exact LinkedIn/X targets without third-party submission`, async ({ page }) => {
    await page.goto(articlePath(article));
    await expectReader(page, article);
    const expected = [
      ["LinkedIn", `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl(article))}`],
      ["X", `https://twitter.com/intent/tweet?url=${encodeURIComponent(publicUrl(article))}&text=${encodeURIComponent(article.title)}`],
    ];
    for (const [name, href] of expected) {
      const link = page.locator(".article-share").getByRole("link", { name: `${name} (opens in a new tab)`, exact: true });
      await expect(link).toHaveAttribute("href", href);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(new URL(href).searchParams.get("url")).toBe(publicUrl(article));
    }
  });

  for (const mode of ["success", "rejected", "unavailable"] as const) {
    test(`${article.slug}: clipboard ${mode} and feedback reset on next article`, async ({ page }) => {
      await page.addInitScript((mode) => {
        Object.defineProperty(window, "__copiedUrls", { value: [] });
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: mode === "unavailable" ? undefined : {
            writeText: async (value: string) => {
              (window as unknown as { __copiedUrls: string[] }).__copiedUrls.push(value);
              if (mode === "rejected") throw new DOMException("Permission denied", "NotAllowedError");
            },
          },
        });
      }, mode);
      await page.goto(articlePath(article));
      await expectReader(page, article);
      await page.getByRole("button", { name: "Copy canonical link" }).click();
      const feedback = page.locator(".article-copy-feedback");
      await expect(feedback).toHaveAttribute("aria-live", "polite");
      await expect(feedback).toHaveAttribute("role", "status");
      if (mode === "success") {
        await expect(page.getByRole("button", { name: "Link copied" })).toBeVisible();
        await expect(feedback).toHaveText("Canonical URL copied to clipboard.");
        await expect(page.getByRole("textbox", { name: "Canonical article URL" })).toHaveCount(0);
      } else {
        await expect(feedback).toContainText("Clipboard access failed.");
        const input = page.getByRole("textbox", { name: "Canonical article URL" });
        await expect(input).toHaveValue(publicUrl(article));
        await expect(input).toHaveAttribute("readonly", "");
        await input.focus();
        expect(await input.evaluate((element: HTMLInputElement) =>
          element.value.slice(element.selectionStart ?? 0, element.selectionEnd ?? 0),
        )).toBe(publicUrl(article));
        await expect(page.getByRole("button", { name: "Copy canonical link" })).toBeVisible();
      }
      expect(await page.evaluate(() =>
        (window as unknown as { __copiedUrls: string[] }).__copiedUrls,
      )).toEqual(mode === "unavailable" ? [] : [publicUrl(article)]);

      const other = articles.find(candidate => candidate.slug !== article.slug)!;
      await page.getByRole("link", { name: "Read the other article" }).click();
      await expectReader(page, other);
      await expect(feedback).toBeEmpty();
      await expect(page.getByRole("button", { name: "Copy canonical link" })).toBeVisible();
      await expect(page.getByRole("textbox", { name: "Canonical article URL" })).toHaveCount(0);
      await page.getByRole("button", { name: "Copy canonical link" }).click();
      if (mode === "success") {
        await expect(page.getByRole("button", { name: "Link copied" })).toBeVisible();
      } else {
        await expect(page.getByRole("textbox", { name: "Canonical article URL" })).toHaveValue(publicUrl(other));
      }
    });
  }
}
