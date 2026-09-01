import { getMatchById } from "@/lib/supabase/queries";
import StatCard from "@/components/ui/StatCard";
import { fmt, mapDisplayName, formatDate, kdColor, hsColor } from "@/lib/utils";

// Força renderização dinâmica — os dados vêm do Supabase em runtime
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateMetadata({ params }: Props): Promise<any> {
  const { id } = await params;
  const match = await getMatchById(id);
  if (!match) return { title: "Partida não encontrada" };
  return {
    title: `${mapDisplayName(match.map_name)} — ${formatDate(match.played_at)}`,
  };
}

export const revalidate = 3600; // 1 hora

export default async function MatchDetailPage({ params }: Props) {
  const { id } = await params;
  const match = await getMatchById(id);

  if (!match) {
    const { notFound } = await import("next/navigation");
    notFound();
    return null;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              ← Dashboard
            </a>
          </div>
          <h1 className="text-2xl font-bold text-white">
            🗺️ {mapDisplayName(match.map_name)}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {formatDate(match.played_at)} · {match.rounds_played} rounds
          </p>
        </div>
      </div>

      {/* Stats principais */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
          Estatísticas da Partida
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard
            label="K/D"
            value={fmt(match.kd_ratio, 2)}
            colorClass={kdColor(match.kd_ratio)}
            icon="⚔️"
          />
          <StatCard
            label="ADR"
            value={fmt(match.adr, 1)}
            icon="💥"
          />
          <StatCard
            label="HS%"
            value={match.hs_percentage != null ? `${fmt(match.hs_percentage, 1)}%` : "—"}
            colorClass={hsColor(match.hs_percentage)}
            icon="🎯"
          />
          <StatCard
            label="TTD"
            value={match.avg_ttd_sec != null ? `${fmt(match.avg_ttd_sec, 2)}s` : "—"}
            icon="⏱️"
          />
          <StatCard
            label="Rounds"
            value={match.rounds_played}
            icon="🔄"
          />
        </div>
      </section>

      {/* Stats secundárias */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
          Detalhes
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Kills"     value={match.kills}     size="sm" icon="🔫" />
          <StatCard label="Deaths"    value={match.deaths}    size="sm" icon="💀" />
          <StatCard label="Assists"   value={match.assists}   size="sm" icon="🤝" />
          <StatCard label="Dano Total" value={match.damage}   size="sm" icon="💥" />
          <StatCard label="Headshots" value={match.headshots} size="sm" icon="🎯" />
        </div>
      </section>

      {/* Métricas V2 — indisponíveis neste MVP */}
      {(match.kast != null || match.rating != null) && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Métricas Avançadas
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {match.kast != null && (
              <StatCard label="KAST" value={`${fmt(match.kast, 1)}%`} size="sm" />
            )}
            {match.rating != null && (
              <StatCard label="Rating" value={fmt(match.rating, 2)} size="sm" />
            )}
          </div>
        </section>
      )}

      {/* Dados brutos (debug) — apenas em development */}
      {process.env.NODE_ENV === "development" && match.raw_data && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Raw Data (development only)
          </h2>
          <div className="card">
            <pre className="text-2xs text-gray-400 overflow-x-auto font-mono">
              {JSON.stringify(match.raw_data, null, 2)}
            </pre>
          </div>
        </section>
      )}
    </div>
  );
}
