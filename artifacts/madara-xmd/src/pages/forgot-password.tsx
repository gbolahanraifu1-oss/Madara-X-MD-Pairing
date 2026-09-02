import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForgotPassword } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TerminalSquare, Loader2, KeyRound } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export function ForgotPassword() {
  const [success, setSuccess] = useState(false);
  const forgotMutation = useForgotPassword();

  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotFormValues) => {
    forgotMutation.mutate(
      { data },
      {
        onSuccess: () => {
          setSuccess(true);
        },
      }
    );
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      
      <Card className="w-full max-w-md border-primary/20 bg-card/60 backdrop-blur-xl shadow-2xl z-10">
        <CardHeader className="space-y-3 text-center pb-8">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-2 border border-primary/20">
            {success ? <KeyRound className="h-8 w-8 text-primary" /> : <TerminalSquare className="h-8 w-8 text-primary" />}
          </div>
          <CardTitle className="text-2xl font-bold font-mono tracking-tight">Key Recovery</CardTitle>
          <CardDescription>
            {success ? "Recovery sequence initiated." : "Enter your email to request a new encryption key."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-4 py-4">
              <p className="text-sm text-muted-foreground font-mono">
                If the email exists in our secure database, you will receive instructions to reset your key.
              </p>
              <Button asChild className="w-full font-mono uppercase tracking-widest mt-4">
                <Link href="/login">Return to Login</Link>
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs uppercase tracking-wider">Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="hacker@madara.inc" 
                          {...field} 
                          className="font-mono bg-background/50 border-border/50 focus-visible:border-primary/50" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(57,255,20,0.2)] hover:shadow-[0_0_25px_rgba(57,255,20,0.4)]"
                  disabled={forgotMutation.isPending}
                >
                  {forgotMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    "Initiate Recovery"
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        {!success && (
          <CardFooter className="justify-center border-t border-border/40 pt-6">
            <p className="text-sm text-muted-foreground">
              Remember your key?{" "}
              <Link href="/login" className="text-primary hover:underline font-mono">
                Access Terminal
              </Link>
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
