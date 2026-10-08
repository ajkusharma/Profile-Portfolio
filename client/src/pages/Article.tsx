import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Link2,
} from "lucide-react";
import type { Article as ArticleType } from "@shared/articles";
import { articles, articlePath, articleUrl } from "@shared/articles";
import { ArticleContent } from "@/content/ArticleContent";
import { ArticleMetadata } from "@/components/ArticleMetadata";
import "./Article.css";

type ArticlePageProps = {
  article: ArticleType;
};

export default function Article({ article }: ArticlePageProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">("idle");
  const canonicalUrl = articleUrl(article);
  const otherArticle = articles.find((candidate) => candidate.slug !== article.slug);
  const linkedInShare = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl)}`;
  const xShare = `https://twitter.com/intent/tweet?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(article.title)}`;

  useEffect(() => {
    setCopyState("idle");
    const sectionId = window.location.hash.slice(1);
    if (sectionId) document.getElementById(sectionId)?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [article.slug]);

  async function copyCanonicalUrl() {
    setCopyState("idle");
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(canonicalUrl);
      setCopyState("copied");
    } catch {
      setCopyState("manual");
    }
  }

  return (
    <div className="article-shell min-h-screen text-foreground">
      <ArticleMetadata article={article} />
      <header className="article-topbar">
        <div className="article-topbar-inner">
          <Link
            href="/#thought-leadership"
            className="article-back-link"
            aria-label="Back to thought leadership on the portfolio"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            <span>Thought leadership</span>
          </Link>
          <span className="article-wordmark">AJ / Engineering notes</span>
        </div>
      </header>

      <main>
        <div className="article-hero">
          <div className="article-hero-inner">
            <p className="article-kicker">
              <span className="article-kicker-dot" aria-hidden="true" />
              {article.category}
              <span className="article-kicker-divider" aria-hidden="true">/</span>
              {article.readingTime}
            </p>
            <h1>{article.title}</h1>
            <p className="article-deck">{article.description}</p>
            <ul className="article-tag-list" aria-label="Article topics">
              {article.tags.map((tag) => <li key={tag}>{tag}</li>)}
            </ul>
            <div className="article-hero-rule" aria-hidden="true">
              <span />
            </div>
            <p className="article-note">
              General engineering guidance. Adapt the ideas to your system’s
              requirements; this is not a personal case study.
            </p>
          </div>
        </div>

        <div className="article-layout">
          <aside className="article-rail" aria-label="Article navigation and sharing">
            <nav className="article-toc" aria-labelledby="article-toc-heading">
              <h2 id="article-toc-heading">In this article</h2>
              <ol>
                {article.sections.map((section, index) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`}>
                      <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="article-share">
              <h2>Share this article</h2>
              <a href={linkedInShare} target="_blank" rel="noopener noreferrer">
                LinkedIn <ExternalLink aria-hidden="true" size={14} />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
              <a href={xShare} target="_blank" rel="noopener noreferrer">
                X <ExternalLink aria-hidden="true" size={14} />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
              <button type="button" onClick={copyCanonicalUrl}>
                {copyState === "copied" ? <Check aria-hidden="true" size={15} /> : <Copy aria-hidden="true" size={15} />}
                {copyState === "copied" ? "Link copied" : "Copy canonical link"}
              </button>
              <div className="article-copy-feedback" aria-live="polite" role="status">
                {copyState === "copied" && "Canonical URL copied to clipboard."}
                {copyState === "manual" && (
                  <>
                    <p>Clipboard access failed. Select and copy this canonical URL:</p>
                    <label className="sr-only" htmlFor="canonical-url">Canonical article URL</label>
                    <input
                      id="canonical-url"
                      type="text"
                      readOnly
                      value={canonicalUrl}
                      onFocus={(event) => event.currentTarget.select()}
                    />
                  </>
                )}
              </div>
            </div>
          </aside>

          <article className="article-body" aria-label={article.title}>
            <ArticleContent slug={article.slug} />
            <footer className="article-endnote">
              <span className="article-endnote-mark" aria-hidden="true"><Link2 size={17} /></span>
              <p>
                These are general design considerations, not a prescription.
                Validate assumptions against your own reliability, security,
                and operating constraints.
              </p>
            </footer>
          </article>
        </div>

        {otherArticle && (
          <section className="article-next-wrap" aria-labelledby="article-next-title">
            <div className="article-next">
              <div>
                <p className="article-next-kicker">Continue reading</p>
                <h2 id="article-next-title">{otherArticle.title}</h2>
                <p>{otherArticle.description}</p>
              </div>
              <Link href={articlePath(otherArticle)} className="article-next-link">
                Read the other article <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
