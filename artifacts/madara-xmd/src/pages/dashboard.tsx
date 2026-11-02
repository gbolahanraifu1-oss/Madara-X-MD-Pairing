import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useRequestPairing,
  useGetPairingStatus,
  getGetPairingStatusQueryKey,
  useDisconnectBot,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Smartphone,
  PowerOff,
  Loader2,
  ShieldCheck,
  Eye,
  Zap,
  Copy,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const pairingSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, "Valid phone number required with country code"),
  method: z.literal("code"),
  pairingMode: z.literal("custom"),
});

type PairingFormValues = z.infer<typeof pairingSchema>;

function apiBase() {
  return (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
}

export function Dashboard() {
  const queryClient = useQueryClient();
  const { data: status } = useGetPairingStatus({
    query: {
      refetchInterval: 15000,
      refetchIntervalInBackground: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      retry: 3,
      queryKey: getGetPairingStatusQueryKey(),
    },
  });

  const requestPairing = useRequestPairing();
  const disconnectBot = useDisconnectBot();
  const [activeRequest, setActiveRequest] = useState<{
    type: "code";
    data: string;
  } | null>(null);
  const [uptime, setUptime] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  // VPS bot process via pairApi /health — NOT WhatsApp session
  const [vpsOnline, setVpsOnline] = useState<boolean | null>(null);
  const [vpsError, setVpsError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    const checkVps = async () => {
      try {
        const res = await fetch(`${apiBase()}/api/pairing/server-status`, {
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        if (!alive) return;
        const online = Boolean(data.online || data.reachable);
        setVpsOnline(online);
        setVpsError(online ? null : data.error || "Bot server unreachable");
      } catch (e) {
        if (!alive) return;
        setVpsOnline(false);
        setVpsError(e instanceof Error ? e.message : "Bot server unreachable");
      }
    };

    checkVps();
    const t = setInterval(checkVps, 15000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const form = useForm<PairingFormValues>({
    resolver: zodResolver(pairingSchema),
    defaultValues: {
      phoneNumber: "",
      method: "code",
      pairingMode: "custom",
    },
  });

  useEffect(() => {
    if (status?.connected && status?.uptimeSeconds != null) {
      setUptime(status.uptimeSeconds);
      const interval = setInterval(() => {
        setUptime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
    return;
  }, [status?.connected, status?.uptimeSeconds]);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `\( {h.toString().padStart(2, "0")}: \){m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleCopy = () => {
    if (!activeRequest) return;
    navigator.clipboard.writeText(activeRequest.data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmit = (data: PairingFormValues) => {
    setActiveRequest(null);
    requestPairing.mutate(
      {
        data: {
          phoneNumber: data.phoneNumber,
          method: data.method,
          pairingMode: "custom",
        },
      },
      {
        onSuccess: (res) => {
          if (data.method === "code" && res.pairingCode) {
            setActiveRequest({ type: "code", data: res.pairingCode });
          }
        },
      },
    );
  };

  const handleDisconnect = () => {
    disconnectBot.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetPairingStatusQueryKey(),
        });
        setActiveRequest(null);
      },
    });
  };

  const isConnected = Boolean(status?.connected);

  return (
    <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full space-y-8 relative">
      <div
        className="fixed inset-0 z-[-1] pointer-events-none"
        style={{
          backgroundImage: "url(/sharingan.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          opacity: 0.18,
        }}
      />
      <div className="fixed inset-0 z-[-2] bg-background" />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.03] z-[-1] pointer-events-none animate-sharingan text-primary">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="50" cy="50" r="12" fill="currentColor" />
        </svg>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/40 border border-border p-6 rounded-2xl backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tight">
            Pairing Chamber
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-mono">
            Manage your WhatsApp pairing session.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* VPS bot process */}
          <div
            className={
              "flex items-center gap-2 border px-4 py-2 rounded-lg min-w-[180px] " +
              (vpsOnline
                ? "border-emerald-500/40 bg-emerald-500/10"
                : vpsOnline === false
                  ? "border-red-500/40 bg-red-500/10"
                  : "border-border/50 bg-background/80")
            }
          >
            <motion.div
              animate={
                vpsOnline
                  ? { opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }
                  : { opacity: 1 }
              }
              transition={{ duration: 1.4, repeat: Infinity }}
              className={
                "h-3 w-3 rounded-full shrink-0 " +
                (vpsOnline
                  ? "bg-emerald-400 shadow-[0_0_12px_#34d399,0_0_24px_#34d39988]"
                  : vpsOnline === false
                    ? "bg-red-500 shadow-[0_0_8px_#ef4444aa]"
                    : "bg-muted-foreground/50")
              }
            />
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono font-bold">
                VPS Bot
              </span>
              <span
                className={
                  "font-mono font-bold tracking-[0.15em] text-sm " +
                  (vpsOnline
                    ? "text-emerald-400 drop-shadow-[0_0_8px_#34d399aa]"
                    : vpsOnline === false
                      ? "text-red-400 drop-shadow-[0_0_6px_#ef4444aa]"
                      : "text-muted-foreground")
                }
              >
                {vpsOnline === null
                  ? "𝙼𝙰𝙳𝙰𝚁𝙰 …"
                  : vpsOnline
                    ? "𝙼𝙰𝙳𝙰𝚁𝙰 𝙾𝙽𝙻𝙸𝙽𝙴"
                    : "𝙼𝙰𝙳𝙰𝚁𝙰 𝙾𝙵𝙵𝙻𝙸𝙽𝙴"}
              </span>
              {vpsOnline === false && vpsError && (
                <span className="text-[10px] font-mono text-red-400/90 truncate max-w-[200px]">
                  {vpsError}
                </span>
              )}
            </div>
          </div>

          {/* WhatsApp session — existing */}
          <div className="flex items-center gap-4 border border-border/50 bg-background/80 px-4 py-2 rounded-lg">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono font-bold">
                Session
              </span>
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ opacity: isConnected ? [0.5, 1, 0.5] : 1 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className={`h-3 w-3 rounded-full ${
                    isConnected
                      ? "bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.8)]"
                      : "bg-destructive"
                  }`}
                />
                <span className="font-mono font-bold tracking-widest uppercase text-sm">
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>

            {isConnected && (
              <div className="pl-4 border-l border-border/50 flex flex-col">
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono font-bold">
                  Uptime
                </span>
                <span className="font-mono font-bold tracking-widest text-sm text-primary">
                  {formatUptime(uptime)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 relative z-10">
        {/* Pairing Panel */}
        <Card className="border-border/50 bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="font-mono text-xl">Link Your Device</CardTitle>
            <CardDescription className="font-mono">
              Enter details to pair a new device
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isConnected ? (
              <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center h-[300px] border border-primary/20 bg-primary/5 rounded-xl">
                <ShieldCheck className="w-16 h-16 text-primary" />
                <div>
                  <h3 className="text-xl font-bold font-mono text-foreground mb-2">
                    Connected
                  </h3>
                  <p className="text-muted-foreground font-mono text-sm max-w-xs">
                    Paired with: {status?.phoneNumber}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  className="font-mono uppercase tracking-widest mt-4"
                  onClick={handleDisconnect}
                  disabled={disconnectBot.isPending}
                >
                  {disconnectBot.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <PowerOff className="h-4 w-4 mr-2" />
                  )}
                  Disconnect
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-xs uppercase tracking-wider">
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Smartphone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              placeholder="e.g. 234xxxxxxxx"
                              className="pl-10 font-mono bg-background/80"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <p className="font-mono text-sm font-bold tracking-widest uppercase text-primary">
                      Custom Pairing Code
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Uses the bot&apos;s configured pairing code automatically.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full font-mono uppercase tracking-widest shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
                    disabled={requestPairing.isPending}
                  >
                    {requestPairing.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <Zap className="h-5 w-5 mr-2" />
                    )}
                    Begin Pairing
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card className="border-border/50 bg-card/60 backdrop-blur-md overflow-hidden flex flex-col">
          <CardHeader className="bg-background/60 border-b border-border/50 pb-4">
            <CardTitle className="font-mono text-xl flex items-center justify-between">
              Pairing Status
              {activeRequest && (
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center p-8 min-h-[300px]">
            <AnimatePresence mode="wait">
              {isConnected ? (
                <motion.div
                  key="connected"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 border border-primary/20">
                    <ShieldCheck className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="font-mono font-bold text-2xl mb-2 text-foreground">
                    Session Online
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-sm font-mono">
                    WhatsApp is linked. Go to the console to view logs.
                  </p>
                </motion.div>
              ) : activeRequest ? (
                <motion.div
                  key="request"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full flex flex-col items-center justify-center space-y-4"
                >
                  <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">
                    Custom Pairing Code
                  </p>

                  <div className="w-full rounded-xl border border-primary/30 bg-background overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 bg-muted/20">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        WhatsApp Link Code
                      </span>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1 rounded border border-border/60 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3 w-3 text-primary" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-center px-6 py-5">
                      <span className="font-mono text-2xl font-bold tracking-[0.3em] text-primary select-all">
                        {activeRequest.data}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground font-mono text-center">
                    Enter this code in WhatsApp → Linked Devices → Link a
                    Device.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-muted-foreground/50"
                >
                  <Eye className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="font-mono uppercase tracking-widest text-sm">
                    Ready to Pair
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}