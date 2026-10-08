import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import express from "express";
import { createServer } from "node:http";
import { ReplitConnectors } from "@replit/connectors-sdk";
import { registerContactRoutes } from "./contact";
import { deliverContact, type DeliverContact } from "./contact-delivery";
import { contactSchema } from "../shared/contact";

const message = { name: "Test Visitor", email: "visitor@example.com", message: "A valid contact message." };

async function withEndpoint(deliver: DeliverContact, run: (url: string) => Promise<void>) {
  const app = express();
  app.use(express.json());
  registerContactRoutes(app, deliver);
  const server = createServer(app);
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert(address && typeof address !== "string");
  try {
    await run(`http://127.0.0.1:${address.port}/api/contact`);
  } finally {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
}

function submit(url: string, body: unknown = message, extraHeaders: Record<string, string> = {}) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Contact-Submission-Id": randomUUID(), ...extraHeaders },
    body: JSON.stringify(body),
  });
}

test("shared validation trims values and rejects invalid or oversized fields", () => {
  assert.equal(contactSchema.parse({ ...message, name: " Test Visitor " }).name, message.name);
  for (const invalid of [
    { ...message, name: "  " }, { ...message, name: "Name\nInjected" },
    { ...message, email: "invalid" }, { ...message, message: "short" },
    { ...message, message: "a".repeat(5001) }, { ...message, to: "attacker@example.com" },
  ]) assert.equal(contactSchema.safeParse(invalid).success, false);
});

test("only a confirmed provider acceptance returns queued success", async () => {
  let called = false;
  await withEndpoint(async (input, id) => {
    assert.deepEqual(input, message);
    assert.match(id, /^[a-f0-9-]{36}$/);
    called = true;
    return randomUUID();
  }, async url => {
    const result = await submit(url);
    assert.equal(result.status, 202);
    assert.deepEqual(await result.json(), { status: "queued" });
    assert(called);
  });
});

test("provider failures never appear as success", async () => {
  await withEndpoint(async () => { throw new Error("Provider unavailable"); }, async url => {
    const result = await submit(url);
    assert.equal(result.status, 503);
    const body = await result.json();
    assert.equal(body.status, undefined);
    assert.match(body.message, /couldn't confirm/);
  });
});

test("invalid submissions and cross-site requests never call the provider", async () => {
  await withEndpoint(async () => { assert.fail("Provider must not be called"); }, async url => {
    assert.equal((await submit(url, { ...message, email: "invalid" })).status, 400);
    assert.equal((await submit(url, message, { "X-Contact-Submission-Id": "invalid" })).status, 400);
    assert.equal((await submit(url, message, { "Sec-Fetch-Site": "cross-site" })).status, 403);
  });
});

test("rate limit blocks repeated delivery attempts", async () => {
  let count = 0;
  await withEndpoint(async () => { count++; return randomUUID(); }, async url => {
    for (let i = 0; i < 5; i++) assert.equal((await submit(url)).status, 202);
    const response = await submit(url);
    assert.equal(response.status, 429);
    assert(response.headers.get("Retry-After"));
    assert.equal(count, 5);
  });
});

test("delivery uses fixed server recipients, reply-to and retry idempotency; rejects provider errors", async t => {
  const id = randomUUID();
  const proxy = t.mock.method(ReplitConnectors.prototype, "proxy", async (_name, _path, options) => {
    assert.equal(_name, "resend");
    assert.equal(_path, "/emails");
    assert.equal(options.headers["Idempotency-Key"], `contact/${id}`);
    assert.equal(options.body.reply_to, message.email);
    assert.deepEqual(options.body.to, [process.env.CONTACT_TO_EMAIL]);
    return Response.json({ id });
  });
  assert.equal(await deliverContact(message, id), id);
  proxy.mock.mockImplementation(async () => Response.json({ error: "rejected" }, { status: 403 }));
  await assert.rejects(deliverContact(message, id), /rejected/);
  proxy.mock.mockImplementation(async () => Response.json({}));
  await assert.rejects(deliverContact(message, id), /did not confirm/);
  proxy.mock.mockImplementation(async () => { throw new Error("network failure"); });
  await assert.rejects(deliverContact(message, id), /network failure/);
});
