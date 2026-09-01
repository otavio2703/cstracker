import { type ClassValue, clsx } from "clsx";
import { MAP_DISPLAY_NAMES, type GrenadeType, type GrenadeSide } from "@/types";

/**
 * Combina classes CSS condicionalmente (usando clsx).
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Formata um número com casas decimais fixas.
 * Retorna "—" se o valor for null/undefined.
 */
export function fmt(value: number | null | undefined, decimals = 2): string {
  if (value == null) return "—";
  return value.toFixed(decimals);
}

/**
 * Retorna o nome de exibição do mapa.
 * Ex: "de_mirage" → "Mirage"
 */
export function mapDisplayName(mapName: string): string {
  return MAP_DISPLAY_NAMES[mapName] ?? mapName;
}

/**
 * Formata uma data ISO para exibição local.
 * Ex: "2024-09-01T18:00:00Z" → "01/09/2024"
 */
export function formatDate(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
}

/**
 * Retorna a cor Tailwind com base no valor do K/D.
 */
export function kdColor(kd: number | null): string {
  if (kd == null) return "text-gray-400";
  if (kd >= 1.3) return "text-positive";
  if (kd >= 1.0) return "text-warning";
  return "text-negative";
}

/**
 * Retorna a cor Tailwind com base no valor do HS%.
 */
export function hsColor(hs: number | null): string {
  if (hs == null) return "text-gray-400";
  if (hs >= 50) return "text-positive";
  if (hs >= 30) return "text-warning";
  return "text-gray-300";
}

/**
 * Retorna ícone emoji para o tipo de granada.
 */
export function grenadeTypeIcon(type: GrenadeType): string {
  const icons: Record<GrenadeType, string> = {
    smoke:   "💨",
    flash:   "⚡",
    molotov: "🔥",
    he:      "💣",
  };
  return icons[type] ?? "🟢";
}

/**
 * Retorna ícone emoji para o lado.
 */
export function grenadeSideIcon(side: GrenadeSide): string {
  const icons: Record<GrenadeSide, string> = {
    ct:   "🔵",
    t:    "🟡",
    both: "⚪",
  };
  return icons[side] ?? "";
}

/**
 * Trunca texto longo com reticências.
 */
export function truncate(text: string, maxLength = 80): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}
