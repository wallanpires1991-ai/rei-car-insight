import { useNavigate } from "@tanstack/react-router";
import { Search, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { isValidPlate, normalizePlate } from "@/lib/plate";

export function PlateSearch({ size = "lg" }: { size?: "lg" | "sm" }) {
  const navigate = useNavigate();
  const [plate, setPlate] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const normalized = normalizePlate(plate);
    if (!isValidPlate(normalized)) {
      setError("Placa inválida. Use o formato ABC1D23 (Mercosul) ou ABC-1234 (antigo).");
      return;
    }
    setError(null);
    navigate({ to: "/consulta/$placa", params: { placa: normalized } });
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div
        className={`panel flex flex-col gap-3 p-3 sm:flex-row sm:items-center ${size === "lg" ? "sm:p-4" : ""}`}
      >
        <input
          value={plate}
          onChange={(e) => setPlate(e.target.value.toUpperCase())}
          placeholder="DIGITE A PLACA DO VEÍCULO"
          aria-label="Placa do veículo"
          maxLength={8}
          className={`w-full flex-1 rounded-lg bg-input/50 px-4 text-center font-mono tracking-[0.35em] text-foreground uppercase outline-none placeholder:tracking-[0.12em] placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring sm:text-left ${
            size === "lg" ? "py-4 text-xl sm:text-2xl" : "py-3 text-base"
          }`}
        />
        <button
          type="submit"
          className={`inline-flex items-center justify-center gap-2 rounded-lg bg-neon font-bold tracking-wide text-neon-foreground uppercase shadow-glow transition-transform hover:-translate-y-0.5 ${
            size === "lg" ? "px-7 py-4 text-base" : "px-5 py-3 text-sm"
          }`}
        >
          <Search className="size-5" />
          Consultar agora
        </button>
      </div>
      {error ? (
        <p className="mt-3 text-sm text-destructive">{error}</p>
      ) : (
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-primary" />
          Aceita placa Mercosul (ABC1D23) e modelo antigo (ABC-1234). Consulta segura e sigilosa.
        </p>
      )}
    </form>
  );
}
