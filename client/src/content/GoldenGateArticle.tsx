import ArticleDiagram from "./ArticleDiagram";

export default function GoldenGateArticle() {
  return (
    <>
      <p>Change Data Capture (CDC) moves database changes into downstream systems without repeatedly scanning entire tables. Oracle GoldenGate can capture Oracle changes and deliver them through its trail-based pipeline; a Kafka integration makes those changes available to independent consumers. The difficult part is not drawing the connection. It is deciding what remains true when a database, producer, broker, or consumer fails.</p>
      <p>This walkthrough describes a reference design, not a report of a deployment by Ajay. Configuration names and integration behavior vary by GoldenGate release and handler. The Kafka Handler discussion below is grounded in Oracle’s Big Data 21.1 documentation; verify the corresponding manual and supported Kafka client for your installed version before applying it.</p>

      <section id="contract">
        <h2>Start with a correctness contract</h2>
        <p>First define what the consumer needs: a current-state replica, an immutable change history, or a business-level event stream. A row update is not automatically an “order shipped” event. Treat raw CDC as a database contract and derive business events in a separate, versioned transformation when needed.</p>
        <ul>
          <li><strong>Identity:</strong> Which stable columns identify a row? Composite keys must be encoded consistently, and tables without suitable keys need an explicit strategy.</li>
          <li><strong>Ordering:</strong> Is order required per row, per business entity, or across a whole transaction? These are different guarantees with different costs.</li>
          <li><strong>Completeness:</strong> Which tables, columns, deletes, and DDL changes belong in the contract? Verify Oracle logging and GoldenGate capture prerequisites, including supplemental logging for the selected keys.</li>
          <li><strong>Recovery:</strong> How much downtime and data loss are acceptable? Define retention and recovery objectives before choosing capacity.</li>
        </ul>
        <p>Make these decisions visible to both source owners and consumer teams. A pipeline can deliver every message while still producing an incorrect target if it uses the wrong key or omits deletes.</p>
      </section>

      <section id="architecture">
        <h2>A reference architecture</h2>
        <ArticleDiagram
          steps={["Oracle redo → GoldenGate Extract captures configured changes", "GoldenGate trails → durable staging and configured transport", "Kafka delivery handler / Replicat → versioned topic records", "Kafka consumers → validated, idempotent target updates"]}
          caption="Read in numbered order. Capture, trails, Kafka delivery, and target application are separate recovery boundaries. Each stage needs its own checkpoint, monitoring, and retention policy; this is a conceptual design, not a deployment diagram."
        />
        <p>Trail files decouple capture from delivery, but their disk is finite. Kafka decouples delivery from consumption, but topic retention is also finite. A slow sink can exhaust the recovery window even while capture appears healthy.</p>
        <p>Define an event envelope that includes the source/table identity, operation, key, payload, schema version, and enough source-position metadata to support auditing and deduplication. Not every formatter emits the same fields. Inspect actual insert, update, and delete samples from the chosen formatter instead of assuming a universal GoldenGate JSON schema.</p>
      </section>

      <section id="ordering">
        <h2>Partition keys and transaction boundaries</h2>
        <p>Kafka preserves log order within a partition, not globally across a topic. For row-level materialization, a consistently serialized primary key is often a useful message key: updates to that row go to the same partition while the partitioning scheme is unchanged. A table name alone can concentrate the entire table on one partition; a random key can scatter related updates and break the ordering a consumer expects.</p>
        <p>Changing a topic’s partition count can change key-to-partition mapping. Do not assume a key’s old and new records remain in one ordered stream after repartitioning. Plan a controlled migration, drain old partitions or use a new topic, and verify consumer behavior before making the change.</p>
        <p>The documented Kafka Handler exposes operation mode (<code>op</code>) and transaction mode (<code>tx</code>). Operation mode produces a record per captured operation. Transaction mode combines operations into a message, which can become large; the documented 21.1 handler uses a null record key in that mode. Topic selection and multi-table transactions need special care. Validate behavior for the exact handler rather than copying a configuration from a different integration.</p>
        <p><strong>GoldenGate transaction mode is not the same as Kafka producer transactions.</strong> Packaging a source transaction into a payload does not automatically make downstream writes atomic. If a consumer needs multi-row consistency, it must interpret transaction boundaries and apply changes atomically where its target supports that. Per-table operation topics may require explicit coordination across topics.</p>
      </section>

      <section id="recovery">
        <h2>Replay-safe consumers and recovery</h2>
        <p>Design for possible redelivery unless the complete path has a verified stronger guarantee. Kafka producer idempotence addresses duplicate writes from producer retries in its supported scope; it does not deduplicate every source restart or make an external database write exactly once. Kafka’s transactional read-process-write guarantees apply within Kafka when the producer, consumer offsets, and isolation settings cooperate.</p>
        <p>A sink commonly commits its Kafka offset only after applying the target change. If it crashes between those two actions, it reads the change again. Make that safe using an atomic target transaction that records an event identity and applies the change together, or an equivalent sink-supported mechanism. A stable identity can combine source stream, transaction position, and operation index, if those fields are available. A source SCN alone need not uniquely identify each row operation.</p>
        <p>An upsert is useful but not sufficient: an older replayed update can overwrite a newer value, and a late replay can resurrect a deleted row. Where the source contract exposes comparable versions, persist the last applied version and reject stale changes; retain delete/version information for the required replay horizon. Test key changes and partial update payloads explicitly.</p>
        <p>For invalid records, choose a policy: stop the affected stream, or quarantine the record with source position and an audited repair path. Blindly skipping a failed update can corrupt state even if consumer lag falls to zero. A dead-letter topic needs access controls, retention, and replay procedures—not just a producer call.</p>
      </section>

      <section id="schema">
        <h2>Bootstrap and schema evolution</h2>
        <p>CDC alone does not supply rows that existed before capture began. Coordinate an initial load with a consistent source snapshot and a known CDC boundary. Retain changes during the load, reconcile overlap, and prove that no gap exists between snapshot and streaming. The specific initial-load procedure depends on the source and GoldenGate deployment; use the supported Oracle approach for that environment.</p>
        <p>Treat schema changes as releases. Additive nullable fields are often easier to roll out than renames or type changes, but actual compatibility depends on the serialization format and consumers. If using Avro or another schema-managed format, define compatibility checks and registry ownership. Distinguish an absent field, a null value, and a deleted row. Test numeric precision, time zones, large objects, and before/after image availability against real samples.</p>
      </section>

      <section id="scale">
        <h2>Scale the bottleneck, not the diagram</h2>
        <p>Measure capture lag, trail growth, delivery throughput, broker health, partition skew, consumer processing time, and target write latency separately. Adding consumers cannot accelerate a single hot partition indefinitely, and adding partitions cannot repair a slow target transaction. Preserve required ordering when adding parallelism inside a consumer.</p>
        <p>Use representative workloads: event bytes, transaction-size distribution, peak bursts, hot keys, and target costs matter more than an average rows-per-second figure. Producer batching and compression can improve efficiency at a latency cost; large transaction payloads must fit the configured producer, broker, and consumer limits. Benchmark before setting those limits, and monitor memory pressure.</p>
        <p>Set acknowledgement, replication, in-sync replica, retry, and timeout policies deliberately for the supported producer client. Do not treat <code>acks=all</code> as a substitute for a replication or recovery plan. Size trails and Kafka retention to cover the longest credible outage plus catch-up time, then alert well before either budget is exhausted.</p>
      </section>

      <section id="operations">
        <h2>Observe, secure, and rehearse</h2>
        <p>Monitor end-to-end freshness as well as offsets. Low Kafka lag can hide stalled source capture, and record counts can hide a small number of very expensive events. Reconcile target counts and checksums at consistent comparison boundaries; comparing a changing source to an unrelated target instant creates misleading mismatches.</p>
        <p>Use encrypted transport, narrowly scoped Kafka ACLs and database permissions, and controlled secrets rotation. Redact sensitive payloads from logs and review whether CDC topics expose fields that downstream users should never receive.</p>
        <ul>
          <li>Kill a consumer after a target commit but before an offset commit. Verify that replay changes nothing twice.</li>
          <li>Interrupt delivery, restore it, and verify source-to-target completeness and catch-up time.</li>
          <li>Exercise a large transaction, hot key, schema change, delete, and malformed event.</li>
          <li>Simulate retention exhaustion and document whether recovery requires replay or a new initial load.</li>
        </ul>
        <p>The practical goal is a pipeline whose correctness and recovery can be demonstrated. Throughput is useful only when the data arriving at the destination still means what the source intended.</p>
      </section>

      <section id="sources">
        <h2>Sources and further reading</h2>
        <p>These official references support the product-specific behavior described above. The architecture, checklist, and tradeoffs are general guidance; no throughput results or personal project outcomes are asserted.</p>
        <ul>
          <li><a href="https://docs.oracle.com/en/middleware/goldengate/big-data/21.1/gadbd/apache-kafka-target.html">Oracle GoldenGate Big Data 21.1: Apache Kafka target</a> — operation/transaction modes, formatting, and partition selection.</li>
          <li><a href="https://kafka.apache.org/41/design/design/">Apache Kafka 4.1 design</a> — partitioning, delivery semantics, and the scope of transactions.</li>
        </ul>
      </section>
    </>
  );
}
