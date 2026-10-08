// The requested public domain is an editorial requirement, not a deployment claim.
export const portfolioOrigin = "https://www.ajkusharma.com";

export const articles = [
  {
    slug: "oracle-goldengate-kafka-cdc-at-scale",
    title: "Change Data Capture at scale with Oracle GoldenGate & Kafka",
    category: "Data systems",
    description: "Designing reliable Oracle-to-Kafka CDC: transaction boundaries, partition keys, replay-safe consumers, schema evolution, and recovery.",
    tags: ["Oracle GoldenGate", "Apache Kafka", "Data architecture"],
    readingTime: "9 min read",
    sections: [
      { id: "contract", title: "Start with a correctness contract" },
      { id: "architecture", title: "A reference architecture" },
      { id: "ordering", title: "Partition keys and transaction boundaries" },
      { id: "recovery", title: "Replay-safe consumers and recovery" },
      { id: "schema", title: "Bootstrap and schema evolution" },
      { id: "scale", title: "Scale the bottleneck, not the diagram" },
      { id: "operations", title: "Observe, secure, and rehearse" },
      { id: "sources", title: "Sources and further reading" },
    ],
  },
  {
    slug: "deterministic-workflows-with-langgraph",
    title: "Designing deterministic workflows with LangGraph",
    category: "AI engineering",
    description: "Separate unpredictable model output from predictable control flow with typed state, explicit routing, checkpoints, approvals, and idempotent effects.",
    tags: ["LangGraph", "Workflow design", "LLM systems"],
    readingTime: "9 min read",
    sections: [
      { id: "meaning", title: "What deterministic actually means" },
      { id: "architecture", title: "A bounded workflow" },
      { id: "state", title: "State is a contract" },
      { id: "routing", title: "Make routing explicit" },
      { id: "durability", title: "Checkpoints are not magic" },
      { id: "approval", title: "Approval before action" },
      { id: "testing", title: "Test the failure paths" },
      { id: "sources", title: "Sources and further reading" },
    ],
  },
] as const;

export type Article = (typeof articles)[number];
export const articlePath = (article: Article) => `/articles/${article.slug}`;
export const articleUrl = (article: Article) => `${portfolioOrigin}${articlePath(article)}`;

export function findArticle(pathname: string) {
  return articles.find((article) => articlePath(article) === pathname.replace(/\/$/, ""));
}
