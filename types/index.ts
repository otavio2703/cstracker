// ============================================================
// CSTracker — Tipos globais
// ============================================================

export interface Match {
  id: string;
  match_id: string;
  map_name: string;
  played_at: string;
  rounds_played: number;
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  headshots: number;
  kd_ratio: number | null;
  adr: number | null;
  hs_percentage: number | null;
  avg_ttd_sec: number | null;
  // V2 — null por ora
  kast: number | null;
  rating: number | null;
  first_kills: number | null;
  first_deaths: number | null;
  utility_damage: number | null;
  flashes_thrown: number | null;
  raw_data: Record<string, unknown> | null;
  created_at: string;
}

export interface Grenade {
  id: string;
  map_name: string;
  name: string;
  type: GrenadeType;
  side: GrenadeSide;
  throw_location: string;
  destination: string;
  description: string | null;
  video_url: string | null;
  image_url: string | null;
  notes: string | null;
  created_at: string;
}

export type GrenadeType = "smoke" | "flash" | "molotov" | "he";
export type GrenadeSide = "ct" | "t" | "both";

// ── Filtros de UI ────────────────────────────────────────────

export interface GrenadeFilters {
  map: string;    // "" = todos
  type: string;   // "" = todos
  side: string;   // "" = todos
}

// ── Stats resumidas (dashboard) ──────────────────────────────

export interface AggregatedStats {
  totalMatches: number;
  totalKills: number;
  totalDeaths: number;
  avgKD: number;
  avgADR: number;
  avgHSPercent: number;
  avgTTD: number | null;
}

// ── Utilitários de mapa ──────────────────────────────────────

export const MAP_DISPLAY_NAMES: Record<string, string> = {
  de_mirage:   "Mirage",
  de_inferno:  "Inferno",
  de_dust2:    "Dust2",
  de_ancient:  "Ancient",
  de_nuke:     "Nuke",
  de_anubis:   "Anubis",
  de_overpass: "Overpass",
  de_vertigo:  "Vertigo",
  de_train:    "Train",
  mirage:      "Mirage",
  inferno:     "Inferno",
  dust2:       "Dust2",
  ancient:     "Ancient",
  nuke:        "Nuke",
  anubis:      "Anubis",
  overpass:    "Overpass",
  vertigo:     "Vertigo",
};

export const GRENADE_TYPE_LABELS: Record<GrenadeType, string> = {
  smoke:   "Smoke",
  flash:   "Flash",
  molotov: "Molotov",
  he:      "HE",
};

export const GRENADE_SIDE_LABELS: Record<GrenadeSide, string> = {
  ct:   "CT",
  t:    "T",
  both: "Ambos",
};

// ── Config de monetização ────────────────────────────────────

export interface PixConfig {
  enabled: boolean;
  pixKey?: string;
  qrCodeUrl?: string;
  paymentUrl?: string;
}

export interface AdConfig {
  enabled: boolean;
  publisherId?: string;  // ca-pub-XXXXXXXXXXXXXXXX — configure após aprovação AdSense
}
