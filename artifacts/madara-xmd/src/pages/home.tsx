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

      {/* Ad Banner Placeholder 1 */}
      <div className="w-full max-w-4xl mx-auto px-4 mb-16">
        <div className="w-full h-24 md:h-32 rounded-lg border border-border/50 bg-muted/30 flex items-center justify-center overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
          <span className="text-xs tracking-widest text-muted-foreground uppercase font-mono">Advertisement</span>
        </div>
      </div>

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
                  <CardDescription className="font-sans">Connect your bot in seconds using our ultra-fast QR or 8-digit code protocol.</CardDescription>
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

      {/* Ad Banner Placeholder 2 */}
      <div className="w-full max-w-4xl mx-auto px-4 mb-24">
        <div className="w-full h-24 md:h-32 rounded-lg border border-border/50 bg-muted/30 flex items-center justify-center overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
          <span className="text-xs tracking-widest text-muted-foreground uppercase font-mono">Advertisement</span>
        </div>
      </div>
    </div>
  );
}
