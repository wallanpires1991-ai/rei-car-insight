import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Crown,
  Download,
  Gavel,
  Loader2,
  Lock,
  QrCode,
  Scale,
  ShieldCheck,
  Siren,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { PageShell } from "@/components/site/PageShell";
import { DataGrid, ReportSection, SeverityPill, toneClasses } from "@/components/report/ui";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatPlate, isValidPlate, normalizePlate } from "@/lib/plate";
import { scoreBand, UNAVAILABLE, type VehicleReport } from "@/lib/report";
import { consultarPlaca, type ConsultaResposta } from "@/lib/consulta.functions";

export const Route = createFileRoute("/consulta/$placa")({
  head: ({ params }) => {
    const t = `Consulta da placa ${formatPlate(params.placa)} — Pesquisa do Rei 👑`;
    return {
      meta: [
        { title: t },
        {
          name: "description",
          content: "Relatório completo de consulta veicular: restrições, leilão, sinistro, débitos e mercado.",
        },
        { property: "og:title", content: t },
        { property: "og:description", content: "Relatório completo de consulta veicular pela placa." },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: ConsultaPage,
});

const STEPS = [
  "Identificando veículo",
  "Consultando bases disponíveis",
  "Analisando histórico",
  "Cruzando informações",
  "Gerando relatório",
  "Preparando o Veredito do Rei",
];

type Stage = "paywall" | "lgpd" | "loading" | "done";

function ConsultaPage() {
  const { placa } = Route.useParams();
  const plate = normalizePlate(placa);
  const valid = isValidPlate(plate);

  const [stage, setStage] = useState<Stage>("paywall");
  const [step, setStep] = useState(0);
  const [resposta, setResposta] = useState<ConsultaResposta | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [lgpdChecked, setLgpdChecked] = useState(false);

  const consultar = useServerFn(consultarPlaca);

  useEffect(() => {
    if (stage !== "loading") return;
    if (step >= STEPS.length) return;
    const t = setTimeout(() => setStep((s) => s + 1), 600);
    return () => clearTimeout(t);
  }, [stage, step]);

  useEffect(() => {
    if (stage !== "loading" || resposta || erro) return;
    let cancelled = false;
    consultar({ data: { placa: plate } })
      .then((r) => {
        if (!cancelled) setResposta(r);
      })
      .catch((e: unknown) => {
        if (!cancelled) setErro(e instanceof Error ? e.message : "Falha ao consultar.");
      });
    return () => {
      cancelled = true;
    };
  }, [stage, plate, consultar, resposta, erro]);

  useEffect(() => {
    if (stage === "loading" && resposta && step >= STEPS.length) setStage("done");
  }, [stage, resposta, step]);

  if (!valid) {
    return (
      <PageShell>
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <AlertTriangle className="mx-auto size-8 text-warning" />
          <h1 className="mt-4 text-2xl font-bold">Placa inválida</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Use o formato Mercosul (ABC1D23) ou o padrão antigo (ABC-1234).
          </p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-lg bg-neon px-5 py-3 text-sm font-bold text-neon-foreground uppercase"
          >
            Voltar ao início
          </Link>
        </div>
      </PageShell>
    );
  }

  if (stage === "paywall") {
    return (
      <PageShell>
        <div className="mx-auto max-w-xl px-4 py-20">
          <div className="panel p-8 text-center">
            <p className="text-xs tracking-[0.25em] text-gold uppercase">Consulta encontrada</p>
            <div className="mt-4 inline-block rounded-lg border border-primary/30 bg-deep px-6 py-3 font-mono text-2xl tracking-[0.3em]">
              {formatPlate(plate)}
            </div>
            <h1 className="mt-6 text-xl font-bold">Plano Pesquisa Completa</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Todas as informações disponíveis para este veículo em um único relatório.
            </p>
            <div className="mt-5 font-display text-4xl font-extrabold text-gradient-neon">R$ 49,90</div>

            <button
              onClick={() => setStage("lgpd")}
              className="mt-7 w-full rounded-lg bg-neon px-5 py-4 text-sm font-bold tracking-wide text-neon-foreground uppercase shadow-glow transition-transform hover:-translate-y-0.5"
            >
              Fazer consulta completa — R$49,90
            </button>
            <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="size-3.5 text-primary" /> PIX, crédito e débito. A consulta é registrada no
              seu histórico e validada por código único.
            </p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (stage === "lgpd") {
    return (
      <PageShell>
        <div className="mx-auto flex min-h-[60vh] max-w-xl items-center px-4 py-12">
          <Dialog open onOpenChange={() => {}}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-warning/10">
                  <Scale className="size-6 text-warning" />
                </div>
                <DialogTitle className="mt-4 text-center font-display text-lg font-bold uppercase">
                  Termo de responsabilidade
                </DialogTitle>
                <DialogDescription className="text-center">
                  Antes de liberar o relatório completo, você precisa confirmar que entende as regras de uso
                  dos dados.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm text-foreground/90">
                <p>
                  Os dados deste relatório são <strong>informações pessoais e sensíveis</strong>, protegidas
                  pela <strong>Lei Geral de Proteção de Dados (LGPD)</strong>.
                </p>
                <ul className="list-disc space-y-1.5 pl-4 text-muted-foreground">
                  <li>
                    Você declara ser o titular dos dados ou possuir autorização legal para consultar esta
                    placa.
                  </li>
                  <li>
                    As informações serão usadas exclusivamente para análise da negociação do veículo.
                  </li>
                  <li>
                    É proibido compartilhar, vender, publicar ou usar os dados para qualquer outro fim.
                  </li>
                  <li>
                    O uso indevido pode gerar <strong>responsabilização civil e criminal</strong>, incluindo
                    processos por violação de privacidade.
                  </li>
                </ul>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <Checkbox
                  id="lgpd-accept"
                  checked={lgpdChecked}
                  onCheckedChange={(v) => setLgpdChecked(v === true)}
                />
                <Label htmlFor="lgpd-accept" className="cursor-pointer text-sm leading-snug text-foreground/90">
                  Li e entendo que devo preservar os dados obtidos, sob pena de responder a processos por
                  violação da LGPD.
                </Label>
              </div>

              <DialogFooter className="pt-2">
                <button
                  disabled={!lgpdChecked}
                  onClick={() => setStage("loading")}
                  className="w-full rounded-lg bg-neon px-5 py-3 text-sm font-bold tracking-wide text-neon-foreground uppercase shadow-glow transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  Li e concordo — prosseguir
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PageShell>
    );
  }

  if (stage === "loading") {
    return (
      <PageShell>
        <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
          <Crown className="animate-king size-12 text-gold" />
          <h1 className="mt-6 font-display text-xl font-extrabold uppercase md:text-2xl">
            O Rei está investigando o veículo...
          </h1>
          <p className="mt-2 font-mono text-sm tracking-[0.25em] text-muted-foreground">
            {formatPlate(plate)}
          </p>

          <ul className="panel mt-8 w-full space-y-3 p-6 text-left">
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-center gap-3 text-sm">
                {i < step ? (
                  <CheckCircle2 className="size-4 text-success" />
                ) : i === step ? (
                  <Loader2 className="size-4 animate-spin text-primary" />
                ) : (
                  <span className="size-4 rounded-full border border-border" />
                )}
                <span className={i <= step ? "text-foreground" : "text-muted-foreground/60"}>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </PageShell>
    );
  }

  if (erro || !resposta) {
    return (
      <PageShell>
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <AlertTriangle className="mx-auto size-8 text-danger" />
          <h1 className="mt-4 text-2xl font-bold">Não foi possível concluir a consulta</h1>
          <p className="mt-2 text-sm text-muted-foreground">{erro}</p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-lg bg-neon px-5 py-3 text-sm font-bold text-neon-foreground uppercase"
          >
            Voltar ao início
          </Link>
        </div>
      </PageShell>
    );
  }

  return <ReportView report={resposta.report} resposta={resposta} />;
}

function ReportView({ report, resposta }: { report: VehicleReport; resposta: ConsultaResposta }) {
  const band = scoreBand(report.score.value);
  const created = new Date(report.createdAt);

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-4 py-10">
        {resposta.fonte === "real" ? (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
            <ShieldCheck className="size-4" /> Dados reais obtidos do provedor licenciado{" "}
            <strong className="font-semibold">{resposta.provedor}</strong>.
          </div>
        ) : (
          <div className="mb-6 flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/5 px-4 py-3 text-sm text-warning">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>{resposta.aviso}</span>
          </div>
        )}
        <div className="panel mb-6 flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs tracking-[0.25em] text-gold uppercase">Consulta veicular</p>
            <h1 className="mt-2 font-mono text-3xl font-bold tracking-[0.2em]">{report.plate}</h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-success">
              <CheckCircle2 className="size-4" /> Consulta concluída
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {created.toLocaleDateString("pt-BR")} às {created.toLocaleTimeString("pt-BR")} · Nº{" "}
              {report.code}
            </p>
          </div>

          <div className="flex flex-col gap-2 md:items-end">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-neon px-5 py-3 text-sm font-bold tracking-wide text-neon-foreground uppercase shadow-glow print:hidden"
            >
              <Download className="size-4" /> Baixar relatório completo em PDF
            </button>
            <Link
              to="/verificar/$codigo"
              params={{ codigo: report.code }}
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground print:hidden"
            >
              <QrCode className="size-3.5" /> Validar esta consulta
            </Link>
          </div>
        </div>

        <div className="space-y-5">
          <ReportSection index={1} title="Identificação do veículo">
            <DataGrid fields={report.identification} />
          </ReportSection>

          <ReportSection
            index={2}
            title="Situação do veículo"
            aside={
              <SeverityPill severity={report.situation.overall}>
                {report.situation.overall === "ok" ? "✓ Situação regular" : "⚠ Atenção necessária"}
              </SeverityPill>
            }
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {report.situation.items.map((i) => (
                <div
                  key={i.label}
                  className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${toneClasses(i.severity)}`}
                >
                  <span className="text-foreground/90">{i.label}</span>
                  <span className="font-medium">{i.value}</span>
                </div>
              ))}
            </div>
          </ReportSection>

          <ReportSection index={3} title="Histórico do veículo">
            {report.history.length === 0 && (
              <p className="text-sm text-muted-foreground/70 italic">{UNAVAILABLE}</p>
            )}
            <ul className="space-y-4">
              {report.history.map((h) => (
                <li key={h.title} className="border-l-2 border-primary/40 pl-4">
                  <p className="text-sm font-semibold">{h.title}</p>
                  <p
                    className={`mt-1 text-sm ${h.description === UNAVAILABLE ? "text-muted-foreground/70 italic" : "text-muted-foreground"}`}
                  >
                    {h.description}
                  </p>
                </li>
              ))}
            </ul>
          </ReportSection>

          <ReportSection
            index={4}
            title="Histórico de leilão"
            aside={
              <SeverityPill severity={report.auction.found ? "critical" : "ok"}>
                <Gavel className="size-3.5" />
                {report.auction.found ? "🚨 Possível passagem por leilão" : "✓ Nenhum registro encontrado"}
              </SeverityPill>
            }
          >
            {report.auction.found ? (
              <DataGrid fields={report.auction.items} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum registro encontrado nas bases consultadas.
              </p>
            )}
            <p className="mt-4 text-xs text-muted-foreground/80">{report.auction.note}</p>
          </ReportSection>

          <ReportSection
            index={5}
            title="Histórico de sinistros"
            aside={
              <SeverityPill severity={report.damage.severity}>
                {report.damage.severity === "ok"
                  ? "🟢 Sem informação relevante"
                  : report.damage.severity === "warn"
                    ? "🟡 Atenção"
                    : "🔴 Histórico relevante identificado"}
              </SeverityPill>
            }
          >
            <p className="mb-4 text-sm text-muted-foreground">{report.damage.summary}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {report.damage.items.map((i) => (
                <div
                  key={i.label}
                  className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${toneClasses(i.severity)}`}
                >
                  <span className="text-foreground/90">{i.label}</span>
                  <span className="font-medium">{i.value}</span>
                </div>
              ))}
            </div>
          </ReportSection>

          <ReportSection
            index={6}
            title="Roubo e furto"
            aside={
              <SeverityPill severity={report.theft.found ? "critical" : "ok"}>
                <Siren className="size-3.5" />
                {report.theft.found ? "Ocorrência localizada" : "Sem ocorrência localizada"}
              </SeverityPill>
            }
          >
            {report.theft.found && (
              <div className="mb-5 rounded-xl border border-danger/50 bg-danger/10 p-5">
                <p className="flex items-center gap-2 font-display text-base font-bold text-danger uppercase">
                  <AlertTriangle className="size-5" /> Alerta: ocorrência encontrada
                </p>
                <p className="mt-2 text-sm text-foreground/90">
                  Foi localizada uma ocorrência nas bases consultadas. Não prossiga com a negociação sem
                  verificação presencial e orientação profissional.
                </p>
              </div>
            )}
            <DataGrid fields={report.theft.items} />
          </ReportSection>

          <ReportSection
            index={7}
            title="Débitos"
            aside={
              <SeverityPill severity={report.debts.severity}>
                {report.debts.severity === "ok" ? "Sem pendência localizada" : "Pendências localizadas"}
              </SeverityPill>
            }
          >
            <DataGrid fields={report.debts.items} />
            <p className="mt-4 text-xs text-muted-foreground/80">
              Os valores apresentados dependem da disponibilidade e atualização das bases integradas.
            </p>
          </ReportSection>

          <ReportSection
            index={8}
            title="Recall"
            aside={
              <SeverityPill severity={report.recall.pending ? "warn" : "ok"}>
                {report.recall.pending ? "Campanha pendente" : "Nenhum recall pendente"}
              </SeverityPill>
            }
          >
            <DataGrid fields={report.recall.items} />
          </ReportSection>

          <ReportSection
            index={9}
            title="Inteligência de mercado"
            aside={
              <SeverityPill severity="unknown">
                <TrendingUp className="size-3.5" /> Fonte autorizada
              </SeverityPill>
            }
          >
            <DataGrid
              fields={[
                { label: "Valor FIPE", value: report.market.fipe },
                { label: "Média de preço", value: report.market.average },
                { label: "Faixa estimada de mercado", value: report.market.range },
              ]}
            />
            <div className="mt-6">
              <div className="relative h-3 rounded-full bg-gradient-to-r from-success via-warning to-danger/80">
                <span
                  className="absolute -top-1 size-5 -translate-x-1/2 rounded-full border-2 border-background bg-foreground"
                  style={{ left: `${report.market.position}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[11px] tracking-wider text-muted-foreground uppercase">
                <span>Abaixo da média</span>
                <span>Na média</span>
                <span>Acima da média</span>
              </div>
            </div>
          </ReportSection>

          <ReportSection index={10} title="Índice do Rei 👑">
            <div className="flex flex-col items-center gap-6 md:flex-row">
              <div
                className={`flex size-32 shrink-0 flex-col items-center justify-center rounded-full border-4 ${toneClasses(band.tone)}`}
              >
                <span className="font-display text-4xl font-extrabold">{report.score.value}</span>
                <span className="text-[10px] tracking-widest uppercase">/ 100</span>
              </div>
              <div className="flex-1">
                <p className="font-display text-lg font-bold">
                  {band.emoji} {band.label}
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  {report.score.factors.map((f) => (
                    <li key={f.label} className="flex items-center justify-between gap-3">
                      <span>{f.label}</span>
                      <span className={f.impact < 0 ? "text-danger" : "text-success"}>
                        {f.impact === 0 ? "—" : f.impact}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-5 text-xs text-muted-foreground/80">
              Este índice é informativo e baseado exclusivamente nas informações disponíveis nas fontes
              consultadas.
            </p>
          </ReportSection>

          <section className="panel border-gold/30 p-6 md:p-8">
            <div className="flex items-center gap-3">
              <Crown className="size-6 text-gold" />
              <h2 className="font-display text-lg font-extrabold tracking-tight uppercase md:text-xl">
                Veredito do Rei
              </h2>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Com base nas informações disponíveis nas fontes consultadas, este veículo apresenta os
              seguintes pontos.
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="rounded-xl border border-success/30 bg-success/5 p-5">
                <h3 className="text-sm font-bold tracking-wide text-success uppercase">Pontos positivos</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {report.verdict.positives.map((p) => (
                    <li key={p} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-warning/30 bg-warning/5 p-5">
                <h3 className="text-sm font-bold tracking-wide text-warning uppercase">Pontos de atenção</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {report.verdict.attention.map((p) => (
                    <li key={p} className="flex gap-2">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="mt-6 text-xs text-muted-foreground/80">
              Informações disponíveis no momento da consulta. A consulta não substitui uma vistoria cautelar
              presencial.
            </p>
          </section>

          <section className="panel p-6">
            <h2 className="text-sm font-bold tracking-wide uppercase">Fontes consultadas</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {report.sources.map((s) => (
                <SeverityPill
                  key={s.name}
                  severity={s.status === "ok" ? "ok" : s.status === "parcial" ? "warn" : "critical"}
                >
                  <ShieldCheck className="size-3.5" /> {s.name}
                </SeverityPill>
              ))}
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
