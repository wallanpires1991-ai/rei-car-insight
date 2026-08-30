import type { ReactNode } from "react";
import type { Severity } from "@/lib/report";
import { UNAVAILABLE } from "@/lib/report";

export function toneClasses(sev: Severity) {
  switch (sev) {
    case "ok":
      return "text-success border-success/35 bg-success/10";
    case "warn":
      return "text-warning border-warning/35 bg-warning/10";
    case "critical":
      return "text-danger border-danger/40 bg-danger/10";
    default:
      return "text-muted-foreground border-border bg-muted/30";
  }
}

export function SeverityPill({ severity, children }: { severity: Severity; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${toneClasses(severity)}`}
    >
      {children}
    </span>
  );
}

export function ReportSection({
  index,
  title,
  aside,
  children,
}: {
  index: number;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="panel p-6 md:p-7">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-7 items-center justify-center rounded-md bg-deep text-xs font-bold text-gold ring-1 ring-gold/30">
            {index}
          </span>
          <h2 className="font-display text-base font-bold tracking-tight uppercase md:text-lg">{title}</h2>
        </div>
        {aside}
      </header>
      {children}
    </section>
  );
}

export function DataGrid({ fields }: { fields: { label: string; value: string | null }[] }) {
  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
      {fields.map((f) => (
        <div key={f.label} className="border-b border-border/50 pb-3">
          <dt className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">{f.label}</dt>
          <dd className={`mt-1 text-sm ${f.value ? "font-medium" : "text-muted-foreground/70 italic"}`}>
            {f.value ?? UNAVAILABLE}
          </dd>
        </div>
      ))}
    </dl>
  );
}
