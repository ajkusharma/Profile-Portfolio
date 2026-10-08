export default function ArticleDiagram({ steps, caption }: { steps: readonly string[]; caption: string }) {
  return (
    <figure className="my-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
      <ol aria-label="Architecture flow" className="grid gap-3 sm:grid-cols-2">
        {steps.map((step, index) => (
          <li key={step} className="flex items-start gap-3 rounded-lg border border-border bg-background p-4 text-sm">
            <span aria-hidden="true" className="font-mono font-semibold text-primary">{String(index + 1).padStart(2, "0")}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <figcaption className="mt-4 text-sm leading-relaxed text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}
