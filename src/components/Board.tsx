import { useEffect, useState } from "react";
import { Plus, X, GripVertical } from "lucide-react";

type Status = "todo" | "doing" | "done";
interface Card {
  id: string;
  title: string;
  status: Status;
  color: string;
}

const KEY = "flowmind:board";

const SEED: Card[] = [
  { id: "1", title: "Draft launch announcement", status: "todo", color: "var(--pop-pink)" },
  { id: "2", title: "Review Q3 OKRs with team", status: "todo", color: "var(--pop-amber)" },
  { id: "3", title: "Customer interview — Acme Co.", status: "doing", color: "var(--pop-cyan)" },
  { id: "4", title: "Ship onboarding email v2", status: "doing", color: "var(--pop-purple)" },
  { id: "5", title: "Weekly metrics review", status: "done", color: "var(--pop-lime)" },
];

const COLUMNS: { key: Status; label: string; tint: string }[] = [
  { key: "todo", label: "To do", tint: "var(--pop-pink)" },
  { key: "doing", label: "In progress", tint: "var(--pop-cyan)" },
  { key: "done", label: "Done", tint: "var(--pop-lime)" },
];

const PALETTE = [
  "var(--pop-purple)",
  "var(--pop-pink)",
  "var(--pop-cyan)",
  "var(--pop-lime)",
  "var(--pop-amber)",
];

export function Board() {
  const [cards, setCards] = useState<Card[]>([]);
  const [adding, setAdding] = useState<Status | null>(null);
  const [draft, setDraft] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setCards(raw ? JSON.parse(raw) : SEED);
    } catch {
      setCards(SEED);
    }
  }, []);

  useEffect(() => {
    if (cards.length) localStorage.setItem(KEY, JSON.stringify(cards));
  }, [cards]);

  const add = (status: Status) => {
    if (!draft.trim()) {
      setAdding(null);
      return;
    }
    const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    setCards((c) => [...c, { id: crypto.randomUUID(), title: draft.trim(), status, color }]);
    setDraft("");
    setAdding(null);
  };

  const remove = (id: string) => setCards((c) => c.filter((x) => x.id !== id));
  const move = (id: string, status: Status) =>
    setCards((c) => c.map((x) => (x.id === id ? { ...x, status } : x)));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {COLUMNS.map((col) => {
        const items = cards.filter((c) => c.status === col.key);
        return (
          <div
            key={col.key}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragId) move(dragId, col.key);
              setDragId(null);
            }}
            className="rounded-2xl border border-border bg-card/60 backdrop-blur p-3 min-h-[260px] flex flex-col"
          >
            <div className="flex items-center justify-between px-1 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: col.tint, boxShadow: `0 0 10px ${col.tint}` }}
                />
                <span className="text-sm font-semibold">{col.label}</span>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <button
                onClick={() => setAdding(col.key)}
                className="icon-btn"
                aria-label={`Add to ${col.label}`}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-2 flex-1">
              {items.map((c) => (
                <div
                  key={c.id}
                  draggable
                  onDragStart={() => setDragId(c.id)}
                  className="group relative rounded-xl border border-border bg-background/70 p-3 pl-4 cursor-grab active:cursor-grabbing hover:border-[color:var(--pop-purple)]/60 transition-colors"
                >
                  <span
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-r"
                    style={{ background: c.color }}
                  />
                  <div className="flex items-start gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground/60 mt-0.5 shrink-0" />
                    <p className="text-sm flex-1 leading-snug">{c.title}</p>
                    <button
                      onClick={() => remove(c.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
                      aria-label="Delete"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {adding === col.key && (
                <div className="rounded-xl border border-[color:var(--pop-purple)]/50 bg-background/70 p-2">
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") add(col.key);
                      if (e.key === "Escape") {
                        setAdding(null);
                        setDraft("");
                      }
                    }}
                    onBlur={() => add(col.key)}
                    placeholder="Task title…"
                    className="input text-sm"
                  />
                </div>
              )}

              {items.length === 0 && adding !== col.key && (
                <button
                  onClick={() => setAdding(col.key)}
                  className="w-full rounded-xl border border-dashed border-border text-xs text-muted-foreground py-6 hover:text-foreground hover:border-[color:var(--pop-purple)]/60 transition-colors"
                >
                  + Add a card
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
