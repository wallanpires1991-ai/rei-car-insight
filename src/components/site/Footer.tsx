import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";

export const LEGAL_DISCLAIMER =
  "As informações apresentadas são provenientes das fontes e provedores integrados disponíveis no momento da consulta. A ausência de informações em determinada fonte não representa garantia absoluta de inexistência de eventos ou ocorrências. A consulta possui caráter informativo e não substitui vistoria cautelar, avaliação mecânica ou análise documental profissional.";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-background/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            A verdade sobre o veículo, antes de fechar negócio.
          </p>
        </div>

        <div>
          <h4 className="text-xs tracking-[0.16em] text-gold uppercase">Plataforma</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>
              <Link to="/como-funciona" className="hover:text-foreground">
                Como funciona
              </Link>
            </li>
            <li>
              <Link to="/o-que-consultamos" className="hover:text-foreground">
                O que consultamos
              </Link>
            </li>
            <li>
              <Link to="/planos" className="hover:text-foreground">
                Planos
              </Link>
            </li>
            <li>
              <Link to="/lojistas" className="hover:text-foreground">
                Para lojistas
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs tracking-[0.16em] text-gold uppercase">Legal</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>
              <Link to="/legal/termos" className="hover:text-foreground">
                Termos de Uso
              </Link>
            </li>
            <li>
              <Link to="/legal/privacidade" className="hover:text-foreground">
                Política de Privacidade
              </Link>
            </li>
            <li>
              <Link to="/legal/lgpd" className="hover:text-foreground">
                LGPD
              </Link>
            </li>
            <li>
              <Link to="/legal/aviso" className="hover:text-foreground">
                Aviso Legal
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/70">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <p className="text-xs leading-relaxed text-muted-foreground/80">{LEGAL_DISCLAIMER}</p>
          <p className="mt-4 text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} Pesquisa do Rei. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
