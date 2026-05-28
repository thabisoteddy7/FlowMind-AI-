import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { generateAI } from "@/lib/ai.functions";
import { addActivity } from "@/lib/activity";
import { LoadingRing, Disclaimer, FieldLabel } from "@/components/ui-bits";
import { PageHeader, Select, EmptyHint } from "./email";
import { toast } from "sonner";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research Assistant — FlowMind" },
      { name: "description", content: "Get structured insights on any topic with an AI research assistant." },
    ],
  }),
  component: ResearchPage,
});

const STYLES = ["Bullet Points", "Narrative", "Executive Summary"];
const ACCENTS = ["var(--pop-purple)", "var(--pop-pink)", "var(--pop-amber)", "var(--pop-lime)", "var(--pop-cyan)", "var(--pop-purple)", "var(--pop-pink)"];

interface Result {
  headline: string;
  insights: { title: string; body: string }[];
  nextSteps: string[];
  questions: string[];
}

function parse(md: string): Result {
  const sections: Record<string, string[]> = {};
  let cur = "";
  md.split(/\r?\n/).forEach((l) => {
    const h = l.match(/^#+\s*(.+?)\s*$/);
    if (h) { cur = h[1].toLowerCase(); sections[cur] = []; return; }
    if (cur) sections[cur].push(l);
  });
  const grab = (...keys: string[]) => {
    for (const k of keys) {
      const key = Object.keys(sections).find((s) => s.includes(k));
      if (key) return sections[key].join("\n").trim();
    }
    return "";
  };
  const bullets = (txt: string) => txt.split(/\r?\n/).map((l) => l.replace(/^[-*•\d.\s]+/, "").trim()).filter(Boolean);

  const insightsRaw = bullets(grab("insight", "key"));
  const insights = insightsRaw.map((line) => {
    const m = line.match(/^\*?\*?(.+?)\*?\*?\s*[:—-]\s*(.+)$/);
    return m ? { title: m[1].trim(), body: m[2].trim() } : { title: line, body: "" };
  });

  return {
    headline: grab("headline", "summary"),
    insights,
    nextSteps: bullets(grab("next step", "suggested")),
    questions: bullets(grab("question", "explore")),
  };
}

function ResearchPage() {
  const ai = useServerFn(generateAI);
  const [topic, setTopic] = useState("");
  const [deep, setDeep] = useState(false);
  const [style, setStyle] = useState(STYLES[0]);
  const [res, setRes] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!topic.trim()) return toast.error("Enter a topic or question to research.");
    setLoading(true);
    setRes(null);
    try {
      const system = `You are an expert research analyst writing for busy professionals.
Depth: ${deep ? "Deep dive — comprehensive, nuanced, 7 insights." : "Quick overview — concise, 5 insights."}
Preferred style: ${style}.
Output STRICT markdown ONLY with these headings:
# Headline Summary
One vivid paragraph (2–4 sentences) capturing the core answer.
# Key Insights
${deep ? "Exactly 7" : "Exactly 5"} bullets. Each line MUST follow the format:
- **Insight title** — one or two sentence explanation with a concrete fact or example.
# Suggested Next Steps
Bulleted, action-oriented.
# Questions to Explore Further
Bulleted, sharp open questions.
No commentary outside these sections.`;
      const { content } = await ai({ data: { system, user: topic } });
      const r = parse(content);
      setRes(r);
      addActivity({ kind: "research", title: `Research: ${topic.slice(0, 60)}`, preview: r.headline.slice(0, 140) });
    } catch (e: any) {
      toast.error(e?.message || "Oops, something went wrong — try again!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader icon={<Sparkles className="h-5 w-5" />} accent="var(--pop-amber)" title="AI Research Assistant" subtitle="Ask anything. Get structured, source-of-truth insights." />

      <div className="grid lg:grid-cols-[1fr_1.3fr] gap-6 mt-8">
        <div className="rainbow-border p-6 animate-slide-up space-y-4">
          <div>
            <FieldLabel>Topic or question</FieldLabel>
            <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={6} placeholder="e.g. How are AI agents changing customer support in 2025?" className="textarea" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Depth</FieldLabel>
              <div className="flex rounded-lg border border-border overflow-hidden h-[40px]">
                <button onClick={() => setDeep(false)} className={`flex-1 text-xs font-medium ${!deep ? "bg-accent text-foreground" : "text-muted-foreground"}`}>Quick</button>
                <button onClick={() => setDeep(true)} className={`flex-1 text-xs font-medium ${deep ? "bg-accent text-foreground" : "text-muted-foreground"}`}>Deep Dive</button>
              </div>
            </div>
            <div>
              <FieldLabel>Output style</FieldLabel>
              <Select value={style} onChange={setStyle} options={STYLES} />
            </div>
          </div>
          <button onClick={run} disabled={loading} className="btn-rainbow w-full rounded-lg px-4 py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
            <Sparkles className="h-4 w-4" /> {loading ? "Researching…" : "Research It"}
          </button>
        </div>

        <div className="space-y-4 min-h-[420px]">
          {loading && <div className="rounded-2xl border border-border bg-card p-6"><LoadingRing label="Synthesizing insights…" /></div>}
          {!loading && !res && (
            <div className="rounded-2xl border border-border bg-card p-6 min-h-[420px] flex">
              <EmptyHint text="Your research card with key insights, next steps, and open questions will appear here." />
            </div>
          )}
          {res && (
            <>
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Headline summary</div>
                <p className="text-lg leading-snug font-display">{res.headline}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {res.insights.map((ins, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-4 hover:border-[color:var(--ring)] transition-colors" style={{ borderLeft: `3px solid ${ACCENTS[i % ACCENTS.length]}` }}>
                    <h4 className="font-semibold text-sm">{ins.title}</h4>
                    {ins.body && <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{ins.body}</p>}
                  </div>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <Block accent="var(--pop-lime)" title="Suggested Next Steps">
                  <BL items={res.nextSteps} />
                </Block>
                <Block accent="var(--pop-cyan)" title="Questions to Explore">
                  <BL items={res.questions} />
                </Block>
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
function BL({ items }: { items: string[] }) {
  if (!items?.length) return <p className="text-xs text-muted-foreground italic">— None</p>;
  return (
    <ul className="space-y-1.5">
      {items.map((t, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <span className="mt-2 h-1 w-1 rounded-full bg-muted-foreground shrink-0" /><span>{t}</span>
        </li>
      ))}
    </ul>
  );
}
