import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: string;
  colorClass?: string;   // ex: "text-positive", "text-negative"
  glowClass?: string;    // ex: "shadow-glow-brand"
  size?: "sm" | "md" | "lg";
}

export default function StatCard({
  label,
  value,
  subValue,
  icon,
  colorClass = "text-white",
  glowClass,
  size = "md",
}: StatCardProps) {
  return (
    <div
      className={cn(
        "card flex flex-col gap-1",
        glowClass && "hover:" + glowClass,
        "transition-all duration-200"
      )}
    >
      {/* Label */}
      <div className="flex items-center gap-1.5 text-gray-400">
        {icon && <span className="text-sm">{icon}</span>}
        <span className={cn(
          "font-medium uppercase tracking-wider",
          size === "sm" ? "text-2xs" : "text-xs"
        )}>
          {label}
        </span>
      </div>

      {/* Valor principal */}
      <div
        className={cn(
          "font-bold font-mono leading-none",
          colorClass,
          size === "sm"  && "text-xl",
          size === "md"  && "text-3xl",
          size === "lg"  && "text-4xl",
        )}
      >
        {value}
      </div>

      {/* Sub-valor opcional */}
      {subValue && (
        <div className="text-xs text-gray-500">{subValue}</div>
      )}
    </div>
  );
}

/**
 * Skeleton para StatCard enquanto carrega
 */
export function StatCardSkeleton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <div className="card flex flex-col gap-2">
      <div className="skeleton h-3 w-20 rounded" />
      <div className={cn(
        "skeleton rounded",
        size === "sm" && "h-6 w-16",
        size === "md" && "h-9 w-24",
        size === "lg" && "h-12 w-28",
      )} />
    </div>
  );
}
