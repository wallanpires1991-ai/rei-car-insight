import { Link } from "@tanstack/react-router";
import { Crown } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="Pesquisa do Rei — início">
      <span className="relative flex size-9 items-center justify-center rounded-lg bg-deep ring-1 ring-gold/40">
        <Crown className="size-5 text-gold transition-transform group-hover:-translate-y-0.5" />
      </span>
      <span className="leading-none">
        <span className="block font-display text-[15px] font-extrabold tracking-tight uppercase">
          Pesquisa <span className="text-gradient-neon">do Rei</span>
        </span>
        {!compact && (
          <span className="mt-1 block text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            Inteligência veicular
          </span>
        )}
      </span>
    </Link>
  );
}
