import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BadgeCheck, Loader2, ShieldAlert } from "lucide-react";

import { PageShell } from "@/components/site/PageShell";
import { verificarCodigo } from "@/lib/consulta.functions";
import { formatPlate } from "@/lib/plate";

export const Route = createFileRoute("/verificar/$codigo")({
  head: ({ params }) => ({
    meta: [
      { title: `Validação da consulta ${params.codigo} — Pesquisa do Rei 👑` },
      {
        name: "description",
        content: "Confira a autenticidade de um relatório de consulta veicular emitido pela Pesquisa do Rei.",
      },
      { property: "og:title", content: "Validação de consulta — Pesquisa do Rei" },
      { property: "og:description", content: "Confira a autenticidade de um relatório de consulta veicular." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VerificarPage,
});

function VerificarPage() {
  const { codigo } = Route.useParams();
  const verificar = useServerFn(verificarCodigo);
  const { data, isPending } = useQuery({
    queryKey: ["verificar", codigo],
    queryFn: () => verificar({ data: { codigo } }),
  });

  return (
    <PageShell>
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-xs tracking-[0.25em] text-gold uppercase">Validação pública</p>
        <h1 className="mt-2 font-display text-2xl font-extrabold uppercase">Autenticidade do relatório</h1>
        <p className="mt-3 font-mono text-sm tracking-widest text-muted-foreground">{codigo}</p>

        <div className="panel mt-8 p-8">
          {isPending && (
            <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Verificando...
            </p>
          )}

          {data?.valido && (
            <>
              <BadgeCheck className="mx-auto size-10 text-success" />
              <p className="mt-4 font-display text-lg font-bold text-success">Relatório autêntico</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Placa {formatPlate(data.placa)} · emitido em{" "}
                {new Date(data.emitidoEm).toLocaleString("pt-BR")}
              </p>
              <p className="mt-2 text-xs text-muted-foreground/80">
                Fonte: {data.fonte === "real" ? "provedor licenciado" : "demonstração"}
              </p>
            </>
          )}

          {data && !data.valido && (
            <>
              <ShieldAlert className="mx-auto size-10 text-danger" />
              <p className="mt-4 font-display text-lg font-bold text-danger">Código não encontrado</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Nenhum relatório foi emitido com este código.
              </p>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}
