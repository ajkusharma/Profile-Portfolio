import type { Express } from "express";
import { z } from "zod";
import { contactSchema } from "../shared/contact";
import { deliverContact, type DeliverContact } from "./contact-delivery";

export function registerContactRoutes(app: Express, deliver: DeliverContact = deliverContact) {
  const attempts = new Map<string, { count: number; expires: number }>();
  const windowMs = 10 * 60 * 1000;

  app.post("/api/contact", async (req, res) => {
    res.set("Cache-Control", "no-store");
    if (req.get("Sec-Fetch-Site") === "cross-site") {
      return res.status(403).json({ message: "Please send your message from this website." });
    }
    // Best-effort, per-process abuse protection; no message content is stored.
    const now = Date.now();
    attempts.forEach((attempt, ip) => {
      if (attempt.expires <= now) attempts.delete(ip);
    });
    const ip = req.ip || "unknown";
    const attempt = attempts.get(ip) || { count: 0, expires: now + windowMs };
    if (attempt.count >= 5 || (!attempts.has(ip) && attempts.size >= 10000)) {
      res.set("Retry-After", String(Math.ceil((attempt.expires - now) / 1000)));
      return res.status(429).json({ message: "Too many attempts. Please wait 10 minutes before trying again." });
    }
    attempt.count += 1;
    attempts.set(ip, attempt);

    const parsed = contactSchema.safeParse(req.body);
    const submissionId = z.string().uuid().safeParse(req.get("X-Contact-Submission-Id"));
    if (!parsed.success || !submissionId.success) {
      return res.status(400).json({ message: "Please check your name, email, and message, then try again." });
    }
    try {
      await deliver(parsed.data, submissionId.data);
      // A Resend email ID confirms durable acceptance, not arrival in the inbox.
      return res.status(202).json({ status: "queued" });
    } catch {
      console.error("Contact email delivery could not be confirmed");
      return res.status(503).json({
        message: "We couldn't confirm your message was sent. Your text is still here; please try again.",
      });
    }
  });
}
