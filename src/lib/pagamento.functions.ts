import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

import { isValidPlate, normalizePlate } from "./plate";

const PRECO_CENTAVOS = 4990;

const placaSchema = z.object({ placa: z.string().trim().min(7).max(10) });

const PUBLIC_URL = "https://rei-car-insight.lovable.app";

function baseUrl(): string {
  // O Mercado Pago exige URL pública para retorno/webhook; localhost usa a publicada.
  const origin = getRequestHeader("origin") ?? getRequestHeader("referer");
  if (origin) {
    try {
      const u = new URL(origin);
      if (!u.hostname.includes("localhost") && !u.hostname.startsWith("127.")) return u.origin;
    } catch {
      // ignora e usa fallback
    }
  }
  const host = getRequestHeader("x-forwarded-host") ?? getRequestHeader("host");
  if (host && !host.includes("localhost")) return `https://${host}`;
  return PUBLIC_URL;
}

async function mpFetch(path: string, init?: RequestInit): Promise<Record<string, unknown>> {
  const token = process.env["MERCADOPAGO_ACCESS_TOKEN"];
  if (!token) throw new Error("Mercado Pago não configurado.");
  const res = await fetch(`https://api.mercadopago.com${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text();
  let json: Record<string, unknown> = {};
  try {
    json = JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error(`Resposta inválida do Mercado Pago: ${text.slice(0, 200)}`);
  }
  if (!res.ok) {
    throw new Error(`Mercado Pago HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
  return json;
}

/** Cria a cobrança no Mercado Pago e retorna a URL de checkout (PIX e cartão). */
export const criarPagamento = createServerFn({ method: "POST" })
  .inputValidator((input) => placaSchema.parse(input))
  .handler(async ({ data }) => {
    const placa = normalizePlate(data.placa);
    if (!isValidPlate(placa)) throw new Error("Placa inválida.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Vincula ao usuário logado quando houver sessão.
    let userId: string | null = null;
    const authHeader = getRequestHeader("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const { data: userData } = await supabaseAdmin.auth.getUser(authHeader.slice(7));
      userId = userData.user?.id ?? null;
    }

    const { data: row, error } = await supabaseAdmin
      .from("pagamentos")
      .insert({ placa, user_id: userId, valor_centavos: PRECO_CENTAVOS, status: "pending" })
      .select("id")
      .single();
    if (error || !row) throw new Error("Não foi possível registrar o pagamento.");

    const base = baseUrl();
    const retorno = `${base}/consulta/${placa}?pagamento=retorno`;
    const pref = await mpFetch("/checkout/preferences", {
      method: "POST",
      body: JSON.stringify({
        items: [
          {
            id: "pesquisa-completa",
            title: `Pesquisa Completa — Consulta veicular ${placa}`,
            quantity: 1,
            unit_price: PRECO_CENTAVOS / 100,
            currency_id: "BRL",
          },
        ],
        external_reference: row.id,
        back_urls: { success: retorno, pending: retorno, failure: retorno },
        auto_return: "approved",
        notification_url: `${base}/api/public/webhooks/mercadopago`,
        statement_descriptor: "PESQUISADOREI",
      }),
    });

    const preferenceId = String(pref["id"] ?? "");
    await supabaseAdmin.from("pagamentos").update({ preference_id: preferenceId }).eq("id", row.id);

    const url = (pref["init_point"] ?? pref["sandbox_init_point"]) as string | undefined;
    if (!url) throw new Error("Mercado Pago não retornou o link de pagamento.");
    return { url, pagamentoId: row.id as string };
  });

export type StatusPagamento = {
  pago: boolean;
  status: string;
  metodo: string | null;
};

/** Confere se existe pagamento aprovado para a placa (consultando o MP se pendente). */
export const verificarPagamento = createServerFn({ method: "POST" })
  .inputValidator((input) => placaSchema.parse(input))
  .handler(async ({ data }): Promise<StatusPagamento> => {
    const placa = normalizePlate(data.placa);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: rows } = await supabaseAdmin
      .from("pagamentos")
      .select("id, status, payment_id, metodo")
      .eq("placa", placa)
      .order("created_at", { ascending: false })
      .limit(5);

    const lista = rows ?? [];
    const aprovado = lista.find((p) => p.status === "approved");
    if (aprovado) return { pago: true, status: "approved", metodo: aprovado.metodo };

    // Se há pagamento pendente já processado pelo MP, reconsulta o status atual.
    for (const p of lista) {
      if (!p.payment_id) continue;
      try {
        const pay = await mpFetch(`/v1/payments/${p.payment_id}`);
        const status = String(pay["status"] ?? "pending");
        const metodo = (pay["payment_method_id"] as string | undefined) ?? null;
        await supabaseAdmin
          .from("pagamentos")
          .update({ status, metodo, updated_at: new Date().toISOString() })
          .eq("id", p.id);
        if (status === "approved") return { pago: true, status, metodo };
      } catch {
        // segue para o próximo
      }
    }
    const ultimo = lista[0];
    return { pago: false, status: ultimo?.status ?? "inexistente", metodo: ultimo?.metodo ?? null };
  });
