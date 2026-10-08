import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Braces,
  Layers3,
  Linkedin,
  MessageSquareText,
} from "lucide-react";

const proposedTopics = [
  {
    number: "01",
    eyebrow: "DATA SYSTEMS · PROPOSED TOPIC",
    title: "How to handle Change Data Capture at scale with Oracle GoldenGate & Kafka",
    summary:
      "A practical architecture walkthrough: keeping event pipelines resilient, observable, and consistent as volume grows.",
    tags: ["Oracle GoldenGate", "Apache Kafka", "Data architecture"],
    icon: Layers3,
    tone: "bg-sky-50 text-sky-800 border-sky-100",
  },
  {
    number: "02",
    eyebrow: "AI ENGINEERING · PROPOSED TOPIC",
    title: "Building Deterministic Workflows using LangGraph",
    summary:
      "A closer look at state, transitions, and repeatable execution in workflows that need more than a clever prompt.",
    tags: ["LangGraph", "Workflow design", "LLM systems"],
    icon: Braces,
    tone: "bg-indigo-50 text-indigo-800 border-indigo-100",
  },
];

const channels = [
  {
    icon: Linkedin,
    name: "LinkedIn",
    format: "Technical breakdowns",
    detail: "Clear, useful explanations of decisions behind enterprise systems.",
    href: "https://www.linkedin.com/in/ajay-sharma-developer",
    linkLabel: "Visit Ajay's LinkedIn profile",
  },
  {
    icon: MessageSquareText,
    name: "X & developer communities",
    format: "Brief code and architecture notes",
    detail:
      "Share short code snippets, architecture diagrams, and lessons learned where developers gather.",
    href: "https://twitter.com/intent/tweet?url=https%3A%2F%2Fwww.ajkusharma.com%2F&text=Explore%20my%20engineering%20portfolio%20and%20ideas%20on%20enterprise%20systems%20and%20AI%20workflows.",
    linkLabel: "Share portfolio on X",
  },
  {
    icon: BookOpen,
    name: "Long-form",
    format: "Architecture and blog posts",
    detail: "Deeper write-ups can point readers back to ajkusharma.com for context.",
    href: "https://www.ajkusharma.com",
    linkLabel: "Visit ajkusharma.com",
  },
];

export default function ThoughtLeadership() {
  return (
    <section
      id="thought-leadership"
      aria-labelledby="thought-leadership-title"
      className="relative scroll-mt-20 overflow-hidden border-y border-border/70 bg-muted/30 py-20 md:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl"
      />
      <div className="container relative mx-auto px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45 }}
            className="flex flex-col items-start"
          >
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/80 px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Ideas in progress
            </span>
            <h2
              id="thought-leadership-title"
              className="max-w-xl text-3xl font-bold tracking-tight md:text-4xl lg:text-[2.75rem] lg:leading-[1.12]"
            >
              Engineering ideas,{" "}
              <span className="text-primary">shared in the open.</span>
            </h2>
            <p className="mt-5 max-w-lg leading-relaxed text-muted-foreground">
              A proposed writing and sharing practice around the systems I
              build: specific technical breakdowns, concise field notes, and
              deeper architecture thinking.
            </p>

            <div className="mt-9 w-full max-w-lg border-l-2 border-primary/25 pl-5">
              <p className="font-mono text-xs uppercase tracking-[0.13em] text-muted-foreground">
                The throughline
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                Make complex systems easier to reason about — from reliable
                data movement to predictable AI workflows.
              </p>
            </div>
            <a
              href="https://www.linkedin.com/in/ajay-sharma-developer"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Connect with Ajay Sharma on LinkedIn (opens in a new tab)"
              className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Linkedin aria-hidden="true" className="h-4 w-4" />
              Connect on LinkedIn
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </a>
          </motion.div>

          <div className="space-y-4">
            <h3 className="sr-only">Proposed article topics</h3>
            {proposedTopics.map((topic, index) => {
              const TopicIcon = topic.icon;
              return (
                <motion.article
                  key={topic.number}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.1 }}
                  className="group rounded-xl border border-border/80 bg-card p-5 shadow-sm transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-7"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] font-medium tracking-[0.13em] text-muted-foreground sm:text-[11px]">
                        {topic.eyebrow}
                      </p>
                      <h3 className="mt-3 max-w-2xl text-lg font-semibold leading-snug tracking-tight sm:text-xl">
                        {topic.title}
                      </h3>
                    </div>
                    <span
                      aria-hidden="true"
                      className={`hidden shrink-0 rounded-lg border p-3 sm:inline-flex ${topic.tone}`}
                    >
                      <TopicIcon className="h-5 w-5" />
                    </span>
                  </div>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {topic.summary}
                  </p>
                  <ul aria-label="Topics covered" className="mt-5 flex flex-wrap gap-2">
                    {topic.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-md bg-muted px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </motion.article>
              );
            })}
            <p className="px-1 pt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Proposed topics · not published articles
            </p>
          </div>
        </div>

        <div className="mt-16 border-t border-border/80 pt-8 md:mt-20 md:pt-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-primary">
                One idea, right-sized for each channel
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight">
                A cross-channel direction
              </h3>
            </div>
            <ArrowDownRight
              aria-hidden="true"
              className="mb-1 hidden h-5 w-5 text-muted-foreground sm:block"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {channels.map((channel, index) => {
              const ChannelIcon = channel.icon;
              return (
                <motion.div
                  key={channel.name}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="flex min-h-full flex-col rounded-lg border border-border/80 bg-background/75 p-5"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-md bg-primary/8 text-primary">
                      <ChannelIcon aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold">{channel.name}</h4>
                      <p className="text-xs text-muted-foreground">{channel.format}</p>
                    </div>
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {channel.detail}
                  </p>
                  <a
                    href={channel.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${channel.linkLabel} (opens in a new tab)`}
                    className="mt-4 inline-flex min-h-10 w-fit items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {channel.linkLabel}
                    <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                  </a>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
