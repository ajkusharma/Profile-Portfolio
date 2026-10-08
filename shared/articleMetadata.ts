import { articleUrl, portfolioOrigin, type Article } from "./articles";

export function pageMetadata(article?: Article) {
  const title = article ? `${article.title} | Ajay Sharma` : "Ajay Sharma | Senior Full Stack Developer";
  const description = article?.description ?? "Ajay Sharma's portfolio: enterprise full-stack development, system architecture, and practical engineering ideas.";
  const url = article ? articleUrl(article) : `${portfolioOrigin}/`;
  return {
    title,
    url,
    tags: [
      { attribute: "name", key: "description", content: description },
      { attribute: "property", key: "og:title", content: title },
      { attribute: "property", key: "og:description", content: description },
      { attribute: "property", key: "og:type", content: article ? "article" : "website" },
      { attribute: "property", key: "og:url", content: url },
      { attribute: "property", key: "og:site_name", content: "Ajay Sharma — Engineering" },
      { attribute: "property", key: "og:image", content: `${portfolioOrigin}/portfolio-social-preview.png` },
      { attribute: "property", key: "og:image:width", content: "1200" },
      { attribute: "property", key: "og:image:height", content: "630" },
      { attribute: "property", key: "og:image:alt", content: "Ajay Sharma engineering portfolio" },
      { attribute: "name", key: "twitter:card", content: "summary_large_image" },
      { attribute: "name", key: "twitter:title", content: title },
      { attribute: "name", key: "twitter:description", content: description },
      { attribute: "name", key: "twitter:image", content: `${portfolioOrigin}/portfolio-social-preview.png` },
      { attribute: "name", key: "twitter:image:alt", content: "Ajay Sharma engineering portfolio" },
    ],
  };
}

export function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** Same metadata for HTML crawlers and client-side route changes. */
export function withPageMetadata(html: string, article?: Article) {
  const metadata = pageMetadata(article);
  let result = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(metadata.title)}</title>`);
  result = result.replace(/<link\b[^>]*rel="canonical"[^>]*>/g, "");
  for (const tag of metadata.tags) {
    const key = tag.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(new RegExp(`<meta\\b[^>]*${tag.attribute}="${key}"[^>]*>`, "g"), "");
  }
  const tags = metadata.tags.map(tag => `<meta ${tag.attribute}="${tag.key}" content="${escapeHtml(tag.content)}" />`).join("\n    ");
  return result.replace("</head>", `    <link rel="canonical" href="${escapeHtml(metadata.url)}" />\n    ${tags}\n  </head>`);
}
