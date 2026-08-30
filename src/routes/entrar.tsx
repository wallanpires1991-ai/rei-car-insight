import { createFileRoute } from "@tanstack/react-router";
import { Crown, Lock } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar — Pesquisa do Rei 👑" },
      {
        name: "description",
        content: "Acesse sua conta para ver o histórico de consultas veiculares e baixar seus relatórios.",
      },
      { property: "og:title", content: "Entrar — Pesquisa do Rei" },
      { property: "og:description", content: "Acesse sua área do cliente." },
    ],
  }),
  component: Entrar,
});

function Entrar() {
  return (
    <PageShell>
      <section className="mx-auto flex max-w-md flex-col px-4 py-20">
        <div className="panel p-8">
          <Crown className="size-7 text-gold" />
          <h1 className="mt-4 text-2xl font-bold">Acesse sua conta</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Login, cadastro e recuperação de senha ficam disponíveis assim que o backend seguro for ativado.
          </p>

          <div className="mt-6 space-y-3 opacity-60">
            <input
              disabled
              placeholder="seu@email.com"
              className="w-full rounded-lg border border-border bg-input/40 px-4 py-3 text-sm outline-none"
            />
            <input
              disabled
              type="password"
              placeholder="Sua senha"
              className="w-full rounded-lg border border-border bg-input/40 px-4 py-3 text-sm outline-none"
            />
            <button
              disabled
              className="w-full rounded-lg bg-neon px-4 py-3 text-sm font-bold text-neon-foreground uppercase"
            >
              Entrar
            </button>
          </div>

          <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="size-3.5 text-primary" /> Autenticação, criptografia e auditoria conforme a LGPD.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
