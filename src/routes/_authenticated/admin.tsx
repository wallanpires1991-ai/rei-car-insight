import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Loader2 } from "lucide-react";

import { PageShell } from "@/components/site/PageShell";
import { painelAdmin } from "@/lib/consulta.functions";
import { formatPlate } from "@/lib/plate";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Painel administrativo — Pesquisa do Rei 👑" },
      { name: "description", content: "Controle de consultas, provedores e custos da plataforma." },
      { property: "og:title", content: "Painel administrativo — Pesquisa do Rei" },
      { property: "og:description", content: "Controle de consultas, provedores e custos." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const brl = (centavos: number) =>
  (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function AdminPage() {
  const fetchPainel = useServerFn(painelAdmin);
  const { data, isPending, error } = useQuery({
    queryKey: ["painel-admin"],
    queryFn: () => fetchPainel(),
    retry: false,
  });

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-4 py-12">
        <p className="text-xs tracking-[0.25em] text-gold uppercase">Administração</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold uppercase">Painel do Rei</h1>

        {isPending && (
          <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Carregando...
          </p>
        )}

        {error && (
          <div className="panel mt-8 flex items-center gap-3 border-danger/40 p-6 text-sm text-danger">
            <AlertTriangle className="size-5" /> Acesso restrito ao administrador.
          </div>
        )}

        {data && (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Consultas", value: String(data.totais.consultas) },
                { label: "Com dados reais", value: String(data.totais.reais) },
                { label: "Receita bruta", value: brl(data.totais.receita) },
                { label: "Custo de API", value: brl(data.totais.custo) },
              ].map((k) => (
                <div key={k.label} className="panel p-5">
                  <p className="text-xs tracking-wider text-muted-foreground uppercase">{k.label}</p>
                  <p className="mt-2 font-display text-2xl font-extrabold">{k.value}</p>
                </div>
              ))}
            </div>

            <h2 className="mt-12 font-display text-lg font-bold uppercase">Provedores de dados</h2>
            <div className="mt-4 space-y-3">
              {data.provedores.map((p) => (
                <div
                  key={p.id}
                  className="panel flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold">{p.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      Prioridade {p.prioridade} · custo {brl(p.custo_centavos)} · chave {p.env_var}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      p.configurado
                        ? "bg-success/10 text-success"
                        : "bg-warning/10 text-warning"
                    }`}
                  >
                    {p.configurado ? "Configurado" : "Chave pendente"}
                  </span>
                </div>
              ))}
            </div>

            <h2 className="mt-12 font-display text-lg font-bold uppercase">Últimas consultas</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs tracking-wider text-muted-foreground uppercase">
                  <tr>
                    <th className="py-2">Placa</th>
                    <th className="py-2">Código</th>
                    <th className="py-2">Fonte</th>
                    <th className="py-2">Custo</th>
                    <th className="py-2">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {data.consultas.map((c) => (
                    <tr key={c.id} className="border-t border-border/60">
                      <td className="py-2 font-mono">{formatPlate(c.placa)}</td>
                      <td className="py-2 text-muted-foreground">{c.codigo}</td>
                      <td className="py-2">{c.fonte === "real" ? c.provedor : "demo"}</td>
                      <td className="py-2">{brl(c.custo_centavos)}</td>
                      <td className="py-2 text-muted-foreground">
                        {new Date(c.created_at).toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}
