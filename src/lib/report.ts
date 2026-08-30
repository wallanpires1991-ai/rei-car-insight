import { formatPlate, normalizePlate } from "./plate";

export const UNAVAILABLE = "Informação não disponível na base consultada.";

export type Severity = "ok" | "warn" | "critical" | "unknown";

export type Field = { label: string; value: string | null };

export type StatusItem = { label: string; value: string; severity: Severity };

export type VehicleReport = {
  code: string;
  plate: string;
  plateRaw: string;
  createdAt: string;
  identification: Field[];
  situation: { overall: Severity; items: StatusItem[] };
  history: { title: string; description: string }[];
  auction: { found: boolean; items: Field[]; note: string };
  damage: { severity: Severity; summary: string; items: StatusItem[] };
  theft: { found: boolean; items: Field[] };
  debts: { severity: Severity; items: { label: string; value: string | null }[] };
  recall: { pending: boolean; items: { label: string; value: string | null }[] };
  market: { fipe: string | null; average: string | null; range: string | null; position: number };
  score: { value: number; factors: { label: string; impact: number }[] };
  verdict: { positives: string[]; attention: string[] };
  sources: { name: string; status: "ok" | "parcial" | "indisponivel" }[];
};

/** Hash determinístico simples para gerar a demonstração sempre igual por placa. */
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const MODELS = [
  { brand: "Volkswagen", model: "Nivus", version: "Highline 200 TSI", fuel: "Flex", engine: "1.0 TSI" },
  { brand: "Toyota", model: "Corolla", version: "XEi 2.0", fuel: "Flex", engine: "2.0 16V" },
  { brand: "Jeep", model: "Compass", version: "Longitude T270", fuel: "Flex", engine: "1.3 Turbo" },
  { brand: "Honda", model: "Civic", version: "EXL 2.0", fuel: "Gasolina", engine: "2.0 16V" },
  { brand: "Chevrolet", model: "Onix Plus", version: "LTZ 1.0 Turbo", fuel: "Flex", engine: "1.0 Turbo" },
  { brand: "Fiat", model: "Toro", version: "Freedom 1.3 T270", fuel: "Flex", engine: "1.3 Turbo" },
];

const CITIES = [
  ["São Paulo", "SP"],
  ["Belo Horizonte", "MG"],
  ["Curitiba", "PR"],
  ["Goiânia", "GO"],
  ["Salvador", "BA"],
  ["Porto Alegre", "RS"],
];

const COLORS = ["Preta", "Prata", "Branca", "Cinza", "Vermelha", "Azul"];

/**
 * DEMONSTRAÇÃO: gera um relatório coerente e determinístico a partir da placa.
 * Ao integrar os provedores licenciados, substitua esta função pela resposta
 * consolidada da camada Vehicle Data Providers (backend).
 */
