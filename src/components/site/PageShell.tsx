import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <section className="grid-lines border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <p className="text-xs tracking-[0.25em] text-gold uppercase">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-3xl font-extrabold md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">{subtitle}</p>
      </div>
    </section>
  );
}
