import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, LineChart, Users } from "lucide-react";
import { PageHero, PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/lojistas")({
  head: () => ({
    meta: [
      { title: "Para lojistas — volume e gestão | Pesquisa do Rei 👑" },
      {
        name: "description",
        content:
          "Consultas em volume para lojas e revendas: múltiplos usuários, histórico centralizado e relatórios em PDF.",
      },
      { property: "og:title", content: "Para lojistas — Pesquisa do Rei" },
      {
        property: "og:description",
        content: "Inteligência veicular para revendas, com gestão de equipe e histórico centralizado.",
      },
    ],
  }),
  component: Lojistas,
});

const BENEFITS = [
  { icon: Building2, title: "Conta da loja", text: "Todas as consultas da revenda em um único painel, com histórico permanente." },
  { icon: Users, title: "Equipe", text: "Vários usuários por conta, cada consulta identificada por responsável." },
  { icon: LineChart, title: "Controle de custo", text: "Acompanhe volume, gasto por consulta e economia por lote contratado." },
];

function Lojistas() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Para lojistas"
        title="Compre melhor. Venda com confiança."
        subtitle="Para quem avalia dezenas de veículos por mês, a consulta precisa ser rápida, padronizada e auditável."
      />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-5 md:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.title} className="panel p-6">
              <span className="inline-flex size-10 items-center justify-center rounded-lg bg-deep ring-1 ring-gold/30">
                <b.icon className="size-5 text-gold" />
              </span>
              <h3 className="mt-4 font-semibold">{b.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{b.text}</p>
            </div>
          ))}
        </div>

        <div className="panel mt-10 flex flex-col items-center gap-4 p-8 text-center">
          <h2 className="text-xl font-bold md:text-2xl">Quer condições para volume?</h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            Fale com a equipe para definir um pacote de consultas conforme o volume mensal da sua loja.
          </p>
          <Link
            to="/entrar"
            className="rounded-lg bg-neon px-6 py-3 text-sm font-bold tracking-wide text-neon-foreground uppercase shadow-glow"
          >
            Criar conta de lojista
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
