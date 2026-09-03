import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TerminalSquare, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function Login() {
  const [, setLocation] = useLocation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const loginMutation = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setErrorMsg(null);
    loginMutation.mutate(
      { data },
      {
        onSuccess: () => {
          setLocation("/dashboard");
        },
        onError: (err: any) => {
          setErrorMsg(err?.response?.data?.error || "Failed to login. Check your credentials.");
        },
      }
    );
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      
      <Card className="w-full max-w-md border-primary/20 bg-card/60 backdrop-blur-xl shadow-2xl z-10">
        <CardHeader className="space-y-3 text-center pb-8">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-2 border border-primary/20">
            <TerminalSquare className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold font-mono tracking-tight">Access Terminal</CardTitle>
          <CardDescription>Authenticate to access your automated session</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {errorMsg && (
                <div className="p-3 text-sm font-mono text-destructive border border-destructive/30 bg-destructive/10 rounded-md">
                  &gt; ERROR: {errorMsg}
                </div>
              )}
              
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
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="font-mono text-xs uppercase tracking-wider">Password</FormLabel>
                      <Link href="/forgot-password" className="text-xs text-primary hover:underline font-mono">
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        className="font-mono bg-background/50 border-border/50 focus-visible:border-primary/50"
                        autoComplete="current-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(57,255,20,0.2)] hover:shadow-[0_0_25px_rgba(57,255,20,0.4)]"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authenticating...
                  </>
                ) : (
                  "Execute Login"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center border-t border-border/40 pt-6">
          <p className="text-sm text-muted-foreground">
            No access clearance?{" "}
            <Link href="/register" className="text-primary hover:underline font-mono">
              Initialize account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
