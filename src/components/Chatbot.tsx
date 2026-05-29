import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Send, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { chatAI } from "@/lib/ai.functions";
import { pushActivity } from "@/lib/activity";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Draft a follow-up email to a client",
  "Summarize my week's priorities",
  "Brainstorm ideas for our Q3 launch",
];

export function Chatbot() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hey 👋 I'm **FlowMind**. Ask me anything — drafting, planning, summarizing, or just thinking out loud.",
    },
  ]);
  const [input, setInput] = useState("");
  const chat = useServerFn(chatAI);
  const scrollRef = useRef<HTMLDivElement>(null);

  const mut = useMutation({
    mutationFn: async (next: Msg[]) => chat({ data: { messages: next } }),
    onSuccess: (res, vars) => {
      const reply = res.content || "…";
      setMessages([...vars, { role: "assistant", content: reply }]);
      pushActivity({
        kind: "research",
        title: vars[vars.length - 1].content.slice(0, 60),
        preview: reply.slice(0, 120),
      });
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, mut.isPending]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || mut.isPending) return;
    const next: Msg[] = [...messages, { role: "user", content: t }];
    setMessages(next);
    setInput("");
    mut.mutate(next);
  };

  return (
    <div className="rainbow-border overflow-hidden flex flex-col h-[520px]">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card/60">
        <div className="flex items-center gap-2">
          <span
            className="h-7 w-7 rounded-lg grid place-items-center"
            style={{ background: "var(--gradient-purple-pink)" }}
          >
            <Sparkles className="h-3.5 w-3.5 text-[#0D0D0D]" />
          </span>
          <div>
            <div className="text-sm font-semibold">Ask FlowMind</div>
            <div className="text-[11px] text-muted-foreground">Always-on AI assistant</div>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Live</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role} content={m.content} />
        ))}
        {mut.isPending && (
          <Bubble role="assistant" content="" pending />
        )}
        {messages.length <= 1 && !mut.isPending && (
          <div className="flex flex-wrap gap-2 pt-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:border-[color:var(--pop-purple)] transition-colors text-muted-foreground hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 p-3 border-t border-border bg-card/60"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message FlowMind…"
          className="input flex-1"
          disabled={mut.isPending}
        />
        <button
          type="submit"
          disabled={mut.isPending || !input.trim()}
          className="btn-rainbow inline-flex items-center justify-center h-10 w-10 rounded-lg disabled:opacity-50"
          aria-label="Send"
        >
          {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}

function Bubble({ role, content, pending }: { role: "user" | "assistant"; content: string; pending?: boolean }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-[color:var(--pop-purple)]/20 border border-[color:var(--pop-purple)]/40 text-foreground"
            : "bg-card border border-border text-foreground"
        }`}
      >
        {pending ? (
          <span className="inline-flex gap-1 items-center text-muted-foreground">
            <Dot /> <Dot delay={120} /> <Dot delay={240} />
          </span>
        ) : isUser ? (
          content
        ) : (
          <div className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}
