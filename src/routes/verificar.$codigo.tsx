import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Crown } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/verificar/$codigo")({
  head: ({ params }) => ({
    meta: [
      { title: `Validação da consulta ${params.codigo} — Pesquisa do Rei 👑` },
      {
        name: "description",
        content: "Página pública de validação de relatórios de consulta veicular emitidos pelo Pesquisa do Rei.",
      },
      { property: "og:title", content: "Validação de consulta — Pesquisa do Rei" },
      { property: "og:description", content: "Confira a autenticidade de um relatório emitido." },
    ],
  }),
  component: Verificar,
});

function Verificar() {
  const { codigo } = Route.useParams();

  return (
    <PageShell>
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <Crown className="mx-auto size-8 text-gold" />
        <h1 className="mt-4 text-2xl font-bold">Validação de consulta</h1>
        <div className="panel mt-6 p-8">
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Número da consulta</p>
          <p className="mt-2 font-mono text-lg break-all">{codigo}</p>
          <p className="mt-6 flex items-center justify-center gap-2 text-sm text-success">
            <BadgeCheck className="size-4" /> Formato de código válido
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            A verificação contra o registro emitido é concluída assim que o backend seguro estiver ativo.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