export function buildDemoReport(plateInput: string): VehicleReport {
  const plateRaw = normalizePlate(plateInput);
  const h = hash(plateRaw);
  const pick = <T,>(arr: T[], salt: number): T => arr[(h >> salt) % arr.length] as T;

  const car = pick(MODELS, 2);
  const [city, uf] = pick(CITIES, 5) as [string, string];
  const year = 2015 + (h % 10);
  const hasAuction = h % 7 === 0;
  const damageLevel = h % 11 === 0 ? "critical" : h % 5 === 0 ? "warn" : "ok";
  const hasTheft = h % 23 === 0;
  const hasRestriction = h % 4 === 0;
  const debtValue = (h % 9) * 137.4;
  const recallPending = h % 6 === 0;

  const factors: { label: string; impact: number }[] = [];
  let score = 100;
  if (hasAuction) {
    score -= 22;
    factors.push({ label: "Indício de passagem por leilão", impact: -22 });
  }
  if (damageLevel === "critical") {
    score -= 28;
    factors.push({ label: "Registro de sinistro de grande monta", impact: -28 });
  } else if (damageLevel === "warn") {
    score -= 12;
    factors.push({ label: "Evento de sinistro registrado", impact: -12 });
  }
  if (hasTheft) {
    score -= 40;
    factors.push({ label: "Ocorrência de roubo/furto localizada", impact: -40 });
  }
  if (hasRestriction) {
    score -= 10;
    factors.push({ label: "Restrição administrativa/financeira ativa", impact: -10 });
  }
  if (debtValue > 0) {
    score -= 6;
    factors.push({ label: "Débitos em aberto identificados", impact: -6 });
  }
  if (recallPending) {
    score -= 4;
    factors.push({ label: "Campanha de recall pendente", impact: -4 });
  }
  if (factors.length === 0) {
    factors.push({ label: "Nenhum apontamento nas fontes consultadas", impact: 0 });
  }
  score = Math.max(0, Math.min(100, score));

  const situationItems: StatusItem[] = [
    { label: "Situação cadastral", value: hasTheft ? "Irregular" : "Regular", severity: hasTheft ? "critical" : "ok" },
    {
      label: "Restrições administrativas",
      value: hasRestriction ? "1 restrição localizada" : "Nenhuma localizada",
      severity: hasRestriction ? "warn" : "ok",
    },
    { label: "Restrições judiciais", value: "Nenhuma localizada", severity: "ok" },
    {
      label: "Restrições financeiras",
      value: hasRestriction ? "Alienação fiduciária ativa" : "Nenhuma localizada",
      severity: hasRestriction ? "warn" : "ok",
    },
    { label: "Bloqueios", value: hasTheft ? "Bloqueio por ocorrência" : "Nenhum localizado", severity: hasTheft ? "critical" : "ok" },
    { label: "Comunicação de venda", value: h % 3 === 0 ? "Registrada" : "Não localizada", severity: "ok" },
    { label: "Pendências conhecidas", value: debtValue > 0 ? "Débitos em aberto" : "Nenhuma localizada", severity: debtValue > 0 ? "warn" : "ok" },
  ];

  const overall: Severity = situationItems.some((i) => i.severity === "critical")
    ? "critical"
    : situationItems.some((i) => i.severity === "warn")
      ? "warn"
      : "ok";

  const brl = (n: number) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

  const fipe = 48000 + (h % 90) * 1000;

  return {
    code: `PDR-${plateRaw}-${(h % 100000).toString().padStart(5, "0")}`,
    plate: formatPlate(plateRaw),
    plateRaw,
    createdAt: new Date().toISOString(),
    identification: [
      { label: "Placa", value: formatPlate(plateRaw) },
      { label: "Marca", value: car.brand },
      { label: "Modelo", value: car.model },
      { label: "Versão", value: car.version },
      { label: "Ano fabricação", value: String(year) },
      { label: "Ano modelo", value: String(year + 1) },
      { label: "Cor", value: pick(COLORS, 8) },
      { label: "Combustível", value: car.fuel },
      { label: "Categoria", value: "Particular" },
      { label: "Tipo do veículo", value: "Automóvel" },
      { label: "Município", value: city },
      { label: "Estado", value: uf },
      { label: "País", value: "Brasil" },
      { label: "Chassi", value: `9BW••••••${(h % 10000).toString().padStart(4, "0")}` },
      { label: "RENAVAM", value: null },
      { label: "Motorização", value: car.engine },
      { label: "Cilindrada", value: `${1000 + (h % 3) * 300} cm³` },
      { label: "Potência", value: `${110 + (h % 60)} cv` },
      { label: "Câmbio", value: h % 2 === 0 ? "Automático" : "Manual" },
      { label: "Número de portas", value: "4" },
    ],
    situation: { overall, items: situationItems },
    history: [
      { title: "Registro inicial", description: `Primeiro emplacamento em ${city}/${uf} em ${year}.` },
      {
        title: "Histórico de municípios",
        description: h % 2 === 0 ? `Transferência registrada para ${city}/${uf}.` : UNAVAILABLE,
      },
      { title: "Histórico de proprietários", description: `${1 + (h % 4)} registro(s) de titularidade nas bases integradas.` },
      { title: "Eventos registrados", description: hasAuction ? "Evento de comercialização em lote identificado." : UNAVAILABLE },
    ],
    auction: {
      found: hasAuction,
      items: hasAuction
        ? [
            { label: "Data", value: `${10 + (h % 18)}/0${1 + (h % 9)}/${year + 3}` },
            { label: "Tipo de leilão", value: h % 2 === 0 ? "Sinistro / seguradora" : "Financeira" },
            { label: "Empresa/leiloeiro", value: null },
            { label: "Categoria", value: h % 2 === 0 ? "Recuperável" : "Repasse" },
            { label: "Observações", value: "Registro localizado em base de histórico veicular integrada." },
          ]
        : [],
      note:
        "A ausência de registro em uma fonte não representa garantia absoluta de inexistência em todas as bases.",
    },
    damage: {
      severity: damageLevel as Severity,
      summary:
        damageLevel === "critical"
          ? "Histórico relevante identificado nas bases consultadas."
          : damageLevel === "warn"
            ? "Evento registrado que merece atenção."
            : "Sem informação relevante encontrada nas fontes consultadas.",
      items: [
        { label: "Pequena monta", value: damageLevel === "warn" ? "Registro localizado" : "Sem registro", severity: damageLevel === "warn" ? "warn" : "ok" },
        { label: "Média monta", value: "Sem registro", severity: "ok" },
        { label: "Grande monta", value: damageLevel === "critical" ? "Registro localizado" : "Sem registro", severity: damageLevel === "critical" ? "critical" : "ok" },
        { label: "Classificação disponível", value: damageLevel === "ok" ? UNAVAILABLE : "Disponível na base integrada", severity: "unknown" },
      ],
    },
    theft: {
      found: hasTheft,
      items: [
        { label: "Registro de roubo", value: hasTheft ? "Ocorrência localizada" : "Nenhum registro localizado" },
        { label: "Registro de furto", value: "Nenhum registro localizado" },
        { label: "Status atual", value: hasTheft ? "Em aberto na base consultada" : "Sem ocorrência" },
        { label: "Data do evento", value: hasTheft ? `${1 + (h % 27)}/0${1 + (h % 9)}/${year + 4}` : null },
      ],
    },
    debts: {
      severity: debtValue > 0 ? "warn" : "ok",
      items: [
        { label: "Multas", value: debtValue > 0 ? brl(debtValue) : "Nenhuma localizada" },
        { label: "IPVA", value: h % 3 === 0 ? brl(1200 + (h % 800)) : "Sem pendência localizada" },
        { label: "Licenciamento", value: h % 5 === 0 ? brl(160.8) : "Sem pendência localizada" },
        { label: "Outros débitos", value: null },
      ],
    },
    recall: {
      pending: recallPending,
      items: [
        { label: "Recall pendente", value: recallPending ? "Sim — campanha em aberto" : "Nenhum pendente localizado" },
        { label: "Fabricante", value: car.brand },
        {
          label: "Descrição",
          value: recallPending ? "Campanha preventiva de substituição de componente de segurança." : null,
        },
        {
          label: "Orientação",
          value: recallPending ? "Procurar uma concessionária autorizada da marca; o reparo é gratuito." : null,
        },
      ],
    },
    market: {
      fipe: brl(fipe),
      average: brl(fipe * 0.97),
      range: `${brl(fipe * 0.9)} — ${brl(fipe * 1.08)}`,
      position: 30 + (h % 45),
    },
    score: { value: score, factors },
    verdict: {
      positives: [
        !hasRestriction ? "Sem restrição encontrada nas fontes consultadas" : "Documentação localizada nas bases integradas",
        !hasTheft ? "Sem registro de roubo/furto encontrado" : "Dados cadastrais localizados",
        "Dados cadastrais compatíveis com a placa informada",
      ],
      attention: [
        ...(hasAuction ? ["Possível passagem por leilão identificada"] : []),
        ...(damageLevel !== "ok" ? ["Histórico de sinistro registrado nas bases consultadas"] : []),
        ...(hasTheft ? ["Ocorrência de roubo/furto localizada — atenção máxima"] : []),
        ...(debtValue > 0 ? ["Débitos em aberto identificados"] : []),
        "Recomenda-se vistoria cautelar presencial antes da compra",
      ],
    },
    sources: [
      { name: "Base cadastral veicular", status: "ok" },
      { name: "Histórico veicular", status: "ok" },
      { name: "Leilão", status: hasAuction ? "ok" : "parcial" },
      { name: "Sinistro", status: "ok" },
      { name: "Roubo e furto", status: "ok" },
      { name: "Débitos", status: "parcial" },
      { name: "Recall", status: "ok" },
      { name: "Mercado / FIPE", status: "ok" },
    ],
  };
}

export function scoreBand(value: number) {
  if (value >= 90) return { label: "BOM HISTÓRICO", tone: "ok" as Severity, emoji: "🟢" };
  if (value >= 70) return { label: "ATENÇÃO", tone: "warn" as Severity, emoji: "🟡" };
  return { label: "RECOMENDA-SE ANÁLISE DETALHADA", tone: "critical" as Severity, emoji: "🔴" };
}
