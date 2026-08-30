import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHero, PageShell } from "@/components/site/PageShell";
import { LEGAL_DISCLAIMER } from "@/components/site/Footer";

const DOCS: Record<string, { title: string; subtitle: string; body: string[] }> = {
  termos: {
    title: "Termos de Uso",
    subtitle: "Condições para utilização da plataforma Pesquisa do Rei.",
    body: [
      "Ao utilizar a plataforma, o usuário concorda em fornecer dados verdadeiros e utilizar as consultas para finalidade lícita, relacionada à avaliação de um veículo.",
      "Cada consulta corresponde a uma placa e é liberada após a confirmação do pagamento. O relatório reflete exclusivamente as informações retornadas pelas fontes integradas no momento da consulta.",
      "É vedada a revenda, redistribuição automatizada ou raspagem do conteúdo dos relatórios, bem como qualquer tentativa de acesso automatizado não autorizado à plataforma.",
      LEGAL_DISCLAIMER,
    ],
  },
  privacidade: {
    title: "Política de Privacidade",
    subtitle: "Como tratamos os dados coletados na plataforma.",
    body: [
      "Coletamos apenas os dados necessários para criar a conta, processar o pagamento e entregar o relatório: nome, e-mail, telefone, placas consultadas e registros de pagamento.",
      "Credenciais de provedores e chaves de API são mantidas exclusivamente no backend, em variáveis de ambiente, e nunca são expostas ao navegador.",
      "Registros de acesso e auditoria são mantidos pelo período legal aplicável para fins de segurança e prevenção a fraudes.",
      "O usuário pode solicitar acesso, correção ou exclusão dos seus dados pelos canais de atendimento.",
    ],
  },
  lgpd: {
    title: "LGPD",
    subtitle: "Tratamento de dados conforme a Lei nº 13.709/2018.",
    body: [
      "O tratamento de dados pessoais ocorre com base na execução de contrato, no cumprimento de obrigação legal e no legítimo interesse de prevenção a fraudes.",
      "Não armazenamos dados pessoais desnecessários e não realizamos coleta por meios não autorizados ou raspagem de sistemas governamentais protegidos.",
      "As integrações com bases veiculares ocorrem somente mediante contrato, credenciais válidas e autorização do fornecedor.",
      "Titulares de dados podem exercer seus direitos previstos na LGPD junto ao nosso encarregado de dados.",
    ],
  },
  aviso: {
    title: "Aviso Legal",
    subtitle: "Limites e natureza informativa da consulta.",
    body: [
      LEGAL_DISCLAIMER,
      "O Índice do Rei é um indicador informativo, calculado apenas com base nas informações efetivamente retornadas pelas fontes consultadas, e não constitui certificação, laudo ou garantia.",
      "Recomenda-se sempre a realização de vistoria cautelar presencial e análise documental profissional antes da conclusão de qualquer negociação.",
    ],
  },
};

export const Route = createFileRoute("/legal/$doc")({
  loader: ({ params }) => {
    const doc = DOCS[params.doc];
    if (!doc) throw notFound();
    return { doc };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Documento não encontrado" }, { name: "robots", content: "noindex" }] };
    }
    const t = `${loaderData.doc.title} — Pesquisa do Rei 👑`;
    return {
      meta: [
        { title: t },
        { name: "description", content: loaderData.doc.subtitle },
        { property: "og:title", content: t },
        { property: "og:description", content: loaderData.doc.subtitle },
      ],
    };
  },
  component: LegalDoc,
  errorComponent: () => (
    <PageShell>
      <PageHero eyebrow="Legal" title="Não foi possível carregar" subtitle="Tente novamente em instantes." />
    </PageShell>
  ),
  notFoundComponent: () => (
    <PageShell>
      <PageHero eyebrow="Legal" title="Documento não encontrado" subtitle="Verifique o endereço acessado." />
    </PageShell>
  ),
});

function LegalDoc() {
  const { doc } = Route.useLoaderData();
  return (
    <PageShell>
      <PageHero eyebrow="Legal" title={doc.title} subtitle={doc.subtitle} />
      <article className="mx-auto max-w-3xl space-y-5 px-4 py-14 text-sm leading-relaxed text-muted-foreground">
        {doc.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </article>
    </PageShell>
  );
}
