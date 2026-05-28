import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Mail, Copy, RefreshCw, Sparkles } from "lucide-react";
import { generateAI } from "@/lib/ai.functions";
import { addActivity, getSettings } from "@/lib/activity";
import { LoadingRing, Disclaimer, FieldLabel } from "@/components/ui-bits";
import { toast } from "sonner";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Email Generator — FlowMind" },
      { name: "description", content: "Generate professional emails in the perfect tone for any audience." },
    ],
  }),
  component: EmailPage,
});

const RECIPIENTS = ["Client", "Manager", "Team", "Vendor", "External Partner"];
const TONES = ["Formal", "Friendly", "Assertive", "Empathetic", "Concise"];

function lengthHint() {
  switch (getSettings().responseLength) {
    case "Concise": return "Keep it short — 4–6 sentences total.";
    case "Detailed": return "Be thorough — multiple paragraphs, full context.";
    default: return "Balanced length — 2–3 short paragraphs.";
  }
}

function EmailPage() {
  const ai = useServerFn(generateAI);
  const [recipient, setRecipient] = useState(RECIPIENTS[0]);
  const [tone, setTone] = useState(getSettings().defaultTone || TONES[1]);
  const [subject, setSubject] = useState("");
  const [points, setPoints] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!subject.trim() || !points.trim()) {
      toast.error("Add a subject and at least one key point.");
      return;
    }
    setLoading(true);
    setOutput("");
    try {
      const system = `You are an expert professional email writer for workplace communication.
Write a complete, ready-to-send email in plain text.
Audience: ${recipient}. Tone: ${tone}. ${lengthHint()}
Structure:
- Greeting tailored to the audience.
- Body paragraphs covering the key points clearly.
- Clear call-to-action.
- Professional sign-off ("Best," / "Thanks,").
Do NOT include markdown, headers, or commentary. Output only the email itself starting with "Subject:".`;
      const user = `Subject / purpose: ${subject}\n\nKey points to include:\n${points}`;
      const { content } = await ai({ data: { system, user } });
      setOutput(content.trim());
      addActivity({ kind: "email", title: `Email: ${subject}`, preview: content.slice(0, 140) });
    } catch (e: any) {
      toast.error(e?.message || "Oops, something went wrong — try again!");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        icon={<Mail className="h-5 w-5" />}
        accent="var(--pop-pink)"
        title="Smart Email Generator"
        subtitle="Draft polished, on-tone emails in seconds."
      />

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        {/* Input */}
        <div className="rainbow-border p-6 animate-slide-up">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Recipient</FieldLabel>
              <Select value={recipient} onChange={setRecipient} options={RECIPIENTS} />
            </div>
            <div>
              <FieldLabel>Tone</FieldLabel>
              <Select value={tone} onChange={setTone} options={TONES} />
            </div>
          </div>
          <div className="mt-4">
            <FieldLabel>Subject / Purpose</FieldLabel>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Follow up on Q3 proposal"
              className="input"
            />
          </div>
          <div className="mt-4">
            <FieldLabel>Key points to include</FieldLabel>
            <textarea
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              rows={7}
              placeholder={"• Confirm pricing for the new tier\n• Ask about timeline\n• Suggest a call next Tuesday"}
              className="textarea"
            />
          </div>
          <button onClick={run} disabled={loading} className="btn-rainbow mt-5 w-full rounded-lg px-4 py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
            <Sparkles className="h-4 w-4" /> {loading ? "Generating…" : "Generate Email"}
          </button>
        </div>

        {/* Output */}
        <div className="rounded-2xl border border-border bg-card p-6 min-h-[420px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Generated email</h3>
            {output && (
              <div className="flex items-center gap-2">
                <button onClick={copy} className="icon-btn"><Copy className="h-4 w-4" /></button>
                <button onClick={run} disabled={loading} className="icon-btn"><RefreshCw className="h-4 w-4" /></button>
              </div>
            )}
          </div>
          {loading && <LoadingRing label="Drafting your email…" />}
          {!loading && !output && (
            <EmptyHint text="Your AI-drafted email will appear here. Fill in the fields and hit Generate." />
          )}
          {output && (
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/95">{output}</pre>
          )}
          {output && (
            <div className="mt-auto pt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>{output.length.toLocaleString()} characters</span>
            </div>
          )}
          <Disclaimer />
        </div>
      </div>
    </div>
  );
}



export function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="input">
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export function PageHeader({ icon, accent, title, subtitle }: { icon: React.ReactNode; accent: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl grid place-items-center border border-border" style={{ background: `color-mix(in oklab, ${accent} 22%, transparent)`, color: accent }}>
        {icon}
      </div>
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

export function EmptyHint({ text }: { text: string }) {
  return (
    <div className="flex-1 grid place-items-center text-center text-sm text-muted-foreground px-6">
      <div>
        <div className="mx-auto h-12 w-12 rounded-full mb-3" style={{ background: "var(--gradient-rainbow)", opacity: .35 }} />
        {text}
      </div>
    </div>
  );
}
