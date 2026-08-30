import { createFileRoute } from "@tanstack/react-router";
import { PageHero, PageShell } from "@/components/site/PageShell";
import { PlateSearch } from "@/components/site/PlateSearch";

export const Route = createFileRoute("/como-funciona")({
  head: () => ({
    meta: [
      { title: "Como funciona a consulta — Pesquisa do Rei 👑" },
      {
        name: "description",
        content:
          "Da placa ao relatório: normalização, consulta aos provedores, cruzamento de dados, Índice do Rei e PDF com validação.",
      },
      { property: "og:title", content: "Como funciona — Pesquisa do Rei" },
      {
        property: "og:description",
        content: "Entenda o fluxo completo da consulta veicular pela placa.",
      },
    ],
  }),
  component: ComoFunciona,
});

const STEPS = [
  ["Você digita a placa", "Aceitamos placa Mercosul e o padrão antigo. A placa é normalizada automaticamente."],
  ["Consulta ao provedor principal", "O backend aciona o provedor licenciado principal com credenciais protegidas."],
  ["Provedores complementares", "Fontes adicionais são acionadas para completar leilão, sinistro, débitos e recall."],
  ["Cruzamento e deduplicação", "Resultados são cruzados, duplicidades removidas e inconsistências sinalizadas."],
  ["Relatório único", "Todas as seções são consolidadas em um único relatório organizado."],
  ["Índice do Rei", "O score de 0 a 100 é calculado apenas com base nos dados efetivamente retornados."],
  ["PDF liberado", "Você baixa o relatório em PDF com número único e QR Code de validação pública."],
];

function ComoFunciona() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Como funciona"
        title="Da placa ao Veredito do Rei em poucos passos"
        subtitle="Arquitetura modular com fallback entre provedores: se uma fonte estiver indisponível, outra assume."
      />

      <section className="mx-auto max-w-4xl px-4 py-16">
        <ol className="relative space-y-6 border-l border-border/70 pl-8">
          {STEPS.map(([title, text], i) => (
            <li key={title} className="relative">
              <span className="absolute -left-[41px] flex size-6 items-center justify-center rounded-full bg-neon text-[11px] font-bold text-neon-foreground">
                {i + 1}
              </span>
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-14">
          <PlateSearch size="sm" />
        </div>
      </section>
    </PageShell>
  );
}
