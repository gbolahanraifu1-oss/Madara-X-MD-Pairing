import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { getGetMeQueryKey, useGetMe, useLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Moon, Sun, Eye, LayoutDashboard, Send, Home, LogOut, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import {
  FaWhatsapp,
  FaInstagram,
  FaYoutube,
  FaTiktok
} from "react-icons/fa6";
import { SiReact } from "react-icons/si";
import { clearAuthToken } from "@/lib/auth-token";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading } = useGetMe();
  const logout = useLogout();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        clearAuthToken();
        queryClient.setQueryData(getGetMeQueryKey(), undefined);
        setLocation("/login");
      }
    });
  };

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, protected: true },
    { href: "/console", label: "Console", icon: Eye, protected: true },
    { href: "/contact", label: "Contact", icon: Send },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center px-4 md:px-8">
          <Link href="/" className="mr-8 flex items-center space-x-2 cursor-pointer group">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-primary/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
              <Eye className="h-6 w-6 text-primary relative z-10" />
            </div>
            <span className="font-mono font-bold tracking-tighter text-lg bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 group-hover:from-primary group-hover:to-primary/70 transition-all">
              ᴍᴀᴅᴀʀᴀ x-ᴍᴅ
            </span>
          </Link>

          <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => {
              if (link.protected && !user) return null;
              
              const isActive = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors hover:text-primary hidden md:flex items-center gap-2 ${
                    isActive ? "text-foreground" : "text-foreground/60"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-2 md:space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 md:hidden"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-mono text-primary hidden sm:inline-block">
                      @{user.username}
                    </span>
                    <Button variant="outline" size="sm" onClick={handleLogout} className="font-mono gap-2 border-primary/20 hover:border-primary/50">
                      <LogOut className="h-4 w-4" />
                      Exit
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex font-mono">
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button size="sm" asChild className="font-mono shadow-[0_0_10px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all">
                      <Link href="/register">Initialize</Link>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-border/40 bg-background/98 md:hidden">
            <nav className="container flex flex-col gap-1 px-4 py-3" aria-label="Mobile navigation">
              {navLinks.map((link) => {
                if (link.protected && !user) return null;
                const isActive = location === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={"flex items-center gap-3 rounded-md px-3 py-3 font-mono text-sm transition-colors hover:bg-primary/10 hover:text-primary " + (isActive ? "bg-primary/10 text-primary" : "text-foreground/70")}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row max-w-screen-2xl px-4 md:px-8">
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2 md:px-0">
            <Eye className="h-5 w-5 text-muted-foreground hidden md:block" />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left font-mono">
              &copy; ᴍᴀᴅᴀʀᴀ x-ᴍᴅ | ɪɴᴄ. 2026. All rights reserved.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <a href="https://wa.me/1234567890" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <FaWhatsapp className="h-5 w-5" />
            </a>
            <a href="https://instagram.com/madara_xmd" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <FaInstagram className="h-5 w-5" />
            </a>
            <a href="https://youtube.com/@madara_xmd" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <FaYoutube className="h-5 w-5" />
            </a>
            <a href="https://tiktok.com/@madara_xmd" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <FaTiktok className="h-5 w-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
