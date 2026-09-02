import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSubmitContact } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Loader2, MessageSquare } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function Contact() {
  const [success, setSuccess] = useState(false);
  const submitContact = useSubmitContact();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    submitContact.mutate(
      { data },
      {
        onSuccess: () => {
          setSuccess(true);
          form.reset();
        }
      }
    );
  };

  return (
    <div className="flex-1 p-4 py-12 md:py-24 max-w-3xl mx-auto w-full relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <Card className="border-border/50 bg-card/60 backdrop-blur shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-3 pb-8">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-2 border border-primary/20">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-mono tracking-tight">Transmission Channel</CardTitle>
          <CardDescription>Send a secure message to the engineering team.</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50">
                <Send className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-mono font-bold text-foreground">Message Transmitted</h3>
              <p className="text-muted-foreground max-w-sm">
                Your message has been securely delivered to our servers. We will respond shortly.
              </p>
              <Button 
                variant="outline" 
                className="mt-4 font-mono uppercase tracking-widest"
                onClick={() => setSuccess(false)}
              >
                Send Another
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-xs uppercase tracking-wider">Operator Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" className="bg-background/50 font-mono" {...field} />
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
                        <FormLabel className="font-mono text-xs uppercase tracking-wider">Return Address</FormLabel>
                        <FormControl>
                          <Input placeholder="operator@network.net" className="bg-background/50 font-mono" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs uppercase tracking-wider">Subject Directive</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. API Integration Issue" className="bg-background/50 font-mono" {...field} />
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
                      <FormLabel className="font-mono text-xs uppercase tracking-wider">Encrypted Payload</FormLabel>
                      <FormControl>
                        <textarea
                          placeholder="Enter your message here..."
                          className="flex w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[150px] font-mono resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full font-mono uppercase tracking-widest"
                  disabled={submitContact.isPending}
                >
                  {submitContact.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Transmitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> Transmit Payload
                    </>
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
