import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { contactSchema, type ContactMessage } from "@shared/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const pending = useRef<{ payload: string; id: string } | null>(null);
  const submitting = useRef(false);
  const form = useForm<ContactMessage>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  async function onSubmit(values: ContactMessage) {
    if (submitting.current) return;
    submitting.current = true;
    setError(null);
    setSent(false);
    const payload = JSON.stringify(values);
    if (pending.current?.payload !== payload) {
      pending.current = { payload, id: crypto.randomUUID() };
    }
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Contact-Submission-Id": pending.current!.id,
        },
        body: payload,
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(typeof result.message === "string" ? result.message : "Unable to send your message. Please try again.");
      }
      if (response.status !== 202 || result.status !== "queued") {
        throw new Error("We couldn't confirm your message was sent. Please try again.");
      }
      setSent(true);
      toast({
        title: "Message accepted",
        description: "Your message has been queued for email delivery. Thank you for reaching out!",
      });
      form.reset();
      pending.current = null;
    } catch (err) {
      setError(err instanceof Error && err.name === "Error"
        ? err.message
        : "We couldn't confirm your message was sent. Your text is still here; please try again.");
    } finally {
      submitting.current = false;
    }
  }

  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Get In Touch</h2>
          <p className="text-muted-foreground">
            Whether you have a question, a project opportunity, or just want to say hi, my inbox is always open.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg text-primary">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Email</h4>
                  <a href="mailto:contact@ajay.dev" className="text-muted-foreground hover:text-primary">
                    contact@ajay.dev
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg text-primary">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Phone</h4>
                  <span className="text-muted-foreground">+91 98765 43210</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg text-primary">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Location</h4>
                  <span className="text-muted-foreground">India</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} aria-busy={form.formState.isSubmitting}>
                    <fieldset disabled={form.formState.isSubmitting} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" maxLength={100} autoComplete="name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" maxLength={254} autoComplete="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Hello, I'd like to discuss a project..." 
                              className="min-h-[120px]" 
                              maxLength={5000}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                    {sent && <p role="status" className="text-sm">Your message has been queued for email delivery.</p>}
                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                    </fieldset>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
