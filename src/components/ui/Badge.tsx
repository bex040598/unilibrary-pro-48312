import { ReactNode } from "react";
import { cn } from "../../lib/utils";

const variants = {
  slate: "bg-slate-100 text-slate-700 border-slate-200",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  yellow: "bg-amber-50 text-amber-700 border-amber-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200",
  red: "bg-rose-50 text-rose-700 border-rose-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  teal: "bg-cyan-50 text-cyan-700 border-cyan-200",
};

export function Badge({
  children,
  variant = "slate",
  className,
}: {
  children: ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
