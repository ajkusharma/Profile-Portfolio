import { useEffect } from "react";
import type { Article } from "@shared/articles";
import { pageMetadata } from "@shared/articleMetadata";

function updateMetadata(article?: Article) {
  const metadata = pageMetadata(article);
  document.title = metadata.title;
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = metadata.url;
  for (const tag of metadata.tags) {
    let element = document.head.querySelector<HTMLMetaElement>(`meta[${tag.attribute}="${tag.key}"]`);
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute(tag.attribute, tag.key);
      document.head.appendChild(element);
    }
    element.content = tag.content;
  }
}

export function ArticleMetadata({ article }: { article?: Article }) {
  useEffect(() => {
    updateMetadata(article);
    return () => updateMetadata();
  }, [article]);
  return null;
}
