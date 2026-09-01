import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  className?: string;
}

export default function EmptyState({
  icon = "📭",
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      <span className="text-5xl mb-4 opacity-50">{icon}</span>
      <h3 className="text-lg font-semibold text-gray-300 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
