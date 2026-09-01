import type { Metadata } from "next";
import { getAggregatedStats, getRecentMatches } from "@/lib/supabase/queries";
import StatCard, { StatCardSkeleton } from "@/components/ui/StatCard";
import MatchRow, { MatchRowSkeleton } from "@/components/ui/MatchRow";
import EmptyState from "@/components/ui/EmptyState";
import AdBanner from "@/components/monetization/AdBanner";
import { fmt, kdColor, hsColor } from "@/lib/utils";
import { Suspense } from "react";

// Força renderização dinâmica — os dados vêm do Supabase em runtime
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Suas estatísticas de CS2 — K/D, ADR, Headshots e mais.",
};

// Revalidar a cada 5 minutos (dados mudam raramente)
export const revalidate = 300;

// ── Componentes assíncronos (Server Components) ──────────────

async function StatsOverview() {
  const stats = await getAggregatedStats();

  if (!stats) {
    return (
      <EmptyState
        icon="📊"
        title="Nenhuma partida analisada"
        description="Processe uma demo .dem pelo GitHub Actions para ver suas estatísticas aqui."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <StatCard
        label="K/D"
        value={fmt(stats.avgKD, 2)}
        icon="⚔️"
        colorClass={kdColor(stats.avgKD)}
        subValue="média"
      />
      <StatCard
        label="ADR"
        value={fmt(stats.avgADR, 1)}
        icon="💥"
        subValue="dano/round"
      />
      <StatCard
        label="HS%"
        value={`${fmt(stats.avgHSPercent, 1)}%`}
        icon="🎯"
        colorClass={hsColor(stats.avgHSPercent)}
        subValue="headshots"
      />
      <StatCard
        label="TTD"
        value={stats.avgTTD != null ? `${fmt(stats.avgTTD, 2)}s` : "—"}
        icon="⏱️"
        subValue={stats.avgTTD != null ? "tempo até morte" : "sem dados"}
      />
      <StatCard
        label="Partidas"
        value={stats.totalMatches}
        icon="🗂️"
        subValue="analisadas"
      />
    </div>
  );
}

async function RecentMatchesTable() {
  const matches = await getRecentMatches(15);

  if (matches.length === 0) {
    return (
      <EmptyState
        icon="🗂️"
        title="Nenhuma partida encontrada"
        description="As partidas processadas aparecerão aqui."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-surface-700">
      <table className="table-base">
        <thead>
          <tr>
            <th>Data</th>
            <th>Mapa</th>
            <th className="text-right">K/D</th>
            <th className="text-right">ADR</th>
            <th className="text-right">Kills</th>
            <th className="text-right">Deaths</th>
            <th className="text-right">HS%</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => (
            <MatchRow key={match.id} match={match} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">
          📊 Dashboard
        </h1>
        <p className="text-sm text-gray-400">
          Suas estatísticas pessoais de CS2
        </p>
      </div>

      {/* Stats Overview */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
          Resumo Geral
        </h2>
        <Suspense
          fallback={
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <StatsOverview />
        </Suspense>
      </section>

      {/* Ad Banner (lateral ou entre seções) */}
      <AdBanner
        slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_DASHBOARD}
        format="auto"
        className="min-h-[90px]"
      />

      {/* Recent Matches */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
          Partidas Recentes
        </h2>
        <Suspense
          fallback={
            <div className="overflow-x-auto rounded-xl border border-surface-700">
              <table className="table-base">
                <thead>
                  <tr>
                    {["Data", "Mapa", "K/D", "ADR", "Kills", "Deaths", "HS%"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <MatchRowSkeleton key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          }
        >
          <RecentMatchesTable />
        </Suspense>
      </section>
    </div>
  );
}
