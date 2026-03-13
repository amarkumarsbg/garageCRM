"use client";

import { useAuthStore } from "@/store/auth-store";
import { useSidebarStore } from "@/store/sidebar-store";
import { useNotificationStore } from "@/store/notification-store";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationPanel } from "./notification-panel";
import { CommandMenu } from "@/components/shared/command-menu";
import { Bell, LogOut, Moon, Sun, User, Building2, Menu, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export function Header() {
  const { user, currentBranch, logout } = useAuthStore();
  const toggleMobileOpen = useSidebarStore((s) => s.toggleMobileOpen);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdkOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) return null;

  const count = unreadCount();

  return (
    <header className="shrink-0 z-30 h-14 md:h-16 border-b border-border bg-background flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileOpen}
          className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent transition-colors md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="w-4 h-4" />
          <span className="font-medium text-foreground truncate max-w-[200px]">{currentBranch?.name}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => setCmdkOpen(true)}
          className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-muted/50 text-muted-foreground text-sm hover:bg-accent transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="text-xs">Search...</span>
          <kbd className="ml-2 pointer-events-none inline-flex h-5 items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">&#8984;</span>K
          </kbd>
        </button>
        <button
          onClick={() => setCmdkOpen(true)}
          className="flex sm:hidden items-center justify-center w-9 h-9 rounded-lg hover:bg-accent transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>

        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent transition-colors"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent transition-colors"
          >
            <Bell className="w-4 h-4" />
            {count > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold leading-none">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              {/* Mobile: backdrop + fixed full-width panel */}
              <div className="sm:hidden">
                <div className="fixed inset-0 top-14 z-40 bg-black/30" onClick={() => setNotifOpen(false)} />
                <div className="fixed inset-x-0 top-14 z-50 px-3 pt-2">
                  <div className="rounded-xl border border-border bg-card shadow-xl animate-in fade-in-0 slide-in-from-top-2">
                    <NotificationPanel onClose={() => setNotifOpen(false)} />
                  </div>
                </div>
              </div>
              {/* Desktop: absolute dropdown */}
              <div className="hidden sm:block absolute right-0 top-full mt-2 z-50 rounded-xl border border-border bg-card shadow-xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
                <NotificationPanel onClose={() => setNotifOpen(false)} />
              </div>
            </>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 sm:gap-3 rounded-lg px-2 py-1.5 hover:bg-accent transition-colors ml-1">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium leading-tight">{user.name}</p>
                <p className="text-[11px] text-muted-foreground">{user.role}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CommandMenu open={cmdkOpen} onOpenChange={setCmdkOpen} />
    </header>
  );
}
