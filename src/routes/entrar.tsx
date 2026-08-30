import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/site/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar — Pesquisa do Rei 👑" },
      {
        name: "description",
        content: "Acesse sua conta para ver o histórico de consultas veiculares e baixar seus relatórios.",
      },
      { property: "og:title", content: "Entrar — Pesquisa do Rei" },
      { property: "og:description", content: "Acesse seu histórico de consultas veiculares." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EntrarPage,
});

function EntrarPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        toast.success("Bem-vindo de volta 👑");
        navigate({ to: "/minhas-consultas" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: {
            data: { nome },
            emailRedirectTo: `${window.location.origin}/minhas-consultas`,
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu e-mail para confirmar.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível continuar.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Não foi possível entrar com o Google.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/minhas-consultas" });
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-md px-4 py-20">
        <div className="panel p-8">
          <p className="text-xs tracking-[0.25em] text-gold uppercase">Área do cliente</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold uppercase">
            {mode === "login" ? "Entrar" : "Criar conta"}
          </h1>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                maxLength={100}
                className="w-full rounded-lg border border-border bg-deep px-4 py-3 text-sm outline-none focus:border-primary"
              />
            )}
            <div className="relative">
              <Mail className="absolute top-3.5 left-3 size-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                maxLength={255}
                className="w-full rounded-lg border border-border bg-deep py-3 pr-4 pl-10 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="relative">
              <Lock className="absolute top-3.5 left-3 size-4 text-muted-foreground" />
              <input
                type="password"
                required
                minLength={6}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Sua senha"
                className="w-full rounded-lg border border-border bg-deep py-3 pr-4 pl-10 text-sm outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-neon px-5 py-3.5 text-sm font-bold tracking-wide text-neon-foreground uppercase shadow-glow disabled:opacity-60"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <button
            onClick={handleGoogle}
            className="mt-3 w-full rounded-lg border border-border px-5 py-3.5 text-sm font-semibold transition-colors hover:border-primary"
          >
            Continuar com Google
          </button>

          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="mt-6 w-full text-center text-xs text-muted-foreground hover:text-foreground"
          >
            {mode === "login" ? "Não tem conta? Criar agora" : "Já tem conta? Entrar"}
          </button>
        </div>
      </div>
    </PageShell>
  );
}
