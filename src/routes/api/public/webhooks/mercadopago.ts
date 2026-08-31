import { createFileRoute } from "@tanstack/react-router";

/**
 * Webhook do Mercado Pago. O MP envia { type: "payment", data: { id } } no body
 * ou ?type=payment&data.id=... na query. A autenticidade é garantida consultando
 * o pagamento diretamente na API do MP com o access token — notificações
 * falsificadas não passam, pois o status vem sempre do MP.
 */
export const Route = createFileRoute("/api/public/webhooks/mercadopago")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const url = new URL(request.url);
          let topic = url.searchParams.get("type") ?? url.searchParams.get("topic");
          let paymentId = url.searchParams.get("data.id") ?? url.searchParams.get("id");

          const text = await request.text();
          if (text) {
            try {
              const body = JSON.parse(text) as {
                type?: string;
                action?: string;
                data?: { id?: string | number };
              };
              topic = topic ?? body.type ?? null;
              if (body.data?.id != null) paymentId = String(body.data.id);
            } catch {
              // body não-JSON: ignora
            }
          }

          if (topic !== "payment" || !paymentId) {
            return Response.json({ ok: true, ignorado: true });
          }

          const token = process.env["MERCADOPAGO_ACCESS_TOKEN"];
          if (!token) return new Response("não configurado", { status: 500 });

          const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) return Response.json({ ok: false }, { status: 200 });
          const pay = (await res.json()) as {
            status?: string;
            external_reference?: string;
            payment_method_id?: string;
          };

          const ref = pay.external_reference;
          if (!ref) return Response.json({ ok: true, sem_referencia: true });

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          await supabaseAdmin
            .from("pagamentos")
            .update({
              status: pay.status ?? "pending",
              metodo: pay.payment_method_id ?? null,
              payment_id: String(paymentId),
              updated_at: new Date().toISOString(),
            })
            .eq("id", ref);

          return Response.json({ ok: true });
        } catch (error) {
          console.error("[webhook:mercadopago]", error);
          return Response.json({ ok: false }, { status: 200 });
        }
      },
    },
  },
});
