import assert from "node:assert/strict";
import test from "node:test";
import { articles, articlePath, articleUrl, findArticle, portfolioOrigin } from "../shared/articles";
import { escapeHtml, pageMetadata, withPageMetadata } from "../shared/articleMetadata";
import { articleMetadataPlugin } from "../vite-plugin-article-metadata";
import type { IndexHtmlTransformContext } from "vite";

test("article lookup and canonical helpers have exact public paths", () => {
  assert.equal(portfolioOrigin, "https://www.ajkusharma.com");
  for (const article of articles) {
    assert.equal(articlePath(article), `/articles/${article.slug}`);
    assert.equal(articleUrl(article), `https://www.ajkusharma.com/articles/${article.slug}`);
    assert.equal(findArticle(articlePath(article)), article);
    assert.equal(findArticle(`${articlePath(article)}/`), article);
    assert.equal(findArticle(`/articles/${article.slug}-unknown`), undefined);
    assert.equal(findArticle(`/articles/${article.slug.toUpperCase()}`), undefined);
    assert.equal(new Set(article.sections.map(section => section.id)).size, article.sections.length);
  }
  for (const path of ["/", "/articles/unknown", "/articles", "/api/contact"]) {
    assert.equal(findArticle(path), undefined);
  }
});

const template = `<!doctype html><html><head>
<title>Old title</title>
<link rel="canonical" href="https://old.example/" />
<meta name="description" content="Old description" />
<meta property="og:title" content="Old social title" />
<meta property="og:url" content="https://old.example/" />
<meta name="twitter:title" content="Old tweet title" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
</head><body><div id="root">Keep body intact &amp; readable.</div></body></html>`;

test("HTML metadata is unique, escaped, idempotent, and can be restored to Home", () => {
  let html = template;
  for (const article of [...articles, undefined]) {
    html = withPageMetadata(html, article);
    const metadata = pageMetadata(article);
    const expectedUrl = article
      ? `https://www.ajkusharma.com/articles/${article.slug}`
      : "https://www.ajkusharma.com/";
    assert.equal(metadata.url, expectedUrl);
    assert.equal(metadata.title, article
      ? `${article.title} | Ajay Sharma`
      : "Ajay Sharma | Senior Full Stack Developer");
    assert.equal((html.match(/<title>/g) ?? []).length, 1);
    assert.ok(html.includes(`<title>${escapeHtml(metadata.title)}</title>`));
    assert.equal((html.match(/rel="canonical"/g) ?? []).length, 1);
    assert.ok(html.includes(`href="${expectedUrl}"`));
    for (const tag of metadata.tags) {
      assert.equal(html.split(`${tag.attribute}="${tag.key}"`).length - 1, 1, tag.key);
      assert.ok(html.includes(`content="${escapeHtml(tag.content)}"`), tag.key);
    }
    assert.equal(withPageMetadata(html, article).replace(/\s+</g, "<"), html.replace(/\s+</g, "<"));
    assert.ok(html.includes('<meta name="viewport" content="width=device-width, initial-scale=1" />'));
    assert.ok(html.includes('<div id="root">Keep body intact &amp; readable.</div>'));
    assert.ok(!html.includes("old.example"));
  }
  assert.ok(!html.includes(articles[0].slug));
  assert.ok(!html.includes(articles[1].slug));
});

test("escaping encodes ampersands, angle brackets, both quotes, and preserves Unicode", () => {
  assert.equal(escapeHtml(`A & <B> "C" 'D' —`), "A &amp; &lt;B&gt; &quot;C&quot; &#39;D&#39; —");
  assert.ok(withPageMetadata(template, articles[0]).includes("GoldenGate &amp; Kafka"));
});

test("Vite direct-request metadata handles query strings, trailing slash, and unknown slugs", () => {
  const hook = articleMetadataPlugin().transformIndexHtml;
  assert.ok(hook && typeof hook === "object" && "handler" in hook);
  assert.equal(hook.order, "post");
  // This hook is pure and does not consume Vite's plugin `this` context.
  const handler: OmitThisParameter<typeof hook.handler> = hook.handler;
  for (const article of articles) {
    for (const suffix of ["", "/", "?utm_source=local-test"]) {
      const result = handler(template, {
        path: "/index.html",
        originalUrl: `${articlePath(article)}${suffix}`,
      } as IndexHtmlTransformContext);
      assert.equal(result, withPageMetadata(template, article));
    }
    assert.equal(handler(template, { path: articlePath(article) } as IndexHtmlTransformContext),
      withPageMetadata(template, article));
  }
  assert.equal(handler(template, {
    path: "/index.html", originalUrl: "/articles/unknown?preview=true",
  } as IndexHtmlTransformContext), withPageMetadata(template));
});
