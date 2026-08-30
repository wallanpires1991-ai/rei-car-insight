export type PlateFormat = "mercosul" | "antigo";

const MERCOSUL = /^[A-Z]{3}\d[A-Z]\d{2}$/;
const ANTIGO = /^[A-Z]{3}\d{4}$/;

/** Remove hífens, espaços e normaliza para caixa alta. */
export function normalizePlate(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 7);
}

export function detectFormat(plate: string): PlateFormat | null {
  const p = normalizePlate(plate);
  if (MERCOSUL.test(p)) return "mercosul";
  if (ANTIGO.test(p)) return "antigo";
  return null;
}

export function isValidPlate(plate: string): boolean {
  return detectFormat(plate) !== null;
}

/** Exibição amigável: ABC-1234 (antigo) ou ABC1D23 (Mercosul). */
export function formatPlate(plate: string): string {
  const p = normalizePlate(plate);
  if (ANTIGO.test(p)) return `${p.slice(0, 3)}-${p.slice(3)}`;
  return p;
}
