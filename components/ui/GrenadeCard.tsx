"use client";

import { useState } from "react";
import type { Grenade } from "@/types";
import {
  cn,
  grenadeTypeIcon,
  grenadeSideIcon,
  mapDisplayName,
  truncate,
} from "@/lib/utils";

interface GrenadeCardProps {
  grenade: Grenade;
}

export default function GrenadeCard({ grenade }: GrenadeCardProps) {
  const [expanded, setExpanded] = useState(false);

  const typeBadgeClass = `badge-${grenade.type}` as string;
  const sideBadgeClass = `badge-${grenade.side}` as string;

  return (
    <div
      className={cn(
        "card cursor-pointer select-none",
        "transition-all duration-200",
        "hover:border-brand-500/40 hover:-translate-y-0.5",
        expanded && "border-brand-500/60"
      )}
      onClick={() => setExpanded((prev) => !prev)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setExpanded((prev) => !prev);
      }}
      aria-expanded={expanded}
    >
      {/* Header do card */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-medium",
                typeBadgeClass
              )}
            >
              {grenadeTypeIcon(grenade.type)} {grenade.type.toUpperCase()}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-medium",
                sideBadgeClass
              )}
            >
              {grenadeSideIcon(grenade.side)}{" "}
              {grenade.side === "both" ? "Ambos" : grenade.side.toUpperCase()}
            </span>
          </div>

          {/* Nome */}
          <h3 className="font-semibold text-sm text-gray-100 leading-tight">
            {grenade.name}
          </h3>

          {/* Localização resumida */}
          <p className="text-xs text-gray-400 mt-1">
            <span className="text-gray-500">De:</span>{" "}
            <span className="text-gray-300">{grenade.throw_location}</span>
            <span className="text-gray-600 mx-1">→</span>
            <span className="text-gray-500">Para:</span>{" "}
            <span className="text-gray-300">{grenade.destination}</span>
          </p>
        </div>

        {/* Chevron */}
        <span
          className={cn(
            "text-gray-500 text-lg transition-transform duration-200 flex-shrink-0",
            expanded && "rotate-180"
          )}
        >
          ▾
        </span>
      </div>

      {/* Conteúdo expandido */}
      {expanded && (
        <div
          className="mt-3 pt-3 border-t border-surface-700 space-y-3 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Descrição */}
          {grenade.description && (
            <p className="text-sm text-gray-300 leading-relaxed">
              {grenade.description}
            </p>
          )}

          {/* Notas */}
          {grenade.notes && (
            <p className="text-xs text-gray-500 italic">{grenade.notes}</p>
          )}

          {/* Imagem de alinhamento */}
          {grenade.image_url && (
            <div className="rounded-lg overflow-hidden border border-surface-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={grenade.image_url}
                alt={`Alinhamento: ${grenade.name}`}
                className="w-full object-cover max-h-48"
                loading="lazy"
              />
            </div>
          )}

          {/* Botão de vídeo */}
          {grenade.video_url && (
            <a
              href={grenade.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm w-full sm:w-auto"
              onClick={(e) => e.stopPropagation()}
            >
              ▶ Ver Vídeo
            </a>
          )}

          {/* Nenhuma mídia disponível */}
          {!grenade.image_url && !grenade.video_url && (
            <p className="text-xs text-gray-600 italic">
              Imagem e vídeo ainda não adicionados.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Skeleton para GrenadeCard
 */
export function GrenadeCardSkeleton() {
  return (
    <div className="card space-y-2">
      <div className="flex gap-1.5">
        <div className="skeleton h-4 w-16 rounded-full" />
        <div className="skeleton h-4 w-10 rounded-full" />
      </div>
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3 w-1/2 rounded" />
    </div>
  );
}
