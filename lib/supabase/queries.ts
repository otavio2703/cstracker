import { supabase } from "./client";
import type { Match, Grenade, AggregatedStats } from "@/types";

// ============================================================
// Queries de Matches
// ============================================================

/**
 * Busca as partidas mais recentes.
 * @param limit Número máximo de partidas retornadas (padrão: 20)
 */
export async function getRecentMatches(limit = 20): Promise<Match[]> {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .order("played_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getRecentMatches] Erro:", error.message);
    return [];
  }

  return (data as Match[]) ?? [];
}

/**
 * Busca uma partida pelo ID.
 */
export async function getMatchById(id: string): Promise<Match | null> {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[getMatchById] Erro:", error.message);
    return null;
  }

  return data as Match;
}

/**
 * Calcula estatísticas agregadas de todas as partidas.
 * Feito no cliente para manter simplicidade no MVP.
 * Em V2, pode ser feito via Supabase RPC/views para performance.
 */
export async function getAggregatedStats(): Promise<AggregatedStats | null> {
  const { data, error } = await supabase
    .from("matches")
    .select(
      "kills, deaths, assists, damage, headshots, rounds_played, kd_ratio, adr, hs_percentage, avg_ttd_sec"
    );

  if (error) {
    console.error("[getAggregatedStats] Erro:", error.message);
    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  const totalMatches = data.length;
  const totalKills = data.reduce((s, m) => s + (m.kills ?? 0), 0);
  const totalDeaths = data.reduce((s, m) => s + (m.deaths ?? 0), 0);

  const kdValues = data.filter((m) => m.kd_ratio != null).map((m) => m.kd_ratio as number);
  const adrValues = data.filter((m) => m.adr != null).map((m) => m.adr as number);
  const hsValues = data.filter((m) => m.hs_percentage != null).map((m) => m.hs_percentage as number);
  const ttdValues = data.filter((m) => m.avg_ttd_sec != null).map((m) => m.avg_ttd_sec as number);

  const avg = (arr: number[]) =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  return {
    totalMatches,
    totalKills,
    totalDeaths,
    avgKD: parseFloat(avg(kdValues).toFixed(3)),
    avgADR: parseFloat(avg(adrValues).toFixed(1)),
    avgHSPercent: parseFloat(avg(hsValues).toFixed(1)),
    avgTTD: ttdValues.length > 0 ? parseFloat(avg(ttdValues).toFixed(3)) : null,
  };
}

// ============================================================
// Queries de Grenades
// ============================================================

/**
 * Busca granadas com filtros opcionais.
 */
export async function getGrenades(filters?: {
  map?: string;
  type?: string;
  side?: string;
}): Promise<Grenade[]> {
  let query = supabase
    .from("grenades")
    .select("*")
    .order("map_name", { ascending: true })
    .order("type", { ascending: true });

  if (filters?.map && filters.map !== "") {
    query = query.eq("map_name", filters.map);
  }
  if (filters?.type && filters.type !== "") {
    query = query.eq("type", filters.type);
  }
  if (filters?.side && filters.side !== "") {
    query = query.or(`side.eq.${filters.side},side.eq.both`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[getGrenades] Erro:", error.message);
    return [];
  }

  return (data as Grenade[]) ?? [];
}

/**
 * Retorna a lista de mapas únicos que têm granadas cadastradas.
 */
export async function getGrenadeMaps(): Promise<string[]> {
  const { data, error } = await supabase
    .from("grenades")
    .select("map_name")
    .order("map_name");

  if (error) {
    console.error("[getGrenadeMaps] Erro:", error.message);
    return [];
  }

  const unique = [...new Set((data ?? []).map((r) => r.map_name as string))];
  return unique;
}
