import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { TerminalSquare } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
      <TerminalSquare className="h-16 w-16 text-primary mb-6 opacity-50" />
      <h1 className="text-6xl font-black font-mono tracking-tighter text-foreground mb-4">404</h1>
      <h2 className="text-xl font-mono text-muted-foreground uppercase tracking-widest mb-8">
        Sector Not Found
      </h2>
      <p className="text-muted-foreground max-w-md mb-8">
        The system path you're trying to access doesn't exist or requires higher clearance.
      </p>
      <Button asChild className="font-mono uppercase tracking-widest">
        <Link href="/">Return to Base</Link>
      </Button>
    </div>
  );
}
