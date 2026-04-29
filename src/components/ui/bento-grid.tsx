"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface BentoItem {
  title: string;
  description: string;
  icon: ReactNode;
  subtitle?: string;
  status?: string;
  tags?: string[];
  meta?: string;
  metricValue?: string;
  metricLabel?: string;
  cta?: string;
  colSpan?: number;
  hasPersistentHover?: boolean;
}

interface BentoGridProps {
  items: BentoItem[];
  className?: string;
}

function BentoGrid({ items, className }: BentoGridProps) {
  return (
    <div className={cn("mx-auto grid max-w-7xl grid-cols-1 gap-3 md:grid-cols-3", className)}>
      {items.map((item, index) => (
        <article
          key={`${item.title}-${index}`}
          className={cn(
            "group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_8px_26px_rgba(15,23,42,0.05)] transition-all duration-300",
            "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)]",
            item.colSpan === 2 ? "md:col-span-2" : "md:col-span-1",
            item.hasPersistentHover ? "shadow-[0_14px_34px_rgba(15,23,42,0.1)]" : "",
          )}
        >
          <div
            className={cn(
              "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[length:4px_4px] opacity-0 transition-opacity duration-300",
              item.hasPersistentHover ? "opacity-100" : "group-hover:opacity-100",
            )}
          />

          <div className="relative flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                {item.icon}
              </div>
              <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 backdrop-blur-sm">
                {item.status || "Active"}
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-[17px] font-medium tracking-tight text-slate-900">
                {item.title}
                {item.meta ? <span className="ml-2 text-xs font-normal text-slate-500">{item.meta}</span> : null}
              </h3>
              {item.subtitle ? (
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{item.subtitle}</p>
              ) : null}
              <p className="text-sm leading-snug text-slate-600">{item.description}</p>
            </div>

            {item.metricValue && item.metricLabel ? (
              <div className="space-y-1 border-t border-slate-200 pt-4">
                <p className="text-4xl font-semibold tracking-tight text-slate-900">{item.metricValue}</p>
                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{item.metricLabel}</p>
              </div>
            ) : null}

            <div className="mt-1 flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                {item.tags?.map((tag, tagIndex) => (
                  <span key={`${tag}-${tagIndex}`} className="rounded-md bg-slate-100 px-2 py-1 backdrop-blur-sm">
                    #{tag}
                  </span>
                ))}
              </div>
              <span className="text-xs text-slate-500 opacity-0 transition-opacity group-hover:opacity-100">
                {item.cta || "Explorer →"}
              </span>
            </div>
          </div>

          <div
            className={cn(
              "pointer-events-none absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-transparent via-slate-100/75 to-transparent opacity-0 transition-opacity duration-300",
              item.hasPersistentHover ? "opacity-100" : "group-hover:opacity-100",
            )}
          />
        </article>
      ))}
    </div>
  );
}

export { BentoGrid };
