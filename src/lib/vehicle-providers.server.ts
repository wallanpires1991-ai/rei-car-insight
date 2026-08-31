/**
 * Camada Vehicle Data Providers — executa APENAS no servidor.
 *
 * Cada provedor é uma API licenciada de dados veiculares. As chaves ficam em
 * variáveis de ambiente (segredos), nunca no navegador. A ordem de tentativa
 * segue a prioridade; se um provedor falhar, o próximo assume (fallback).
 */

export type ProviderSlug = "apibrasil" | "infosimples" | "consultasprime";

export type ProviderResult = {
  provider: ProviderSlug;
  raw: Record<string, unknown>;
};

export class ProviderNotConfiguredError extends Error {
  constructor() {
    super("NENHUM_PROVEDOR_CONFIGURADO");
    this.name = "ProviderNotConfiguredError";
  }
}

export class ProviderFailedError extends Error {
  constructor(public readonly details: string) {
    super("FALHA_PROVEDOR");
    this.name = "ProviderFailedError";
  }
}

type Provider = {
  slug: ProviderSlug;
  priority: number;
  isConfigured: () => boolean;
  fetch: (plate: string) => Promise<Record<string, unknown>>;
};

async function readJson(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 500)}`);
  }
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error(`Resposta inválida do provedor: ${text.slice(0, 300)}`);
  }
}

/**
 * Token da API veicular. Lido SOMENTE no servidor, a partir dos Secrets.
 * Nome oficial: VEICULAR_API_TOKEN (INFOSIMPLES_TOKEN é aceito por compatibilidade).
 * Nunca é retornado ao frontend nem registrado em logs.
 */
function veicularToken(): string | undefined {
  return process.env["VEICULAR_API_TOKEN"] || process.env["INFOSIMPLES_TOKEN"] || undefined;
}

const providers: Provider[] = [
  {
    slug: "apibrasil",
    priority: 10,
    isConfigured: () =>
      Boolean(process.env["APIBRASIL_TOKEN"] && process.env["APIBRASIL_DEVICE_TOKEN"]),
    fetch: async (plate) => {
      const res = await fetch("https://gateway.apibrasil.io/api/v2/vehicles/dados", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env["APIBRASIL_TOKEN"]}`,
          DeviceToken: process.env["APIBRASIL_DEVICE_TOKEN"] ?? "",
        },
        body: JSON.stringify({ placa: plate }),
      });
      return readJson(res);
    },
  },
  {
    slug: "infosimples",
    // Provedor principal: token contratado pelo cliente.
    priority: 5,
    isConfigured: () => Boolean(veicularToken()),
    fetch: async (plate) => {
      const token = veicularToken()!;
      const endpoints = (
        process.env["INFOSIMPLES_ENDPOINT"] ??
        [
          // Nacional (recomendado) → estaduais como fallback.
          "https://api.infosimples.com/api/v2/consultas/senatran/veiculo",
          "https://api.infosimples.com/api/v2/consultas/sinesp/veiculo",
        ].join(",")
      )
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);

      const errors: string[] = [];
      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, placa: plate, timeout: 60 }),
          });
          const json = await readJson(res);
          const code = Number(json["code"] ?? 200);
          // 200 = sucesso; 6xx = sucesso parcial/sem dados; demais = erro.
          if (code !== 200) {
            throw new Error(`code ${code}: ${String(json["code_message"] ?? "erro Infosimples")}`);
          }
          const payload = Array.isArray(json["data"]) ? json["data"][0] : json["data"];
          if (payload && typeof payload === "object") {
            return payload as Record<string, unknown>;
          }
          throw new Error("resposta sem dados");
        } catch (error) {
          errors.push(`${endpoint}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      throw new Error(errors.join(" | "));
    },
  },
  {
    slug: "consultasprime",
    priority: 30,
    isConfigured: () => Boolean(process.env["CONSULTASPRIME_TOKEN"]),
    fetch: async (plate) => {
      const res = await fetch(
        `https://gateway.consultasprime.com.br/api/v1/veiculos/${encodeURIComponent(plate)}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${process.env["CONSULTASPRIME_TOKEN"]}`,
          },
        },
      );
      return readJson(res);
    },
  },
];

export function configuredProviders(): ProviderSlug[] {
  return providers.filter((p) => p.isConfigured()).map((p) => p.slug);
}

/** Tenta cada provedor configurado, em ordem de prioridade, com fallback. */
export async function fetchVehicleData(plate: string): Promise<ProviderResult> {
  const active = providers.filter((p) => p.isConfigured()).sort((a, b) => a.priority - b.priority);
  if (active.length === 0) throw new ProviderNotConfiguredError();

  const errors: string[] = [];
  for (const provider of active) {
    try {
      const raw = await provider.fetch(plate);
      return { provider: provider.slug, raw };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[provider:${provider.slug}] ${message}`);
      errors.push(`${provider.slug}: ${message}`);
    }
  }
  throw new ProviderFailedError(errors.join(" | "));
}
