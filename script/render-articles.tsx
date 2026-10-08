import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Router } from "wouter";
import ArticlePage from "../client/src/pages/Article";
import { articles, articlePath } from "../shared/articles";
import { withPageMetadata } from "../shared/articleMetadata";

export function renderArticles(template: string) {
  return articles.map(article => {
    const markup = renderToStaticMarkup(
      <Router ssrPath={articlePath(article)}>
        <ArticlePage article={article} />
      </Router>,
    );
    return {
      path: `${articlePath(article).slice(1)}/index.html`,
      // A static deployment serves complete content and social tags without JS.
      html: withPageMetadata(template, article).replace('<div id="root"></div>', () => `<div id="root">${markup}</div>`),
    };
  });
}
