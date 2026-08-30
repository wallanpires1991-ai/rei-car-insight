import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  Car,
  CreditCard,
  FileText,
  Gavel,
  Lock,
  Search,
  ShieldAlert,
  Siren,
  TrendingUp,
  Wrench,
  Zap,
  Crown,
} from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { PlateSearch } from "@/components/site/PlateSearch";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pesquisa do Rei 👑 — Consulta veicular completa pela placa" },
      {
        name: "description",
        content:
          "Consulte leilão, sinistro, roubo/furto, restrições, débitos, recall e FIPE pela placa. Relatório completo em PDF por R$49,90.",
      },
      { property: "og:title", content: "Pesquisa do Rei 👑 — Consulta veicular pela placa" },
      {
        property: "og:description",
        content: "A verdade sobre o veículo, antes de fechar negócio. Relatório completo em minutos.",
      },
    ],
  }),
  component: Home,
});

const TRUST = [
  { icon: Lock, title: "Consulta segura", text: "Dados trafegam criptografados e tratados conforme a LGPD." },
  { icon: Zap, title: "Resultado rápido", text: "Cruzamento automático das bases integradas em poucos instantes." },
  { icon: FileText, title: "Relatório completo", text: "PDF profissional com QR Code de validação da consulta." },
  { icon: Crown, title: "Tudo em um só lugar", text: "Inteligência veicular consolidada em um único relatório." },
];

const SECTIONS = [
  { icon: Car, title: "Identificação", text: "Marca, modelo, versão, ano, cor, motorização, câmbio e mais." },
  { icon: ShieldAlert, title: "Situação e restrições", text: "Restrições administrativas, judiciais, financeiras e bloqueios." },
  { icon: Gavel, title: "Leilão", text: "Indícios de passagem por leilão nas bases integradas." },
  { icon: Siren, title: "Sinistro / roubo e furto", text: "Eventos e ocorrências registradas nas fontes consultadas." },
  { icon: CreditCard, title: "Débitos", text: "Multas, IPVA e licenciamento quando a fonte disponibilizar." },
  { icon: Wrench, title: "Recall", text: "Campanhas de recall pendentes divulgadas pelo fabricante." },
  { icon: TrendingUp, title: "Dados de mercado", text: "FIPE, média de preço e faixa estimada de negociação." },
  { icon: BadgeCheck, title: "Índice do Rei", text: "Score de 0 a 100 com os fatores que influenciaram a nota." },
];

function Home() {
  return (
    <PageShell>
      <section id="consultar" className="grid-lines relative overflow-hidden border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-deep/70 px-3 py-1 text-[11px] tracking-[0.2em] text-gold uppercase">
            <Crown className="size-3.5" /> A verdade sobre o veículo, antes de fechar negócio
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl leading-[1.05] font-extrabold md:text-6xl">
            Descubra tudo sobre um veículo <span className="text-gradient-neon">antes de comprar.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            Consulte informações importantes utilizando a placa do veículo de forma rápida, organizada e
            segura.
          </p>

          <div className="mt-9 max-w-3xl">
            <PlateSearch />
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map((t) => (
              <div key={t.title} className="panel p-4">
                <t.icon className="size-5 text-primary" />
                <p className="mt-3 text-sm font-semibold">{t.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <p className="text-xs tracking-[0.25em] text-gold uppercase">O que consultamos</p>
        <h2 className="mt-3 text-2xl font-bold md:text-4xl">Uma central de inteligência veicular</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Cada seção do relatório é alimentada pelos provedores integrados. Quando uma informação não está
          disponível, informamos claramente — nunca preenchemos lacunas.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SECTIONS.map((s) => (
            <div key={s.title} className="panel group p-5 transition-transform hover:-translate-y-1">
              <span className="inline-flex size-10 items-center justify-center rounded-lg bg-deep ring-1 ring-primary/25">
                <s.icon className="size-5 text-primary" />
              </span>
              <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-deep/30">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:py-20">
          <div>
            <p className="text-xs tracking-[0.25em] text-gold uppercase">Por que consultar?</p>
            <h2 className="mt-3 text-2xl font-bold md:text-4xl">
              Antes de comprar um veículo usado, informação é segurança.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Uma consulta pode ajudar o comprador a identificar informações importantes disponíveis sobre o
              histórico do veículo antes da negociação — de indícios de leilão a restrições e débitos em
              aberto.
            </p>
            <Link
              to="/como-funciona"
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-primary/40 px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              Ver como funciona
            </Link>
          </div>

          <div className="panel p-6 md:p-8">
            <p className="text-xs tracking-[0.2em] text-gold uppercase">Plano Pesquisa Completa</p>
            <div className="mt-4 flex items-end gap-2">
              <span className="font-display text-5xl font-extrabold text-gradient-neon">R$ 49,90</span>
              <span className="pb-2 text-sm text-muted-foreground">/ consulta</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Uma consulta completa com todas as informações disponíveis para o veículo pesquisado. Sem
              comprar informação por informação.
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              {["1 placa", "1 pagamento", "1 relatório completo", "PDF com QR Code de validação"].map((i) => (
                <li key={i} className="flex items-center gap-2">
                  <BadgeCheck className="size-4 text-primary" /> {i}
                </li>
              ))}
            </ul>
            <Link
              to="/planos"
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-neon px-5 py-4 text-sm font-bold tracking-wide text-neon-foreground uppercase shadow-glow transition-transform hover:-translate-y-0.5"
            >
              <Search className="size-4" /> Fazer consulta completa — R$49,90
            </Link>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              PIX, cartão de crédito e débito (conforme o gateway).
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center md:py-24">
        <Crown className="mx-auto size-8 text-gold" />
        <h2 className="mt-4 text-2xl font-bold md:text-4xl">Pronto para consultar?</h2>
        <p className="mt-3 text-muted-foreground">
          Digite a placa e o Rei investiga o veículo por você.
        </p>
        <div className="mt-8">
          <PlateSearch size="sm" />
        </div>
      </section>
    </PageShell>
  );
}
