import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters")
    .max(100, "Name must be no more than 100 characters")
    .regex(/^[^\r\n\u0000]+$/, "Name must not contain line breaks"),
  email: z.string().trim().email("Invalid email address").max(254),
  message: z.string().trim().min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be no more than 5,000 characters"),
}).strict();

export type ContactMessage = z.infer<typeof contactSchema>;
