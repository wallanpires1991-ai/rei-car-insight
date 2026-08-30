import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";

const nav = [
  { to: "/", label: "Início" },
  { to: "/como-funciona", label: "Como Funciona" },
  { to: "/o-que-consultamos", label: "O que Consultamos" },
  { to: "/planos", label: "Planos" },
  { to: "/lojistas", label: "Para Lojistas" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-foreground bg-accent/60" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            to="/entrar"
            className="rounded-md px-3 py-2 text-sm font-medium text-foreground/90 transition-colors hover:text-foreground"
          >
            Entrar
          </Link>
          <Link
            to="/"
            hash="consultar"
            className="rounded-lg bg-neon px-4 py-2 text-sm font-bold tracking-wide text-neon-foreground uppercase shadow-glow transition-transform hover:-translate-y-0.5"
          >
            Consultar veículo
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
          className="rounded-md border border-border p-2 lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/70 bg-background/95 lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/entrar"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            >
              Entrar
            </Link>
            <Link
              to="/"
              hash="consultar"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-lg bg-neon px-4 py-2.5 text-center text-sm font-bold text-neon-foreground uppercase"
            >
              Consultar veículo
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
