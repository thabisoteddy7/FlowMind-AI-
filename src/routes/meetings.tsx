import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { FileText, Sparkles, Copy } from "lucide-react";
import { generateAI } from "@/lib/ai.functions";
import { addActivity } from "@/lib/activity";
import { LoadingRing, Disclaimer, FieldLabel } from "@/components/ui-bits";
import { PageHeader, Select, EmptyHint } from "./email";
import { toast } from "sonner";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Summarizer — FlowMind" },
      { name: "description", content: "Turn raw meeting notes into clear summaries, action items, and follow-ups." },
    ],
  }),
  component: MeetingsPage,
});

const TYPES = ["Standup", "Strategy", "Client Call", "Retrospective", "1-on-1"];

interface Parsed {
  summary: string;
  points: string[];
  actions: { text: string; owner?: string }[];
  deadlines: string[];
  followups: string[];
}

function parse(md: string): Parsed {
  const sections: Record<string, string[]> = {};
  let current = "";
  md.split(/\r?\n/).forEach((line) => {
    const h = line.match(/^#+\s*(.+?)\s*$/);
    if (h) { current = h[1].toLowerCase(); sections[current] = []; return; }
    if (current) sections[current].push(line);
  });
  const grab = (...keys: string[]) => {
    for (const k of keys) {
      const key = Object.keys(sections).find((s) => s.includes(k));
      if (key) return sections[key].join("\n").trim();
    }
    return "";
  };
  const bullets = (txt: string) =>
    txt.split(/\r?\n/).map((l) => l.replace(/^[-*•\d.\s]+/, "").trim()).filter(Boolean);

  const actionsRaw = bullets(grab("action"));
  const actions = actionsRaw.map((t) => {
    const m = t.match(/\(([^)]+)\)\s*$/) || t.match(/@(\w+)/);
    return { text: t.replace(/\s*\([^)]+\)\s*$/, ""), owner: m?.[1] };
  });
  return {
    summary: grab("executive summary", "summary"),
    points: bullets(grab("key", "discussion")),
    actions,
    deadlines: bullets(grab("deadline")),
    followups: bullets(grab("follow", "questions")),
  };
}

function MeetingsPage() {
  const ai = useServerFn(generateAI);
  const [type, setType] = useState(TYPES[0]);
  const [full, setFull] = useState(true);
  const [notes, setNotes] = useState("");
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!notes.trim()) return toast.error("Paste your meeting notes first.");
    setLoading(true);
    setParsed(null);
    try {
      const system = `You are an expert meeting analyst. Read raw meeting notes/transcript and output STRICT markdown with these exact headings (no extra text outside them):
# Executive Summary
One paragraph (3–5 sentences).
# Key Discussion Points
Bulleted list, concise.
# Action Items
Bulleted list. Format: "- Task description (Owner)" — include owner in parentheses when mentioned.
# Deadlines
Bulleted list with date and what's due. If none, write "- None mentioned".
# Follow-up Questions
Bulleted list of open questions.
Meeting type: ${type}. ${full ? "Provide the full breakdown." : "Keep each section short."}`;
      const { content } = await ai({ data: { system, user: notes } });
      const p = parse(content);
      setParsed(p);
      addActivity({ kind: "meeting", title: `${type} summary`, preview: p.summary.slice(0, 140) });
    } catch (e: any) {
      toast.error(e?.message || "Oops, something went wrong — try again!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader icon={<FileText className="h-5 w-5" />} accent="var(--pop-cyan)" title="Meeting Summarizer" subtitle="Notes in, clarity out." />

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6 mt-8">
        <div className="rainbow-border p-6 animate-slide-up">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Meeting type</FieldLabel>
              <Select value={type} onChange={setType} options={TYPES} />
            </div>
            <div>
              <FieldLabel>Output</FieldLabel>
              <div className="flex rounded-lg border border-border overflow-hidden h-[40px]">
                <button onClick={() => setFull(false)} className={`flex-1 text-xs font-medium ${!full ? "bg-accent text-foreground" : "text-muted-foreground"}`}>Summary</button>
                <button onClick={() => setFull(true)} className={`flex-1 text-xs font-medium ${full ? "bg-accent text-foreground" : "text-muted-foreground"}`}>Full breakdown</button>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <FieldLabel>Raw notes / transcript</FieldLabel>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={14} placeholder="Paste meeting notes or transcript here…" className="textarea" />
          </div>
          <button onClick={run} disabled={loading} className="btn-rainbow mt-5 w-full rounded-lg px-4 py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
            <Sparkles className="h-4 w-4" /> {loading ? "Summarizing…" : "Summarize"}
          </button>
        </div>

        <div className="space-y-4 min-h-[420px]">
          {loading && (
            <div className="rounded-2xl border border-border bg-card p-6"><LoadingRing label="Reading your meeting…" /></div>
          )}
          {!loading && !parsed && (
            <div className="rounded-2xl border border-border bg-card p-6 min-h-[420px] flex">
              <EmptyHint text="Your structured summary, action items, and follow-ups will land here." />
            </div>
          )}
          {parsed && (
            <>
              <Block accent="var(--pop-cyan)" title="Executive Summary">
                <p className="text-sm leading-relaxed">{parsed.summary}</p>
              </Block>
              <Block accent="var(--pop-purple)" title="Key Discussion Points">
                <BList items={parsed.points} />
              </Block>
              <Block accent="var(--pop-pink)" title="Action Items">
                {parsed.actions.length === 0 ? <Empty /> : (
                  <ul className="space-y-2">
                    {parsed.actions.map((a, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "var(--pop-pink)" }} />
                        <span className="flex-1">{a.text}</span>
                        {a.owner && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full border border-border bg-accent/40 text-muted-foreground">@{a.owner}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Block>
              <div className="grid md:grid-cols-2 gap-4">
                <Block accent="var(--pop-amber)" title="Deadlines"><BList items={parsed.deadlines} /></Block>
                <Block accent="var(--pop-lime)" title="Follow-up Questions"><BList items={parsed.followups} /></Block>
              </div>
              <Disclaimer />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Block({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-3 flex items-center gap-2 border-b border-border" style={{ background: `color-mix(in oklab, ${accent} 10%, transparent)` }}>
        <span className="h-2 w-2 rounded-full" style={{ background: accent, boxShadow: `0 0 12px ${accent}` }} />
        <h3 className="font-display text-sm font-semibold">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
function BList({ items }: { items: string[] }) {
  if (!items?.length) return <Empty />;
  return (
    <ul className="space-y-1.5">
      {items.map((t, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <span className="mt-2 h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}
function Empty() { return <p className="text-xs text-muted-foreground italic">— None mentioned</p>; }
