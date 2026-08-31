import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isValidPlate, normalizePlate } from "./plate";
import { buildDemoReport, type VehicleReport } from "./report";

const plateSchema = z.object({ placa: z.string().trim().min(7).max(10) });

export type ConsultaResposta = {
  report: VehicleReport;
  fonte: "real" | "demo";
  provedor: string | null;
  aviso: string | null;
};

function gerarCodigo(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `PDR-${out.slice(0, 5)}-${out.slice(5)}`;
}

export const consultarPlaca = createServerFn({ method: "POST" })
  .inputValidator((input) => plateSchema.parse(input))
  .handler(async ({ data }): Promise<ConsultaResposta> => {
    const placa = normalizePlate(data.placa);
    if (!isValidPlate(placa)) throw new Error("Placa inválida.");

    const codigo = gerarCodigo();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Identifica o usuário logado (opcional) para gravar o histórico dele.
    let userId: string | null = null;
    const authHeader = getRequestHeader("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const { data: userData } = await supabaseAdmin.auth.getUser(authHeader.slice(7));
      userId = userData.user?.id ?? null;
    }

    // Exige pagamento aprovado para a placa. Administradores têm acesso livre.
    let liberado = false;
    if (userId) {
      const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });
      liberado = Boolean(isAdmin);
    }
    if (!liberado) {
      const { data: pag } = await supabaseAdmin
        .from("pagamentos")
        .select("id")
        .eq("placa", placa)
        .eq("status", "approved")
        .limit(1)
        .maybeSingle();
      if (!pag) throw new Error("PAGAMENTO_PENDENTE");
    }

    const providers = await import("./vehicle-providers.server");

    let resposta: ConsultaResposta;
    let custo = 0;

    try {
      const { provider, raw } = await providers.fetchVehicleData(placa);
      const { buildReportFromProvider } = await import("./report-mapper.server");
      resposta = {
        report: buildReportFromProvider(placa, provider, raw, codigo),
        fonte: "real",
        provedor: provider,
        aviso: null,
      };
      const { data: prov } = await supabaseAdmin
        .from("provedores")
        .select("custo_centavos")
        .eq("slug", provider)
        .maybeSingle();
      custo = prov?.custo_centavos ?? 0;
    } catch (error) {
      const isNotConfigured =
        error instanceof Error && error.message === "NENHUM_PROVEDOR_CONFIGURADO";
      const details =
        error && typeof error === "object" && "details" in error
          ? String((error as { details: unknown }).details)
          : "";
      const notEnabled = /não habilitada|nao habilitada|603/.test(details);
      resposta = {
        report: buildDemoReport(placa),
        fonte: "demo",
        provedor: null,
        aviso: isNotConfigured
          ? "Nenhum provedor de dados veiculares está configurado. Este relatório é uma DEMONSTRAÇÃO."
          : notEnabled
            ? "Token Infosimples válido, mas a consulta de veículos ainda não está habilitada na sua conta. Solicite a liberação do serviço 'senatran/veiculo' no painel da Infosimples. Enquanto isso, este relatório é uma DEMONSTRAÇÃO."
            : "Os provedores licenciados não responderam. Este relatório é uma DEMONSTRAÇÃO.",
      };
      resposta.report.code = codigo;
      if (!isNotConfigured) console.error(error);
    }

    await supabaseAdmin.from("consultas").insert({
      codigo,
      user_id: userId,
      placa,
      status: "concluida",
      fonte: resposta.fonte,
      provedor: resposta.provedor,
      custo_centavos: custo,
      relatorio: JSON.parse(JSON.stringify(resposta.report)),
      erro: resposta.aviso,
    });

    return resposta;
  });

export const minhasConsultas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("consultas")
      .select("id, codigo, placa, fonte, created_at, relatorio")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const verificarCodigo = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ codigo: z.string().trim().min(5).max(40) }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("consultas")
      .select("codigo, placa, fonte, created_at")
      .eq("codigo", data.codigo.toUpperCase())
      .maybeSingle();
    if (!row) return { valido: false as const };
    return {
      valido: true as const,
      placa: row.placa,
      fonte: row.fonte,
      emitidoEm: row.created_at,
    };
  });

export const painelAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Acesso restrito ao administrador.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const providers = await import("./vehicle-providers.server");

    const [{ data: consultas }, { data: provedores }] = await Promise.all([
      supabaseAdmin
        .from("consultas")
        .select("id, codigo, placa, fonte, provedor, custo_centavos, preco_centavos, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      supabaseAdmin.from("provedores").select("*").order("prioridade"),
    ]);

    const rows = consultas ?? [];
    return {
      consultas: rows,
      provedores: (provedores ?? []).map((p) => ({
        ...p,
        configurado: providers.configuredProviders().includes(p.slug as never),
      })),
      totais: {
        consultas: rows.length,
        reais: rows.filter((r) => r.fonte === "real").length,
        receita: rows.reduce((s, r) => s + (r.preco_centavos ?? 0), 0),
        custo: rows.reduce((s, r) => s + (r.custo_centavos ?? 0), 0),
      },
    };
  });
