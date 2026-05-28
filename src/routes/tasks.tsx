import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ListTodo, Sparkles } from "lucide-react";
import { generateAI } from "@/lib/ai.functions";
import { addActivity } from "@/lib/activity";
import { LoadingRing, Disclaimer, FieldLabel } from "@/components/ui-bits";
import { PageHeader, EmptyHint } from "./email";
import { toast } from "sonner";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Task Planner — FlowMind" },
      { name: "description", content: "Auto-prioritize your tasks into a smart, time-blocked daily plan." },
    ],
  }),
  component: TasksPage,
});

interface Block { time: string; title: string; priority: "Urgent" | "Normal" | "Low"; reason: string }

function parsePlan(md: string): Block[] {
  const lines = md.split(/\r?\n/);
  const blocks: Block[] = [];
  let cur: Partial<Block> | null = null;
  for (const raw of lines) {
    const l = raw.trim();
    const m = l.match(/^(?:[-*]\s*)?(\d{1,2}:\d{2}\s*(?:am|pm)?\s*[-–]\s*\d{1,2}:\d{2}\s*(?:am|pm)?)\s*[:|—-]\s*(.+?)\s*(?:\[(urgent|normal|low)\])?\s*$/i);
    if (m) {
      if (cur?.title) blocks.push(cur as Block);
      const pr = (m[3] || "normal").toLowerCase();
      cur = { time: m[1], title: m[2], priority: (pr.charAt(0).toUpperCase() + pr.slice(1)) as Block["priority"], reason: "" };
    } else if (cur && /^(why|reason|note)/i.test(l)) {
      cur.reason = l.replace(/^(why|reason|note)\s*[:\-—]\s*/i, "");
    } else if (cur && l && !l.startsWith("#")) {
      cur.reason = (cur.reason ? cur.reason + " " : "") + l.replace(/^[-*]\s*/, "");
    }
  }
  if (cur?.title) blocks.push(cur as Block);
  return blocks;
}

const COLOR: Record<Block["priority"], string> = {
  Urgent: "var(--pop-pink)",
  Normal: "var(--pop-amber)",
  Low: "var(--pop-lime)",
};

function TasksPage() {
  const ai = useServerFn(generateAI);
  const [list, setList] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState(2);
  const [hours, setHours] = useState(8);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!list.trim()) return toast.error("Add at least one task.");
    setLoading(true);
    setBlocks([]);
    try {
      const prMap = ["Low", "Normal", "Urgent"];
      const system = `You are an expert productivity coach. Build a prioritized time-blocked schedule for ONE working day.
Available working hours per day: ${hours}. Start time: 9:00am.
Default priority weight: ${prMap[priority - 1]} (apply when tasks aren't explicitly tagged).
Target deadline (if any): ${deadline || "no specific deadline"}.

Output STRICT markdown ONLY using this format, one block per line followed by a "Why:" line:
- 9:00am - 10:30am: Task title [Urgent]
  Why: short reason (one sentence) for placement and ranking.
- 10:30am - 11:00am: Next task [Normal]
  Why: …

Rules:
- Cover the entire working day from 9:00am.
- Always include a [Urgent|Normal|Low] tag in brackets.
- Always include the "Why:" reasoning line.
- No other commentary, no headers, no preamble.`;
      const { content } = await ai({ data: { system, user: list } });
      const b = parsePlan(content);
      if (b.length === 0) throw new Error("Couldn't parse the plan — try again.");
      setBlocks(b);
      addActivity({ kind: "task", title: "Daily plan", preview: b.map((x) => x.title).slice(0, 3).join(" · ") });
    } catch (e: any) {
      toast.error(e?.message || "Oops, something went wrong — try again!");
    } finally {
      setLoading(false);
    }
  }

  const counts = blocks.reduce((a, b) => ({ ...a, [b.priority]: (a[b.priority] || 0) + 1 }), {} as Record<string, number>);
  const total = blocks.length || 1;

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader icon={<ListTodo className="h-5 w-5" />} accent="var(--pop-lime)" title="AI Task Planner" subtitle="Smart prioritization, time-blocked for you." />

      <div className="grid lg:grid-cols-[1fr_1.3fr] gap-6 mt-8">
        <div className="rainbow-border p-6 animate-slide-up space-y-4">
          <div>
            <FieldLabel>Task list (one per line)</FieldLabel>
            <textarea value={list} onChange={(e) => setList(e.target.value)} rows={8} placeholder={"Send invoice to ACME\nPrep Q3 board deck\nReview pull requests\nGym"} className="textarea" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Deadline</FieldLabel>
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="input" />
            </div>
            <div>
              <FieldLabel>Working hours / day</FieldLabel>
              <input type="number" min={1} max={14} value={hours} onChange={(e) => setHours(+e.target.value)} className="input" />
            </div>
          </div>
          <div>
            <FieldLabel>Priority weight: {["Low", "Normal", "Urgent"][priority - 1]}</FieldLabel>
            <input type="range" min={1} max={3} value={priority} onChange={(e) => setPriority(+e.target.value)} className="w-full accent-[color:var(--pop-purple)]" />
            <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
              <span>Low</span><span>Normal</span><span>Urgent</span>
            </div>
          </div>
          <button onClick={run} disabled={loading} className="btn-rainbow w-full rounded-lg px-4 py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
            <Sparkles className="h-4 w-4" /> {loading ? "Planning…" : "Plan My Day"}
          </button>
        </div>

        <div className="space-y-4 min-h-[420px]">
          {loading && <div className="rounded-2xl border border-border bg-card p-6"><LoadingRing label="Building your day…" /></div>}
          {!loading && blocks.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 min-h-[420px] flex">
              <EmptyHint text="Your prioritized, time-blocked plan will appear here with reasoning for every choice." />
            </div>
          )}
          {blocks.length > 0 && (
            <>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-xs text-muted-foreground mb-2">Priority mix</div>
                <div className="flex h-2.5 rounded-full overflow-hidden">
                  {(["Urgent", "Normal", "Low"] as const).map((p) => (
                    <div key={p} style={{ width: `${((counts[p] || 0) / total) * 100}%`, background: COLOR[p] }} />
                  ))}
                </div>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  {(["Urgent", "Normal", "Low"] as const).map((p) => (
                    <span key={p} className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ background: COLOR[p] }} />{p} · {counts[p] || 0}
                    </span>
                  ))}
                </div>
              </div>
              <ul className="space-y-3">
                {blocks.map((b, i) => (
                  <li key={i} className="rounded-xl border border-border bg-card p-4 flex gap-4 hover:border-[color:var(--ring)] transition-colors" style={{ borderLeft: `3px solid ${COLOR[b.priority]}` }}>
                    <div className="text-xs font-mono text-muted-foreground shrink-0 w-32">{b.time}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold">{b.title}</h4>
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: `color-mix(in oklab, ${COLOR[b.priority]} 22%, transparent)`, color: COLOR[b.priority] }}>{b.priority}</span>
                      </div>
                      {b.reason && <p className="text-xs text-muted-foreground mt-1">{b.reason}</p>}
                    </div>
                  </li>
                ))}
              </ul>
              <Disclaimer />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
