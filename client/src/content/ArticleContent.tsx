import GoldenGateArticle from "./GoldenGateArticle";
import LangGraphArticle from "./LangGraphArticle";

export function ArticleContent({ slug }: { slug: string }) {
  switch (slug) {
    case "oracle-goldengate-kafka-cdc-at-scale": return <GoldenGateArticle />;
    case "deterministic-workflows-with-langgraph": return <LangGraphArticle />;
    default: throw new Error(`No article content for ${slug}`);
  }
}
