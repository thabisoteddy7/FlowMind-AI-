import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, FileText, ListTodo, Sparkles, ArrowRight, Clock } from "lucide-react";
import { getActivity, getSettings, counts, type ActivityItem } from "@/lib/activity";
import { Chatbot } from "@/components/Chatbot";
import { Board } from "@/components/Board";

export const Route = createFileRoute("/")({

  head: () => ({
    meta: [
      { title: "Dashboard — FlowMind" },
      { name: "description", content: "Your AI workplace dashboard: emails, meetings, tasks, and research at a glance." },
    ],
  }),
  component: Dashboard,
});

const STATS = [
  { key: "email" as const, label: "Emails Generated", icon: Mail, color: "var(--pop-pink)", to: "/email" },
  { key: "meeting" as const, label: "Meetings Summarized", icon: FileText, color: "var(--pop-cyan)", to: "/meetings" },
  { key: "task" as const, label: "Tasks Planned", icon: ListTodo, color: "var(--pop-lime)", to: "/tasks" },
  { key: "research" as const, label: "Research Done", icon: Sparkles, color: "var(--pop-amber)", to: "/research" },
];

const QUICK = [
  { label: "Draft an email", to: "/email", color: "var(--pop-pink)" },
  { label: "Summarize meeting", to: "/meetings", color: "var(--pop-cyan)" },
  { label: "Plan my day", to: "/tasks", color: "var(--pop-lime)" },
  { label: "Research a topic", to: "/research", color: "var(--pop-amber)" },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const [name, setName] = useState("");
  const [c, setC] = useState({ email: 0, meeting: 0, task: 0, research: 0 });
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const sync = () => {
      setName(getSettings().name);
      setC(counts());
      setActivity(getActivity().slice(0, 5));
    };
    sync();
    window.addEventListener("flowmind:activity", sync);
    window.addEventListener("flowmind:settings", sync);
    return () => {
      window.removeEventListener("flowmind:activity", sync);
      window.removeEventListener("flowmind:settings", sync);
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border p-6 lg:p-10 glass-card animate-slide-up">
        <div
          aria-hidden
          className="absolute -top-40 -right-32 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-70 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, #ff7a18 0%, #ff3d00 35%, rgba(255,61,0,0.25) 65%, transparent 80%)",
          }}
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full blur-3xl opacity-40 pointer-events-none"
          style={{ background: "radial-gradient(circle, #ffb830 0%, transparent 70%)" }}
        />

        <p className="text-sm text-muted-foreground">{greeting()},</p>
        <h1 className="mt-1 text-3xl lg:text-5xl font-display font-bold tracking-tight">
          <span className="rainbow-text">{name?.trim() ? name : "welcome back"}</span>
          <span className="text-foreground">. Let's ship today.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm lg:text-base text-muted-foreground">
          FlowMind drafts your emails, untangles your meetings, plans your day, and
          researches anything — so you can focus on the work that actually matters.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.key}
              to={s.to}
              className="rainbow-border p-5 transition-transform hover:-translate-y-0.5"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between">
                <div
                  className="h-10 w-10 rounded-lg grid place-items-center"
                  style={{ background: `color-mix(in oklab, ${s.color} 22%, transparent)` }}
                >
                  <Icon className="h-5 w-5" style={{ color: s.color }} />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-4 font-display text-3xl font-bold">{c[s.key]}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </Link>
          );
        })}
      </div>

      {/* Quick actions */}
      <section>
        <h2 className="font-display text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {QUICK.map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-border bg-card hover:border-transparent transition-all hover:shadow-[0_0_0_1px_var(--ring)]"
            >
              <span className="h-2 w-2 rounded-full" style={{ background: q.color, boxShadow: `0 0 10px ${q.color}` }} />
              <span className="text-sm font-medium">{q.label}</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
            </Link>
          ))}
        </div>
      </section>

      {/* Chatbot + Board */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-semibold">AI Assistant</h2>
            <span className="text-xs text-muted-foreground">Chat with FlowMind</span>
          </div>
          <Chatbot />
        </div>
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-semibold">Your Board</h2>
            <span className="text-xs text-muted-foreground">Drag cards between columns</span>
          </div>
          <Board />
        </div>
      </section>


      {/* Recent activity */}
      <section>
        <h2 className="font-display text-lg font-semibold mb-3">Recent Activity</h2>
        {activity.length === 0 ? (
          <div className="rainbow-border p-8 text-center">
            <p className="text-muted-foreground text-sm">
              Nothing here yet. Generate your first email, summary, plan, or research note —
              they'll show up here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
            {activity.map((a) => {
              const meta = STATS.find((s) => s.key === a.kind)!;
              const Icon = meta.icon;
              return (
                <li key={a.id} className="flex items-start gap-4 p-4 hover:bg-accent/40 transition-colors">
                  <div
                    className="h-9 w-9 shrink-0 rounded-lg grid place-items-center"
                    style={{ background: `color-mix(in oklab, ${meta.color} 22%, transparent)` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: meta.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{a.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">{a.preview}</div>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                    <Clock className="h-3 w-3" /> {timeAgo(a.createdAt)}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
