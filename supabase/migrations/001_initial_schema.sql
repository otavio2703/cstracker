-- ============================================================
-- CSTracker — Schema Inicial
-- Execute no SQL Editor do Supabase
-- ============================================================

-- ============================================================
-- Tabela: matches
-- Armazena estatísticas de cada partida processada
-- ============================================================
CREATE TABLE IF NOT EXISTS public.matches (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id        TEXT        NOT NULL UNIQUE,        -- identificador único da demo (nome/hash)
  map_name        TEXT        NOT NULL,               -- ex: "de_mirage"
  played_at       TIMESTAMPTZ NOT NULL,               -- data/hora da partida (extraída da demo)
  rounds_played   INTEGER     NOT NULL DEFAULT 0,     -- total de rounds jogados
  kills           INTEGER     NOT NULL DEFAULT 0,
  deaths          INTEGER     NOT NULL DEFAULT 0,
  assists         INTEGER     NOT NULL DEFAULT 0,
  damage          INTEGER     NOT NULL DEFAULT 0,     -- dano total causado
  headshots       INTEGER     NOT NULL DEFAULT 0,     -- kills por headshot
  kd_ratio        NUMERIC(6,3),                       -- kills / max(deaths, 1)
  adr             NUMERIC(8,3),                       -- damage / rounds_played
  hs_percentage   NUMERIC(6,2),                       -- headshots / max(kills,1) * 100
  avg_ttd_sec     NUMERIC(8,4),                       -- null se dados insuficientes
  -- Campos preparados para versões futuras (V2)
  kast            NUMERIC(6,2),                       -- % rounds K/A/S/T — null por ora
  rating          NUMERIC(6,3),                       -- rating HLTV-style — null por ora
  first_kills     INTEGER,
  first_deaths    INTEGER,
  utility_damage  INTEGER,
  flashes_thrown  INTEGER,
  -- Dados brutos em JSON para não perder informações da demo
  raw_data        JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para queries comuns
CREATE INDEX IF NOT EXISTS idx_matches_played_at ON public.matches (played_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_map_name  ON public.matches (map_name);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON public.matches (created_at DESC);

-- Comentários nas colunas
COMMENT ON TABLE public.matches IS 'Estatísticas de partidas processadas pelo analisador Python/AWPy';
COMMENT ON COLUMN public.matches.match_id IS 'Identificador derivado do nome do arquivo .dem';
COMMENT ON COLUMN public.matches.avg_ttd_sec IS 'Tempo médio entre último dano recebido e morte. NULL se dados insuficientes.';
COMMENT ON COLUMN public.matches.raw_data IS 'JSON com dados brutos da demo para futuras métricas sem reprocessamento.';

-- ============================================================
-- Tabela: grenades
-- Biblioteca de granadas por mapa
-- ============================================================
CREATE TABLE IF NOT EXISTS public.grenades (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  map_name       TEXT        NOT NULL,               -- ex: "mirage", "inferno"
  name           TEXT        NOT NULL,               -- ex: "Smoke CT A Site"
  type           TEXT        NOT NULL CHECK (type IN ('smoke', 'flash', 'molotov', 'he')),
  side           TEXT        NOT NULL CHECK (side IN ('ct', 't', 'both')),
  throw_location TEXT        NOT NULL,               -- ex: "Tetris"
  destination    TEXT        NOT NULL,               -- ex: "CT Spawn"
  description    TEXT,                               -- como alinhar / quando usar
  video_url      TEXT,                               -- URL do YouTube ou similar
  image_url      TEXT,                               -- URL do GIF/imagem de alinhamento
  notes          TEXT,                               -- observações opcionais
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para filtros da UI
CREATE INDEX IF NOT EXISTS idx_grenades_map_name ON public.grenades (map_name);
CREATE INDEX IF NOT EXISTS idx_grenades_type     ON public.grenades (type);
CREATE INDEX IF NOT EXISTS idx_grenades_side     ON public.grenades (side);
-- Índice composto para o filtro mais comum (mapa + tipo + lado)
CREATE INDEX IF NOT EXISTS idx_grenades_map_type_side ON public.grenades (map_name, type, side);

COMMENT ON TABLE public.grenades IS 'Biblioteca de granadas por mapa para consulta rápida durante aquecimento';
COMMENT ON COLUMN public.grenades.map_name IS 'Nome curto do mapa: mirage, inferno, dust2, ancient, nuke, anubis, overpass';
COMMENT ON COLUMN public.grenades.type IS 'Tipo: smoke | flash | molotov | he';
COMMENT ON COLUMN public.grenades.side IS 'Lado: ct | t | both';

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Habilitar RLS nas duas tabelas
ALTER TABLE public.matches  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grenades ENABLE ROW LEVEL SECURITY;

-- matches: leitura pública (sem PII), escrita apenas via service role
CREATE POLICY "matches_read_public"
  ON public.matches FOR SELECT
  USING (true);

-- grenades: leitura pública, escrita apenas via service role
CREATE POLICY "grenades_read_public"
  ON public.grenades FOR SELECT
  USING (true);

-- NOTA: INSERT/UPDATE/DELETE são feitos exclusivamente via SUPABASE_SERVICE_ROLE_KEY
-- no backend Python/GitHub Actions. A anon key do frontend NUNCA terá permissão de escrita.
-- Policies de escrita não são necessárias pois a service role bypassa RLS por padrão.
