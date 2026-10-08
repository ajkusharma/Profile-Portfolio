import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import test from "node:test";
import { articles, articlePath, articleUrl, portfolioOrigin } from "../shared/articles";
import { discoveryFiles } from "./discovery";

test("sitemap lists only the portfolio and every known article, without invented dates", () => {
  const sitemap = discoveryFiles()["sitemap.xml"];
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.equal(portfolioOrigin, "https://www.ajkusharma.com");
  assert.equal(articles.length, 2);
  assert.deepEqual(locations, [`${portfolioOrigin}/`, ...articles.map(articleUrl)]);
  assert.equal(new Set(locations).size, locations.length);
  assert.match(sitemap, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
  assert.match(sitemap, /xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/);
  assert.doesNotMatch(sitemap, /lastmod|publication|changefreq|priority|localhost|replit\.dev/);
  assert.ok(!locations.includes(`${portfolioOrigin}/articles/unknown`));
  assert.ok(!locations.includes(`${portfolioOrigin}/api/contact`));
});

test("robots allows public pages, discourages API crawling, and advertises the sitemap", () => {
  assert.equal(discoveryFiles()["robots.txt"], [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "",
    "Sitemap: https://www.ajkusharma.com/sitemap.xml",
    "",
  ].join("\n"));
});

test("production build contains discovery files and preserves canonical/social metadata", async () => {
  for (const [filename, contents] of Object.entries(discoveryFiles())) {
    assert.equal(await readFile(`dist/public/${filename}`, "utf8"), contents);
  }
  for (const article of articles) {
    const html = await readFile(`dist/public${articlePath(article)}/index.html`, "utf8");
    assert.ok(html.includes(`<link rel="canonical" href="${articleUrl(article)}"`));
    assert.ok(html.includes(`<meta property="og:url" content="${articleUrl(article)}"`));
  }
  const home = await readFile("dist/public/index.html", "utf8");
  assert.ok(home.includes(`<link rel="canonical" href="${portfolioOrigin}/"`));
  await assert.rejects(access("dist/public/articles/unknown/index.html"));
});
