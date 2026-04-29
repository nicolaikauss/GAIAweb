import { cn } from "@/lib/utils";

interface AILogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function AILogo({ className, size = "md" }: AILogoProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="ai-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        
        {/* AI Text */}
        <text
          x="12"
          y="16"
          textAnchor="middle"
          fontSize="10"
          fontWeight="bold"
          fill="url(#ai-gradient)"
        >
          AI
        </text>
      </svg>
    </div>
  );
}
