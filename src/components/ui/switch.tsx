import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked = false, onCheckedChange, disabled = false, className, size = "md", ...props }, ref) => {
    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked);
      }
    };

    const sizeClasses = {
      sm: "h-4 w-7",
      md: "h-6 w-11", 
      lg: "h-8 w-14"
    };

    const thumbSizeClasses = {
      sm: "h-3 w-3",
      md: "h-5 w-5",
      lg: "h-7 w-7"
    };

    const translateClasses = {
      sm: checked ? "translate-x-3" : "translate-x-0.5",
      md: checked ? "translate-x-5" : "translate-x-0.5", 
      lg: checked ? "translate-x-6" : "translate-x-0.5"
    };

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "relative inline-flex items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          sizeClasses[size],
          checked ? "bg-primary" : "bg-gray-200 dark:bg-gray-700",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "inline-block rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out",
            thumbSizeClasses[size],
            translateClasses[size]
          )}
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };