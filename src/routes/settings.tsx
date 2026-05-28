import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Save, Sun, Moon } from "lucide-react";
import { getSettings, saveSettings, type Settings } from "@/lib/activity";
import { FieldLabel } from "@/components/ui-bits";
import { PageHeader, Select } from "./email";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — FlowMind" },
      { name: "description", content: "Personalize your FlowMind experience." },
    ],
  }),
  component: SettingsPage,
});

const TONES = ["Formal", "Friendly", "Assertive", "Empathetic", "Concise"];
const LENGTHS = ["Concise", "Balanced", "Detailed"] as const;

function applyTheme(t: "dark" | "light") {
  const root = document.documentElement;
  if (t === "light") { root.classList.add("light"); root.classList.remove("dark"); }
  else { root.classList.add("dark"); root.classList.remove("light"); }
}

function SettingsPage() {
  const [s, setS] = useState<Settings>({ name: "", defaultTone: "Friendly", responseLength: "Balanced", theme: "dark" });

  useEffect(() => {
    const cur = getSettings();
    setS(cur);
    applyTheme(cur.theme);
  }, []);

  function update<K extends keyof Settings>(k: K, v: Settings[K]) {
    const next = { ...s, [k]: v };
    setS(next);
    if (k === "theme") applyTheme(v as "dark" | "light");
  }

  function save() {
    saveSettings(s);
    toast.success("Settings saved");
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader icon={<SettingsIcon className="h-5 w-5" />} accent="var(--pop-purple)" title="Settings" subtitle="Tune FlowMind to your style." />

      <div className="mt-8 space-y-4">
        <div className="rainbow-border p-6 space-y-5">
          <div>
            <FieldLabel>Your name (used in greetings)</FieldLabel>
            <input value={s.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Maya" className="input max-w-sm" />
          </div>
          <div>
            <FieldLabel>Default email tone</FieldLabel>
            <div className="max-w-sm"><Select value={s.defaultTone} onChange={(v) => update("defaultTone", v)} options={TONES} /></div>
          </div>
          <div>
            <FieldLabel>AI response length</FieldLabel>
            <div className="flex rounded-lg border border-border overflow-hidden max-w-md">
              {LENGTHS.map((l) => (
                <button
                  key={l}
                  onClick={() => update("responseLength", l)}
                  className={`flex-1 text-sm font-medium py-2 ${s.responseLength === l ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/40"}`}
                >{l}</button>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Theme</FieldLabel>
            <div className="flex rounded-lg border border-border overflow-hidden max-w-xs">
              <button onClick={() => update("theme", "dark")} className={`flex-1 flex items-center justify-center gap-2 text-sm py-2 ${s.theme === "dark" ? "bg-accent text-foreground" : "text-muted-foreground"}`}>
                <Moon className="h-4 w-4" /> Dark
              </button>
              <button onClick={() => update("theme", "light")} className={`flex-1 flex items-center justify-center gap-2 text-sm py-2 ${s.theme === "light" ? "bg-accent text-foreground" : "text-muted-foreground"}`}>
                <Sun className="h-4 w-4" /> Light
              </button>
            </div>
          </div>

          <button onClick={save} className="btn-rainbow rounded-lg px-5 py-2.5 text-sm inline-flex items-center gap-2">
            <Save className="h-4 w-4" /> Save preferences
          </button>
        </div>
      </div>
    </div>
  );
}
