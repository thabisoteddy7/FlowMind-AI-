import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingRing({ label = "Thinking…", className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 text-sm text-muted-foreground", className)}>
      <span className="relative grid place-items-center h-8 w-8">
        <span
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            background: "conic-gradient(from 0deg, var(--pop-purple), var(--pop-pink), var(--pop-amber), var(--pop-lime), var(--pop-cyan), var(--pop-purple))",
            WebkitMask: "radial-gradient(circle, transparent 55%, #000 57%)",
                    mask: "radial-gradient(circle, transparent 55%, #000 57%)",
          }}
        />
        <Loader2 className="h-3.5 w-3.5 opacity-0" />
      </span>
      {label}
    </div>
  );
}

export function Disclaimer() {
  return (
    <p className="mt-4 text-[11px] text-muted-foreground/80">
      AI-generated content may require human review before use.
    </p>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">{children}</label>;
}

export function Section({
  title,
  description,
  accent = "var(--pop-purple)",
  children,
}: {
  title: string;
  description?: string;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <div className="flex items-baseline gap-3 mb-3">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: accent, boxShadow: `0 0 14px ${accent}` }} />
        <h3 className="font-display text-base font-semibold">{title}</h3>
        {description && <span className="text-xs text-muted-foreground">{description}</span>}
      </div>
      {children}
    </section>
  );
}
