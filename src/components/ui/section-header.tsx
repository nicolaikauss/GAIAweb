import * as React from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({ title, subtitle, className }: SectionHeaderProps) {
  return (
    <div className={`mb-4 ${className || ''}`}>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      {subtitle ? (
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
      ) : null}
    </div>
  );
}
