import { createFileRoute } from "@tanstack/react-router";
import { PageHero, PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/o-que-consultamos")({
  head: () => ({
    meta: [
      { title: "O que consultamos — Pesquisa do Rei 👑" },
      {
        name: "description",
        content:
          "Identificação, restrições, histórico, leilão, sinistro, roubo e furto, débitos, recall e dados de mercado.",
      },
      { property: "og:title", content: "O que consultamos — Pesquisa do Rei" },
      {
        property: "og:description",
        content: "Todas as seções do relatório de consulta veicular, fonte por fonte.",
      },
    ],
  }),
  component: OQueConsultamos,
});

const GROUPS: { title: string; items: string[] }[] = [
  {
    title: "Identificação do veículo",
    items: [
      "Placa, marca, modelo e versão",
      "Ano de fabricação e ano modelo",
      "Cor, combustível, categoria e tipo",
      "Município, estado e país",
      "Chassi parcialmente mascarado",
      "Motorização, cilindrada, potência, câmbio e portas",
    ],
  },
  {
    title: "Situação e restrições",
    items: [
      "Situação cadastral",
      "Restrições administrativas, judiciais e financeiras",
      "Bloqueios",
      "Comunicação de venda",
      "Alienação fiduciária",
      "Pendências conhecidas",
    ],
  },
  {
    title: "Histórico e ocorrências",
    items: [
      "Histórico de proprietários (formato permitido)",
      "Histórico de municípios",
      "Indícios de passagem por leilão",
      "Sinistro: pequena, média e grande monta",
      "Roubo e furto",
      "Eventos registrados nas bases integradas",
    ],
  },
  {
    title: "Débitos, recall e mercado",
    items: [
      "Multas, IPVA e licenciamento",
      "Campanhas de recall do fabricante",
      "Valor FIPE por fonte autorizada",
      "Média e faixa estimada de mercado",
      "Comparativo de preço",
      "Índice do Rei e Veredito do Rei",
    ],
  },
];

function OQueConsultamos() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Cobertura"
        title="O que a consulta cobre"
        subtitle="A disponibilidade de cada item depende das bases integradas no momento da consulta. Quando algo não estiver disponível, o relatório informa explicitamente."
      />

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-16 md:grid-cols-2">
        {GROUPS.map((g) => (
          <div key={g.title} className="panel p-6">
            <h2 className="text-lg font-semibold">{g.title}</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {g.items.map((i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary">›</span>
                  {i}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <p className="mx-auto max-w-6xl px-4 pb-8 text-xs text-muted-foreground">
        A ausência de registro em uma fonte não representa garantia absoluta de inexistência em todas as
        bases. A consulta não substitui vistoria cautelar presencial.
      </p>
    </PageShell>
  );
}
