import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, CreditCard, QrCode } from "lucide-react";
import { PageHero, PageShell } from "@/components/site/PageShell";
import { PlateSearch } from "@/components/site/PlateSearch";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos — Pesquisa Completa por R$49,90 | Pesquisa do Rei 👑" },
      {
        name: "description",
        content:
          "1 placa, 1 pagamento, 1 relatório completo. Consulta veicular completa por R$49,90 com PIX ou cartão.",
      },
      { property: "og:title", content: "Plano Pesquisa Completa — R$49,90" },
      {
        property: "og:description",
        content: "Todas as informações disponíveis do veículo em um único relatório.",
      },
    ],
  }),
  component: Planos,
});

const INCLUDED = [
  "Identificação completa do veículo",
  "Situação cadastral e restrições",
  "Histórico disponível nas bases",
  "Indícios de leilão",
  "Histórico de sinistros",
  "Roubo e furto",
  "Débitos quando disponíveis",
  "Recall do fabricante",
  "Dados de mercado e FIPE",
  "Índice do Rei e Veredito do Rei",
  "Relatório em PDF com QR Code",
  "Histórico salvo na sua conta",
];

function Planos() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Planos"
        title="1 placa. 1 pagamento. 1 relatório completo."
        subtitle="Sem pacotes confusos e sem comprar informação por informação: você paga uma vez e recebe tudo o que estiver disponível."
      />

      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="panel overflow-hidden">
          <div className="border-b border-border/70 bg-deep/50 p-8 text-center">
            <p className="text-xs tracking-[0.25em] text-gold uppercase">Plano Pesquisa Completa</p>
            <div className="mt-4 font-display text-6xl font-extrabold text-gradient-neon">R$ 49,90</div>
            <p className="mt-3 text-sm text-muted-foreground">
              Uma consulta completa com todas as informações disponíveis para o veículo pesquisado.
            </p>
          </div>

          <div className="grid gap-2 p-8 sm:grid-cols-2">
            {INCLUDED.map((i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <BadgeCheck className="size-4 shrink-0 text-primary" />
                {i}
              </div>
            ))}
          </div>

          <div className="border-t border-border/70 p-8">
            <PlateSearch size="sm" />
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <QrCode className="size-4 text-primary" /> PIX com liberação automática
              </span>
              <span className="inline-flex items-center gap-2">
                <CreditCard className="size-4 text-primary" /> Cartão de crédito e débito
              </span>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
