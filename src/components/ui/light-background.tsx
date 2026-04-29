import { ReactNode } from "react";

interface LightBackgroundProps {
  children: ReactNode;
  className?: string;
}

export function LightBackground({ children, className = "" }: LightBackgroundProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 ${className}`}>
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.02)_1px,transparent_0)] bg-[length:20px_20px] opacity-40" />
      
      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
