import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getGetMeQueryKey, useRegister } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TerminalSquare, Loader2 } from "lucide-react";
import { getApiErrorMessage, saveAuthToken } from "@/lib/auth-token";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Alphanumeric only"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function Register() {
  const [, setLocation] = useLocation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const registerMutation = useRegister();
  const queryClient = useQueryClient();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    setErrorMsg(null);
    registerMutation.mutate(
      { data },
      {
        onSuccess: (response) => {
          saveAuthToken(response.token);
          queryClient.setQueryData(getGetMeQueryKey(), response.user);
          setLocation("/dashboard");
        },
        onError: (err) => {
          setErrorMsg(getApiErrorMessage(err, "Initialization failed. Try another alias."));
        },
      }
    );
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      
      <Card className="w-full max-w-md border-primary/20 bg-card/60 backdrop-blur-xl shadow-2xl z-10">
        <CardHeader className="space-y-3 text-center pb-8">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-2 border border-primary/20">
            <TerminalSquare className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold font-mono tracking-tight">System Initialization</CardTitle>
          <CardDescription>Create your unique operator profile</CardDescription>
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
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase tracking-wider">Operator Alias</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="zero_cool" 
                        {...field} 
                        className="font-mono bg-background/50 border-border/50 focus-visible:border-primary/50" 
                        autoComplete="username"
                      />
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
                    <FormLabel className="font-mono text-xs uppercase tracking-wider">Encryption Key</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        className="font-mono bg-background/50 border-border/50 focus-visible:border-primary/50"
                        autoComplete="new-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(57,255,20,0.2)] hover:shadow-[0_0_25px_rgba(57,255,20,0.4)]"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Compiling...
                  </>
                ) : (
                  "Create Profile"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center border-t border-border/40 pt-6">
          <p className="text-sm text-muted-foreground">
            Already registered?{" "}
            <Link href="/login" className="text-primary hover:underline font-mono">
              Access Terminal
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
