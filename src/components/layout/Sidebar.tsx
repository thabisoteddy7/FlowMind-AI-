import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Mail,
  FileText,
  ListTodo,
  Sparkles,
  Settings as SettingsIcon,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, color: "var(--pop-purple)" },
  { to: "/email", label: "Email Generator", icon: Mail, color: "var(--pop-pink)" },
  { to: "/meetings", label: "Meeting Summarizer", icon: FileText, color: "var(--pop-cyan)" },
  { to: "/tasks", label: "Task Planner", icon: ListTodo, color: "var(--pop-lime)" },
  { to: "/research", label: "Research Assistant", icon: Sparkles, color: "var(--pop-amber)" },
  { to: "/settings", label: "Settings", icon: SettingsIcon, color: "var(--muted-foreground)" },
] as const;

export function Sidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b border-border bg-sidebar/90 backdrop-blur">
        <Link to="/" className="flex items-center gap-2">
          <Logo />
          <span className="font-display text-lg font-bold">FlowMind</span>
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          className="p-2 rounded-md hover:bg-sidebar-accent"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-30 h-screen w-64 shrink-0 bg-sidebar border-r border-sidebar-border flex-col",
          "transition-transform duration-300",
          open ? "flex translate-x-0" : "hidden lg:flex -translate-x-full lg:translate-x-0"
        )}
      >
        <div className="hidden lg:flex items-center gap-2 px-5 h-16 border-b border-sidebar-border">
          <Logo />
          <div>
            <div className="font-display text-lg font-bold leading-none">FlowMind</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
              AI Workplace
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const active = item.to === "/" ? path === "/" : path.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-sidebar-accent text-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--pop-purple)_40%,transparent)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60"
                )}
              >
                <span
                  className="grid place-items-center h-8 w-8 rounded-md border border-border"
                  style={{
                    background: active
                      ? `linear-gradient(135deg, ${item.color}, color-mix(in oklab, ${item.color} 20%, transparent))`
                      : undefined,
                  }}
                >
                  <Icon className="h-4 w-4" style={{ color: active ? "#0D0D0D" : item.color }} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="rainbow-border p-3 text-xs text-muted-foreground">
            <div className="text-foreground font-semibold mb-1">Pro tip ✨</div>
            Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground">N</kbd> anywhere
            to start a new task.
          </div>
        </div>
      </aside>
    </>
  );
}

function Logo() {
  return (
    <div
      className="h-9 w-9 rounded-xl grid place-items-center font-display font-bold text-base"
      style={{ background: "var(--gradient-rainbow)", color: "#0D0D0D" }}
    >
      F
    </div>
  );
}
