import Link from "next/link";
import type { Match } from "@/types";
import { fmt, mapDisplayName, formatDate, kdColor, hsColor, cn } from "@/lib/utils";

interface MatchRowProps {
  match: Match;
}

export default function MatchRow({ match }: MatchRowProps) {
  const kd = match.kd_ratio;
  const hs = match.hs_percentage;

  return (
    <tr className="group cursor-pointer">
      <td className="px-3 py-2.5 border-b border-surface-700/50 group-hover:bg-surface-800/50 transition-colors">
        <span className="text-gray-300 text-sm">{formatDate(match.played_at)}</span>
      </td>
      <td className="px-3 py-2.5 border-b border-surface-700/50 group-hover:bg-surface-800/50 transition-colors">
        <Link
          href={`/matches/${match.id}`}
          className="text-brand-400 hover:text-brand-300 font-medium text-sm transition-colors"
        >
          {mapDisplayName(match.map_name)}
        </Link>
      </td>
      <td className="px-3 py-2.5 border-b border-surface-700/50 group-hover:bg-surface-800/50 transition-colors text-right">
        <span className={cn("font-mono font-semibold text-sm", kdColor(kd))}>
          {fmt(kd, 2)}
        </span>
      </td>
      <td className="px-3 py-2.5 border-b border-surface-700/50 group-hover:bg-surface-800/50 transition-colors text-right">
        <span className="font-mono text-sm text-gray-200">{fmt(match.adr, 1)}</span>
      </td>
      <td className="px-3 py-2.5 border-b border-surface-700/50 group-hover:bg-surface-800/50 transition-colors text-right">
        <span className="font-mono text-sm text-gray-200">{match.kills}</span>
      </td>
      <td className="px-3 py-2.5 border-b border-surface-700/50 group-hover:bg-surface-800/50 transition-colors text-right">
        <span className="font-mono text-sm text-gray-200">{match.deaths}</span>
      </td>
      <td className="px-3 py-2.5 border-b border-surface-700/50 group-hover:bg-surface-800/50 transition-colors text-right">
        <span className={cn("font-mono text-sm", hsColor(hs))}>
          {fmt(hs, 1)}%
        </span>
      </td>
    </tr>
  );
}

/**
 * Skeleton row para loading
 */
export function MatchRowSkeleton() {
  return (
    <tr>
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-3 py-2.5 border-b border-surface-700/50">
          <div className="skeleton h-4 rounded w-full" />
        </td>
      ))}
    </tr>
  );
}
