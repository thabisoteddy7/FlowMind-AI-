import { Link, useRouter } from "@tanstack/react-router";
import { Plus, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { getSettings } from "@/lib/activity";

export function Topbar() {
  const router = useRouter();
  const [name, setName] = useState("");

  useEffect(() => {
    const sync = () => setName(getSettings().name);
    sync();
    window.addEventListener("flowmind:settings", sync);
    return () => window.removeEventListener("flowmind:settings", sync);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "n" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        router.navigate({ to: "/email" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  const initial = (name || "U").trim().charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 h-16 px-4 lg:px-8 border-b border-border bg-background/70 backdrop-blur">
      <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 text-[color:var(--pop-amber)]" />
        Your AI workplace assistant
      </div>
      <div className="flex items-center gap-3 ml-auto">
        <Link
          to="/email"
          className="btn-rainbow inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
        >
          <Plus className="h-4 w-4" /> New Task
        </Link>
        <div
          className="h-9 w-9 rounded-full grid place-items-center font-semibold text-sm border border-border"
          style={{ background: "var(--gradient-purple-pink)", color: "#0D0D0D" }}
          title={name || "You"}
        >
          {initial}
        </div>
      </div>
    </header>
  );
}
