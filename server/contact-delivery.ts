import { ReplitConnectors } from "@replit/connectors-sdk";
import { z } from "zod";
import type { ContactMessage } from "../shared/contact";

export type DeliverContact = (message: ContactMessage, submissionId: string) => Promise<string>;

const configSchema = z.object({
  to: z.string().email(),
  from: z.string().email(),
});

export const deliverContact: DeliverContact = async (message, submissionId) => {
  const config = configSchema.safeParse({
    to: process.env.CONTACT_TO_EMAIL,
    from: process.env.CONTACT_FROM_EMAIL,
  });
  if (!config.success) throw new Error("Contact email configuration is missing or invalid");

  // Create a fresh client for each request; the connector manages credentials.
  const connectors = new ReplitConnectors();
  const delivery = (async () => {
    const response = await connectors.proxy("resend", "/emails", {
      method: "POST",
      headers: { "Idempotency-Key": `contact/${submissionId}` },
      body: {
        from: `Portfolio Contact <${config.data.from}>`,
        to: [config.data.to],
        reply_to: message.email,
        subject: `Portfolio contact: ${message.name}`,
        text: `Name: ${message.name}\nEmail: ${message.email}\n\n${message.message}`,
      },
    });
    if (!response.ok) throw new Error(`Email provider rejected contact delivery (${response.status})`);
    const result = z.object({ id: z.string().uuid() }).safeParse(await response.json());
    if (!result.success) throw new Error("Email provider did not confirm message acceptance");
    return result.data.id;
  })();

  // The SDK has no AbortSignal option. Bound the response time; reuse the same
  // idempotency key on retries if the provider accepted a timed-out request.
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      delivery,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Email delivery confirmation timed out")), 15000);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
};
