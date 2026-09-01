"use client";

import { useEffect, useState, useCallback } from "react";
import type { Grenade, GrenadeType, GrenadeSide } from "@/types";
import { getGrenades, getGrenadeMaps } from "@/lib/supabase/queries";
import GrenadeCard, { GrenadeCardSkeleton } from "@/components/ui/GrenadeCard";
import EmptyState from "@/components/ui/EmptyState";
import AdBanner from "@/components/monetization/AdBanner";
import { cn, mapDisplayName, grenadeTypeIcon } from "@/lib/utils";

const GRENADE_TYPES: { value: GrenadeType | ""; label: string; icon: string }[] = [
  { value: "",        label: "Todos",   icon: "🟢" },
  { value: "smoke",   label: "Smoke",   icon: "💨" },
  { value: "flash",   label: "Flash",   icon: "⚡" },
  { value: "molotov", label: "Molotov", icon: "🔥" },
  { value: "he",      label: "HE",      icon: "💣" },
];

const GRENADE_SIDES: { value: GrenadeSide | ""; label: string }[] = [
  { value: "",     label: "Ambos os lados" },
  { value: "ct",   label: "CT" },
  { value: "t",    label: "T" },
  { value: "both", label: "Universal" },
];

export default function GrenadesPage() {
  const [maps, setMaps] = useState<string[]>([]);
  const [grenades, setGrenades] = useState<Grenade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedMap,  setSelectedMap]  = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedSide, setSelectedSide] = useState<string>("");

  // Carrega mapas disponíveis
  useEffect(() => {
    getGrenadeMaps().then(setMaps);
  }, []);

  // Carrega granadas quando filtros mudam
  const loadGrenades = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGrenades({
        map:  selectedMap,
        type: selectedType,
        side: selectedSide,
      });
      setGrenades(data);
    } catch (err) {
      setError("Erro ao carregar granadas. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedMap, selectedType, selectedSide]);

  useEffect(() => {
    loadGrenades();
  }, [loadGrenades]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">💨 Granadas</h1>
        <p className="text-sm text-gray-400">
          Biblioteca de granadas por mapa — consulta rápida para o aquecimento
        </p>
      </div>

      {/* Filtros */}
      <div className="card space-y-4">
        {/* Filtro de Mapa */}
        <div>
          <p className="text-2xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Mapa
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedMap("")}
              className={cn(
                selectedMap === "" ? "filter-chip-active" : "filter-chip-inactive"
              )}
            >
              Todos
            </button>
            {maps.map((map) => (
              <button
                key={map}
                onClick={() => setSelectedMap(map)}
                className={cn(
                  selectedMap === map ? "filter-chip-active" : "filter-chip-inactive"
                )}
              >
                {mapDisplayName(map)}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro de Tipo */}
        <div>
          <p className="text-2xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Tipo
          </p>
          <div className="flex flex-wrap gap-2">
            {GRENADE_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setSelectedType(t.value)}
                className={cn(
                  selectedType === t.value ? "filter-chip-active" : "filter-chip-inactive"
                )}
              >
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro de Lado */}
        <div>
          <p className="text-2xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Lado
          </p>
          <div className="flex flex-wrap gap-2">
            {GRENADE_SIDES.map((s) => (
              <button
                key={s.value}
                onClick={() => setSelectedSide(s.value)}
                className={cn(
                  selectedSide === s.value ? "filter-chip-active" : "filter-chip-inactive"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ad Banner */}
      <AdBanner
        slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_GRENADES}
        format="auto"
        className="min-h-[60px]"
      />

      {/* Contador de resultados */}
      {!loading && !error && (
        <p className="text-xs text-gray-500">
          {grenades.length === 0
            ? "Nenhuma granada encontrada para esses filtros."
            : `${grenades.length} granada${grenades.length !== 1 ? "s" : ""} encontrada${grenades.length !== 1 ? "s" : ""}`}
        </p>
      )}

      {/* Erro */}
      {error && (
        <div className="card border-red-800/50 bg-red-900/10">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={loadGrenades}
            className="btn-secondary text-xs mt-2"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Grid de Granadas */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(9)].map((_, i) => (
            <GrenadeCardSkeleton key={i} />
          ))}
        </div>
      ) : grenades.length === 0 && !error ? (
        <EmptyState
          icon="💨"
          title="Nenhuma granada encontrada"
          description={
            selectedMap || selectedType || selectedSide
              ? "Tente outros filtros ou adicione granadas ao banco de dados."
              : "Adicione granadas ao banco via supabase/seed.sql ou diretamente no Supabase."
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {grenades.map((grenade) => (
            <GrenadeCard key={grenade.id} grenade={grenade} />
          ))}
        </div>
      )}
    </div>
  );
}
