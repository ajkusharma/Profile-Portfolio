import ArticleDiagram from "./ArticleDiagram";

const routingExample = `from typing import Literal, TypedDict

class State(TypedDict):
    valid: bool
    approved: bool
    attempts: int
    max_attempts: int

def route_after_validation(
    state: State,
) -> Literal["review", "revise", "reject"]:
    if state["valid"]:
        return "review"
    if state["attempts"] >= state["max_attempts"]:
        return "reject"
    return "revise"

# In a StateGraph builder:
# builder.add_conditional_edges(
#     "validate", route_after_validation,
#     {"review": "review", "revise": "revise", "reject": "reject"},
# )
# The revise node increments attempts before validating again.
# The review node handles approval; execution is a separate node.`;

export default function LangGraphArticle() {
  return (
    <>
      <p>An LLM can propose a useful answer and still be an unreliable authority for deciding what a system should do next. LangGraph helps represent a workflow as explicit state and transitions, with persistence and interruption points. It does not make model output inherently deterministic. Reliability comes from the boundaries designed around that output.</p>
      <p>This is general design guidance, not a description of an AI system deployed by Ajay. Examples are illustrative Python patterns using LangGraph’s Graph API, with task and persistence guidance from the official documentation. Pin and test the package versions used by your application; this article is not a complete production implementation.</p>

      <section id="meaning">
        <h2>What deterministic actually means</h2>
        <p>Separate three ideas. <strong>Deterministic routing</strong> means the same validated state selects the same next step. <strong>Resumable execution</strong> means a paused or failed thread can continue using persisted work. <strong>Reproducible generation</strong> would mean repeating a model call yields exactly the same output. The first two are useful workflow goals; neither guarantees the third.</p>
        <p>A low temperature can reduce variation, but is not a universal reproducibility guarantee. Model changes, infrastructure, tool responses, retrieval results, and time-dependent inputs can all change a new run. Persist the relevant inputs and accepted outputs so a decision can be inspected without asking the model to regenerate its explanation.</p>
        <p>Define invariants before choosing an agent pattern: no external write without authorization, every loop has a limit, every tool argument is validated, and a resumed action cannot duplicate a business effect. Those invariants are executable requirements, not prompt suggestions.</p>
      </section>

      <section id="architecture">
        <h2>A bounded workflow</h2>
        <ArticleDiagram
          steps={["Validate request → reject unsupported inputs before generation", "Draft → persist proposal and context; validate schema and policy", "Review → request authorization for the exact proposed action", "Execute → apply an idempotent action; persist receipt, then finish"]}
          caption="Read in numbered order. Invalid drafts may return to revision only within a fixed attempt budget; exhaustion or rejected approval leads to a terminal rejection. Tool failures follow a bounded retry or escalation path. The model proposes; application rules and authorization decide."
        />
        <p>For example, a document-assistance workflow might draft an update, validate it, ask a person to review it, then apply the approved revision. This is a hypothetical scenario. The graph’s value is that generation, validation, review, and side effects have separate contracts and failure policies.</p>
        <p>A graph with every possible tool available at every step is difficult to audit. Restrict each node to the capability it needs. Untrusted text retrieved from a document or produced by a model must not gain permission to change the graph, bypass approval, or invoke arbitrary tools.</p>
      </section>

      <section id="state">
        <h2>State is a contract</h2>
        <p>Keep the workflow’s authoritative facts in structured state: request identity, input version, proposal, validation errors, attempt count, approval decision, and execution receipt. Separate those facts from conversational messages. A sentence saying “approved” in a chat history is not an authenticated approval record.</p>
        <p>Python type hints and <code>TypedDict</code> describe expected shape; they do not automatically validate runtime data. Parse model output against an actual schema, reject unknown actions, and validate business rules in ordinary code. Valid JSON is not necessarily a valid action, and a schema-valid action may still violate policy.</p>
        <p>Prefer small node updates instead of replacing the whole state. When parallel nodes write to a shared field, define a reducer that matches the intended merge semantics. Append-style accumulation can duplicate entries on retries or make order matter. For order-independent results, key by stable identity and normalize ordering before downstream decisions. Keep credentials and unnecessary personal data out of checkpoints.</p>
      </section>

      <section id="routing">
        <h2>Make routing explicit</h2>
        <p>Conditional edges should read validated state and return a finite set of destinations. Do not ask the model to invent a node name. The following routing function is a small, testable example; it does not contain generation, authentication, or persistence wiring.</p>
        <pre aria-label="Illustrative Python routing function"><code>{routingExample}</code></pre>
        <p>Initialize the attempt counter, increment it in one defined place, and enforce the maximum even if the model asks to continue. Keep transport retries separate from semantic revisions: a temporary timeout is not the same as a proposal failing validation. Apply a total run budget as well as per-node limits to bound cost and elapsed time.</p>
        <p>Decide terminal outcomes explicitly: completed, rejected, exhausted, or escalated. A workflow that stops because of a recursion limit should not appear to the caller as successful. Return enough structured information for a user to understand what happened and what, if anything, was committed.</p>
      </section>

      <section id="durability">
        <h2>Checkpoints are not magic</h2>
        <p>Compile the graph with a suitable checkpointer and invoke it with a stable <code>thread_id</code>. A memory-backed saver is useful in experiments but does not survive process restarts. Production recovery needs durable storage, access controls, backup and retention policies, and an application mapping from users to authorized threads. Knowing a thread ID must not be enough to read or resume another user’s workflow.</p>
        <p>The Graph API saves state at super-step boundaries and can retain pending writes from successful parallel nodes. Resumption is not an operating-system continuation at an arbitrary line of Python. In particular, a node containing an interrupt restarts from its beginning on resume. Code before the interrupt can run again.</p>
        <p>Isolate nondeterministic work and side effects in checkpointed tasks where appropriate, including model calls, network reads, random values, and timestamps that influence routing. The Functional API replays its entrypoint and restores saved task results. Keep task ordering consistent across resume; do not change control flow based on a fresh wall-clock read outside a recorded boundary.</p>
        <p>Checkpointing does not close the gap between an external effect and saving its result. An API can accept a write and the process can crash before the receipt is persisted. A task may then run again. Use a stable business idempotency key supported by the destination, or an atomic deduplication record and write in a database. Generating a new key on each retry defeats the protection. “Check then write” without concurrency control also allows duplicates.</p>
        <p>Choose persistence durability intentionally. Where supported, synchronous checkpoint writes trade some latency for saving each checkpoint before the next step starts; asynchronous writes can have a crash window. Neither mode makes a remote service part of the same database transaction.</p>
      </section>

      <section id="approval">
        <h2>Approval before action</h2>
        <p>Use <code>interrupt()</code> to surface a JSON-serializable review payload. Resume with <code>Command(resume=...)</code> and the same thread ID. The application must authenticate the reviewer, enforce authorization, validate the resume value, and associate the decision with the exact action being reviewed. LangGraph’s pause mechanism is not an authorization system.</p>
        <p>Keep the approval node free of irreversible side effects before the interrupt. Place execution in a later node, after a typed decision routes to approval. If a proposal, destination, or amount changes, require a new approval rather than silently reusing an old one. Bind the approval record to a proposal version or digest and enforce that binding before executing.</p>
        <p>Do not swallow the interrupt mechanism with a broad exception handler, reorder interrupt calls within a node, or depend on a newly sampled value to choose which interrupt appears during resume. Set an application-level policy for expired approvals and canceled requests: an interrupted thread can wait indefinitely unless your application chooses otherwise.</p>
      </section>

      <section id="testing">
        <h2>Test the failure paths</h2>
        <p>Test routing as pure functions over fixed states. Use recorded model outputs for control-flow tests so failures do not depend on a live model. Separately evaluate model quality against a representative dataset; a graph that routes correctly can still produce a poor proposal.</p>
        <ul>
          <li><strong>Invalid output:</strong> malformed JSON, missing fields, unsupported tool names, and schema-valid but forbidden actions must not reach execution.</li>
          <li><strong>Bounded loops:</strong> repeated validation failures reach exhaustion at the configured budget, without one extra side effect.</li>
          <li><strong>Crash recovery:</strong> terminate before and after an external commit, resume the same thread, and verify a single business outcome.</li>
          <li><strong>Review:</strong> rejection, unauthorized resume, expired approval, and a changed proposal all block execution.</li>
          <li><strong>Concurrency:</strong> duplicate submissions and competing resumes cannot race into two external writes.</li>
        </ul>
        <p>Trace request identity, thread, node, state version, route reason, attempt count, checkpoint timing, and action receipt. Avoid logging raw sensitive prompts by default. These records should explain why a transition occurred without requiring a new model interpretation.</p>
        <p>Finally, treat workflow changes as compatibility changes. Renaming nodes, modifying state, or changing the order of tasks and interrupts can affect in-flight threads. Test migrations with saved checkpoints, version the workflow where needed, and define whether old threads finish on old code or require an explicit migration.</p>
        <p>Predictable workflow design does not remove uncertainty from a model. It limits where that uncertainty can influence a system, makes decisions inspectable, and gives failures a controlled recovery path.</p>
      </section>

      <section id="sources">
        <h2>Sources and further reading</h2>
        <p>The official documentation below supports the runtime-specific guidance. The scenario and checklist are general recommendations, not personal project claims or measured results.</p>
        <ul>
          <li><a href="https://docs.langchain.com/oss/python/langgraph/functional-api">LangGraph Functional API</a> — tasks, deterministic replay, and idempotency.</li>
          <li><a href="https://docs.langchain.com/oss/python/langgraph/checkpointers">LangGraph checkpointers</a> — threads, super-steps, pending writes, and durability modes.</li>
          <li><a href="https://docs.langchain.com/oss/python/langgraph/interrupts">LangGraph interrupts</a> — resume behavior and rules for replay-safe human review.</li>
          <li><a href="https://docs.langchain.com/oss/python/langgraph/graph-api">LangGraph Graph API</a> — state, reducers, and conditional edges.</li>
        </ul>
      </section>
    </>
  );
}
