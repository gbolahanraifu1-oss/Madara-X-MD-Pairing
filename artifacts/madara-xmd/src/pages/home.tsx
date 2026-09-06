import { Link } from "wouter";
import { useGetPairingStats } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Shield, Eye, Bot, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { getAuthToken } from "@/lib/auth-token";

export function Home() {
  const { data: stats } = useGetPairingStats();
  const hasSession = Boolean(getAuthToken());
  const protectedDestination = hasSession ? "/dashboard" : "/login";
  const formatCount = (value: unknown) =>
    typeof value === "number" && Number.isFinite(value)
      ? value.toLocaleString()
      : "...";
  const formatUptime = (value: unknown) =>
    typeof value === "number" && Number.isFinite(value)
      ? `${(value / 3600).toFixed(1)}h`
      : "...";

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full relative overflow-hidden flex flex-col items-center justify-center py-24 md:py-32">
        <div className="absolute inset-0 w-full h-full bg-background z-[-1]" />
        
        {/* Subtle grid background */}
        <div className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.05] z-0 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
             
        {/* Decorative spinning sharingan background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.03] z-[0] pointer-events-none animate-sharingan text-primary">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2"/>
            <circle cx="50" cy="50" r="12" fill="currentColor"/>
            <g transform="translate(50, 18) scale(0.6)">
              <circle cx="0" cy="0" r="10" fill="currentColor" />
              <path d="M 0 -10 A 15 15 0 0 1 15 15 Q 15 20 10 25 A 20 20 0 0 0 0 10 Z" fill="currentColor" />
            </g>
            <g transform="translate(22, 66) scale(0.6) rotate(120)">
              <circle cx="0" cy="0" r="10" fill="currentColor" />
              <path d="M 0 -10 A 15 15 0 0 1 15 15 Q 15 20 10 25 A 20 20 0 0 0 0 10 Z" fill="currentColor" />
            </g>
            <g transform="translate(78, 66) scale(0.6) rotate(240)">
              <circle cx="0" cy="0" r="10" fill="currentColor" />
              <path d="M 0 -10 A 15 15 0 0 1 15 15 Q 15 20 10 25 A 20 20 0 0 0 0 10 Z" fill="currentColor" />
            </g>
          </svg>
        </div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="container px-4 md:px-6 relative z-10 text-center max-w-4xl mx-auto space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
            The Eye is Open.
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tighter"
          >
            Welcome to <br className="md:hidden" />
            <span className="font-mono text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50 drop-shadow-[0_0_15px_hsl(var(--primary)/0.3)]">
              ᴍᴀᴅᴀʀᴀ x-ᴍᴅ
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-sans"
          >
            A WhatsApp automation bot of legendary power. Pair your device and unleash ᴍᴀᴅᴀʀᴀ x-ᴍᴅ.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
          >
            <Button size="lg" asChild className="text-lg font-mono shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)]">
              <Link href={protectedDestination}>
                <Zap className="mr-2 h-5 w-5" /> Activate Bot
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg font-mono border-primary/30 hover:border-primary text-foreground">
              <Link href={hasSession ? "/console" : "/login"}>
                <Activity className="mr-2 h-5 w-5" /> View Console
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full bg-muted/20 border-y border-border/40 py-16">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-4xl mx-auto">
            <div className="space-y-2">
              <div className="text-4xl font-mono font-bold text-primary">
                {formatCount(stats?.activeSessions)}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Active Sessions</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-mono font-bold text-foreground">
                {formatCount(stats?.totalUsers)}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Total Users</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-mono font-bold text-foreground">
                {formatCount(stats?.totalSessions)}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Total Pairings</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-mono font-bold text-foreground">
                {formatUptime(stats?.averageUptimeSeconds)}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Avg Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-24">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-mono tracking-tight mb-4">What ᴍᴀᴅᴀʀᴀ x-ᴍᴅ Offers</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to pair, manage, and command your WhatsApp bot.</p>
          </div>
          
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-6"
          >
            <motion.div variants={item}>
              <Card className="bg-card/50 backdrop-blur border-primary/10 hover:border-primary/50 transition-colors duration-300">
                <CardHeader>
                  <Bot className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="font-mono">Instant Pairing</CardTitle>
                  <CardDescription className="font-sans">Connect your bot in seconds using our 8-digit pairing code protocol.</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
            
            <motion.div variants={item}>
              <Card className="bg-card/50 backdrop-blur border-primary/10 hover:border-primary/50 transition-colors duration-300">
                <CardHeader>
                  <Eye className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="font-mono">Live Console</CardTitle>
                  <CardDescription className="font-sans">Monitor your bot's activity in real-time with our terminal-grade log viewer.</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="bg-card/50 backdrop-blur border-primary/10 hover:border-primary/50 transition-colors duration-300">
                <CardHeader>
                  <Shield className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="font-mono">Secure Sessions</CardTitle>
                  <CardDescription className="font-sans">End-to-end encrypted session data ensuring your connection remains private.</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Public guide content for visitors and search crawlers */}
      <section className="w-full border-y border-border/40 bg-card/20 py-20">
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold font-mono tracking-tight md:text-4xl">
              A simple control panel for your WhatsApp automation
            </h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground">
              ᴍᴀᴅᴀʀᴀ x-ᴍᴅ gives bot owners one place to start a WhatsApp session,
              confirm its connection, and follow live activity. The public site
              explains the pairing flow before an account is needed; the dashboard
              is reserved for authenticated session management.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Card className="bg-card/50 border-primary/10">
              <CardHeader><CardTitle className="font-mono">1. Create an account</CardTitle></CardHeader>
              <CardContent className="text-sm leading-7 text-muted-foreground">
                Register an account to keep your pairing session and access the private dashboard.
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-primary/10">
              <CardHeader><CardTitle className="font-mono">2. Request a code</CardTitle></CardHeader>
              <CardContent className="text-sm leading-7 text-muted-foreground">
                Enter your WhatsApp number with its country code and request an 8-digit pairing code.
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-primary/10">
              <CardHeader><CardTitle className="font-mono">3. Monitor the session</CardTitle></CardHeader>
              <CardContent className="text-sm leading-7 text-muted-foreground">
                After WhatsApp confirms the code, use the dashboard status and console to monitor the connected bot.
              </CardContent>
            </Card>
          </div>

          <div className="mx-auto mt-14 max-w-3xl space-y-6 text-sm leading-8 text-muted-foreground">
            <div>
              <h3 className="font-mono text-lg font-semibold text-foreground">What is the pairing code?</h3>
              <p className="mt-2">The pairing code links a WhatsApp account to the bot session running on its configured server. Keep the code private and enter it only in WhatsApp&apos;s linked-devices flow.</p>
            </div>
            <div>
              <h3 className="font-mono text-lg font-semibold text-foreground">Where can I see connection activity?</h3>
              <p className="mt-2">Signed-in users can open the Console to view session events and return to the Dashboard using the navigation menu. Disconnecting a session stops the active bot connection.</p>
            </div>
            <div>
              <h3 className="font-mono text-lg font-semibold text-foreground">Is an account required?</h3>
              <p className="mt-2">Yes. Account access keeps pairing controls and session information separate from this public guide.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
