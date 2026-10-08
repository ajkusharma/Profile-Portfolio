import { articles, articleUrl, portfolioOrigin } from "../shared/articles";

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  })[character]!);
}

/** Enumerate only real pages; do not infer dates from build time. */
export function discoveryFiles() {
  const urls = [`${portfolioOrigin}/`, ...articles.map(articleUrl)];
  return {
    "sitemap.xml": [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls.map(url => `  <url><loc>${escapeXml(url)}</loc></url>`),
      "</urlset>",
      "",
    ].join("\n"),
    "robots.txt": [
      "User-agent: *",
      "Allow: /",
      "Disallow: /api/",
      "",
      `Sitemap: ${portfolioOrigin}/sitemap.xml`,
      "",
    ].join("\n"),
  };
}
