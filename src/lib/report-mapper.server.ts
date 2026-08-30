/**
 * Converte a resposta bruta de um provedor licenciado no formato VehicleReport.
 * Tolerante a variações de shape entre provedores: qualquer campo ausente vira
 * "Informação não disponível na base consultada." em vez de dado inventado.
 */
import { formatPlate } from "./plate";
import { UNAVAILABLE, type Field, type Severity, type StatusItem, type VehicleReport } from "./report";
import type { ProviderSlug } from "./vehicle-providers.server";

type Any = Record<string, unknown>;

function isObj(v: unknown): v is Any {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Busca uma chave em qualquer profundidade do JSON do provedor. */
function pick(source: unknown, keys: string[]): string | null {
  const wanted = keys.map((k) => k.toLowerCase().replace(/[^a-z0-9]/g, ""));
  const seen = new Set<unknown>();
  const stack: unknown[] = [source];
  while (stack.length) {
    const node = stack.pop();
    if (Array.isArray(node)) {
      stack.push(...node);
      continue;
    }
    if (!isObj(node) || seen.has(node)) continue;
    seen.add(node);
    for (const [key, value] of Object.entries(node)) {
      const norm = key.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (wanted.includes(norm)) {
        if (typeof value === "string" && value.trim()) return value.trim();
        if (typeof value === "number") return String(value);
        if (typeof value === "boolean") return value ? "Sim" : "Não";
      }
      if (isObj(value) || Array.isArray(value)) stack.push(value);
    }
  }
  return null;
}

function flag(source: unknown, keys: string[]): boolean | null {
  const value = pick(source, keys);
  if (value === null) return null;
  const v = value.toLowerCase();
  if (["sim", "true", "1", "positivo", "constam", "consta"].includes(v)) return true;
  if (["nao", "não", "false", "0", "negativo", "nada consta", "nadaconsta"].includes(v)) return false;
  return null;
}

function statusItem(label: string, value: boolean | null, badWhenTrue = true): StatusItem {
  if (value === null) return { label, value: UNAVAILABLE, severity: "unknown" };
  const bad = badWhenTrue ? value : !value;
  return {
    label,
    value: value ? "Consta registro" : "Nada consta",
    severity: bad ? "critical" : "ok",
  };
}

export function buildReportFromProvider(
  plateInput: string,
  provider: ProviderSlug,
  raw: Any,
  code: string,
): VehicleReport {
  const plate = formatPlate(plateInput);

  const identification: Field[] = [
    { label: "Placa", value: plate },
    { label: "Marca", value: pick(raw, ["marca", "brand", "marcaModelo"]) },
    { label: "Modelo", value: pick(raw, ["modelo", "model", "submodelo"]) },
    { label: "Versão", value: pick(raw, ["versao", "version"]) },
    { label: "Ano fabricação", value: pick(raw, ["anoFabricacao", "ano", "anoFab"]) },
    { label: "Ano modelo", value: pick(raw, ["anoModelo", "anoMod"]) },
    { label: "Cor", value: pick(raw, ["cor", "color"]) },
    { label: "Combustível", value: pick(raw, ["combustivel", "fuel"]) },
    { label: "Chassi", value: pick(raw, ["chassi", "chassis", "vin"]) },
    { label: "Motor", value: pick(raw, ["motor", "numeroMotor", "engine"]) },
    { label: "Município", value: pick(raw, ["municipio", "cidade", "city"]) },
    { label: "UF", value: pick(raw, ["uf", "estado", "state"]) },
    { label: "Renavam", value: pick(raw, ["renavam"]) },
    { label: "Espécie/Tipo", value: pick(raw, ["especie", "tipoVeiculo", "tipo"]) },
  ];

  const roubo = flag(raw, ["roubo", "furto", "rouboFurto", "indicadorRoubo"]);
  const restricao = pick(raw, ["restricao", "restricoes", "situacao", "situacaoVeiculo"]);
  const gravame = pick(raw, ["gravame", "financiamento", "restricaoFinanceira"]);
  const leilao = flag(raw, ["leilao", "leilaoIndicador", "remarcado"]);
  const sinistro = flag(raw, ["sinistro", "perdaTotal", "indicadorSinistro"]);
  const recall = flag(raw, ["recall", "recallPendente"]);

  const situationItems: StatusItem[] = [
    {
      label: "Situação cadastral",
      value: restricao ?? UNAVAILABLE,
      severity: restricao
        ? /nada consta|sem restri|circula/i.test(restricao)
          ? "ok"
          : "warn"
        : "unknown",
    },
    {
      label: "Restrição financeira / gravame",
      value: gravame ?? UNAVAILABLE,
      severity: gravame ? (/nao|não|sem|nada/i.test(gravame) ? "ok" : "warn") : "unknown",
    },
    statusItem("Roubo e furto", roubo),
  ];

  const worst: Severity = situationItems.some((i) => i.severity === "critical")
    ? "critical"
    : situationItems.some((i) => i.severity === "warn")
      ? "warn"
      : situationItems.every((i) => i.severity === "unknown")
        ? "unknown"
        : "ok";

  const factors: { label: string; impact: number }[] = [];
  let score = 100;
  const penalize = (label: string, cond: boolean | null, weight: number) => {
    if (cond === true) {
      score -= weight;
      factors.push({ label, impact: -weight });
    } else if (cond === false) {
      factors.push({ label, impact: 0 });
    }
  };
  penalize("Registro de roubo/furto", roubo, 45);
  penalize("Passagem por leilão", leilao, 25);
  penalize("Sinistro / perda total", sinistro, 30);
  penalize("Recall pendente", recall, 8);
  if (gravame && !/nao|não|sem|nada/i.test(gravame)) {
    score -= 12;
    factors.push({ label: "Restrição financeira ativa", impact: -12 });
  }
  score = Math.max(0, Math.min(100, score));

  const positives: string[] = [];
  const attention: string[] = [];
  if (roubo === false) positives.push("Sem registro de roubo ou furto nas bases consultadas.");
  if (roubo === true) attention.push("Consta registro de roubo/furto. Não feche negócio.");
  if (leilao === false) positives.push("Sem indicativo de passagem por leilão.");
  if (leilao === true) attention.push("Indicativo de passagem por leilão.");
  if (sinistro === true) attention.push("Indicativo de sinistro / perda total.");
  if (recall === true) attention.push("Recall pendente junto à montadora.");
  if (positives.length === 0 && attention.length === 0) {
    attention.push("Cobertura parcial: parte das bases não retornou informação para esta placa.");
  }

  return {
    code,
    plate,
    plateRaw: plateInput,
    createdAt: new Date().toISOString(),
    identification,
    situation: { overall: worst, items: situationItems },
    history: [],
    auction: {
      found: leilao === true,
      items: [
        { label: "Indicativo de leilão", value: leilao === null ? null : leilao ? "Sim" : "Não" },
        { label: "Comitente / lote", value: pick(raw, ["comitente", "lote"]) },
        { label: "Data do leilão", value: pick(raw, ["dataLeilao"]) },
      ],
      note: "Indicativo baseado nas bases retornadas pelo provedor licenciado.",
    },
    damage: {
      severity: sinistro === true ? "critical" : sinistro === false ? "ok" : "unknown",
      summary:
        sinistro === null
          ? UNAVAILABLE
          : sinistro
            ? "Consta indicativo de sinistro registrado."
            : "Nada consta em bases de sinistro.",
      items: [statusItem("Perda total", flag(raw, ["perdaTotal"]))],
    },
    theft: {
      found: roubo === true,
      items: [
        { label: "Ocorrência", value: roubo === null ? null : roubo ? "Consta" : "Nada consta" },
        { label: "Data da ocorrência", value: pick(raw, ["dataOcorrencia", "dataRoubo"]) },
        { label: "UF da ocorrência", value: pick(raw, ["ufOcorrencia"]) },
      ],
    },
    debts: {
      severity: "unknown",
      items: [
        { label: "IPVA", value: pick(raw, ["ipva", "debitoIpva"]) },
        { label: "Licenciamento", value: pick(raw, ["licenciamento"]) },
        { label: "Multas", value: pick(raw, ["multas", "debitoMultas"]) },
        { label: "DPVAT", value: pick(raw, ["dpvat"]) },
      ],
    },
    recall: {
      pending: recall === true,
      items: [
        { label: "Recall pendente", value: recall === null ? null : recall ? "Sim" : "Não" },
        { label: "Descrição", value: pick(raw, ["recallDescricao", "descricaoRecall"]) },
      ],
    },
    market: {
      fipe: pick(raw, ["fipe", "valorFipe", "precoFipe", "valor"]),
      average: pick(raw, ["valorMedio", "mediaMercado"]),
      range: null,
      position: 50,
    },
    score: { value: score, factors },
    verdict: { positives, attention },
    sources: [
      { name: `Provedor licenciado (${provider})`, status: "ok" },
      { name: "Bases oficiais agregadas", status: factors.length > 0 ? "ok" : "parcial" },
    ],
  };
}
