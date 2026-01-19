import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  caption?: string;
  icon?: LucideIcon;
  tone?: "default" | "success" | "danger" | "warning";
}

const toneMap: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-slate-900 text-white",
  success: "bg-emerald-600 text-emerald-50",
  danger: "bg-rose-600 text-rose-50",
  warning: "bg-amber-500 text-amber-50",
};

export const StatCard = ({ title, value, change, caption, icon: Icon, tone = "default" }: StatCardProps) => {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 transition-all hover:border-slate-200 hover:shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{title}</span>
          {Icon ? <Icon className="h-4 w-4 text-slate-400" /> : null}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-light text-slate-900">{value}</span>
        </div>
        {(change || caption) && (
          <div className="flex items-center gap-2 text-xs">
            {change ? (
              <span className={cn(
                "font-medium",
                tone === "success" ? "text-emerald-600" :
                tone === "danger" ? "text-rose-600" :
                tone === "warning" ? "text-amber-600" : "text-slate-600"
              )}>
                {change}
              </span>
            ) : null}
            {caption ? <span className="text-slate-400">{caption}</span> : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
