import type { Plugin } from "vite";
import { findArticle } from "./shared/articles";
import { withPageMetadata } from "./shared/articleMetadata";

export function articleMetadataPlugin(): Plugin {
  return {
    name: "article-metadata",
    transformIndexHtml: {
      order: "post",
      handler(html, context) {
        // Dev direct requests also expose metadata to non-JavaScript readers.
        const requestPath = (context.originalUrl ?? context.path).split("?")[0];
        return withPageMetadata(html, findArticle(requestPath));
      },
    },
  };
}
