import { useEffect, useRef } from "react";
import { useGetConsoleLogs, getGetConsoleLogsQueryKey, useClearConsoleLogs } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Terminal, Trash2, Loader2, RotateCw } from "lucide-react";
import { format } from "date-fns";

export function Console() {
  const queryClient = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const { data: logs, isLoading, isFetching, error } = useGetConsoleLogs({
    query: {
      refetchInterval: 3000,
      queryKey: getGetConsoleLogsQueryKey()
    }
  });

  const clearLogs = useClearConsoleLogs();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleClear = () => {
    clearLogs.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetConsoleLogsQueryKey() });
      }
    });
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case "info": return "text-cyan-400";
      case "warn": return "text-yellow-400";
      case "error": return "text-destructive";
      case "success": return "text-primary";
      case "debug": return "text-muted-foreground";
      default: return "text-foreground";
    }
  };

  const logEntries = Array.isArray(logs) ? logs : [];
  const formatLogTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime()) ? "--:--:--.---" : format(date, "HH:mm:ss.SSS");
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tight flex items-center gap-3">
            <Terminal className="h-8 w-8 text-primary" />
            System Console
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-mono">Live telemetry from active bot sessions.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-4">
            <RotateCw className={`h-4 w-4 text-muted-foreground ${isFetching ? "animate-spin text-primary" : ""}`} />
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Live</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="font-mono text-xs uppercase tracking-widest border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            onClick={handleClear}
            disabled={clearLogs.isPending || logEntries.length === 0}
          >
            {clearLogs.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
            Clear Logs
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-[500px] bg-background border border-border/50 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col">
        {/* Terminal Header */}
        <div className="h-10 bg-muted/30 border-b border-border/50 flex items-center px-4 gap-2">
          <div className="h-3 w-3 rounded-full bg-destructive/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-primary/80" />
          <div className="mx-auto font-mono text-xs text-muted-foreground uppercase tracking-widest flex-1 text-center">
            madara-xmd-tty1
          </div>
        </div>

        {/* Terminal Body */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-sm bg-black/40 backdrop-blur-sm">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center text-destructive/80 text-center">
              <Terminal className="h-12 w-12 mb-4" />
              <p className="uppercase tracking-widest text-xs">Unable to load logs</p>
              <p className="mt-2 text-xs text-muted-foreground">Please sign in again and retry.</p>
            </div>
          ) : logEntries.length > 0 ? (
            <div className="space-y-1">
              <div className="text-primary mb-4 opacity-70">
                <p>Welcome to ᴍᴀᴅᴀʀᴀ x-ᴍᴅ Telemetry Console.</p>
                <p>Establishing secure connection...</p>
                <p>Connection established. Listening for events.</p>
                <p>--------------------------------------------------</p>
              </div>
              
              {logEntries.map((log) => (
                <div key={log.id} className="flex gap-3 hover:bg-white/5 py-0.5 px-2 rounded-sm transition-colors">
                  <span className="text-muted-foreground/50 shrink-0">
                    [{formatLogTime(log.timestamp)}]
                  </span>
                  <span className={`uppercase tracking-widest w-16 shrink-0 ${getLogColor(log.level)}`}>
                    {log.level}
                  </span>
                  <span className="text-foreground break-all whitespace-pre-wrap">
                    {log.message}
                  </span>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30">
              <Terminal className="h-12 w-12 mb-4" />
              <p className="uppercase tracking-widest text-xs">No active logs</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
