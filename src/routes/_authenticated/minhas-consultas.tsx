import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FileSearch, Loader2 } from "lucide-react";

import { PageShell } from "@/components/site/PageShell";
import { minhasConsultas } from "@/lib/consulta.functions";
import { formatPlate } from "@/lib/plate";

export const Route = createFileRoute("/_authenticated/minhas-consultas")({
  head: () => ({
    meta: [
      { title: "Minhas consultas — Pesquisa do Rei 👑" },
      { name: "description", content: "Histórico completo das suas consultas veiculares." },
      { property: "og:title", content: "Minhas consultas — Pesquisa do Rei" },
      { property: "og:description", content: "Histórico completo das suas consultas veiculares." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MinhasConsultas,
});

function MinhasConsultas() {
  const fetchConsultas = useServerFn(minhasConsultas);
  const { data, isPending } = useQuery({
    queryKey: ["minhas-consultas"],
    queryFn: () => fetchConsultas(),
  });

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <p className="text-xs tracking-[0.25em] text-gold uppercase">Área do cliente</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold uppercase">Minhas consultas</h1>

        {isPending && (
          <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Carregando histórico...
          </p>
        )}

        {!isPending && (data?.length ?? 0) === 0 && (
          <div className="panel mt-8 p-8 text-center">
            <FileSearch className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Você ainda não realizou consultas.</p>
            <Link
              to="/"
              className="mt-5 inline-block rounded-lg bg-neon px-5 py-3 text-sm font-bold text-neon-foreground uppercase"
            >
              Consultar um veículo
            </Link>
          </div>
        )}

        <div className="mt-8 space-y-3">
          {data?.map((c) => (
            <div
              key={c.id}
              className="panel flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-mono text-lg tracking-[0.2em]">{formatPlate(c.placa)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(c.created_at).toLocaleString("pt-BR")} · Nº {c.codigo} ·{" "}
                  {c.fonte === "real" ? "dados reais" : "demonstração"}
                </p>
              </div>
              <Link
                to="/verificar/$codigo"
                params={{ codigo: c.codigo }}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Validar consulta
              </Link>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
