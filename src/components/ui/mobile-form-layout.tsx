import { ReactNode } from 'react';
import { Button } from './button';

interface MobileFormLayoutProps {
  children: ReactNode;
  onSubmit?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  className?: string;
}

export function MobileFormLayout({
  children,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  isLoading = false,
  className = ""
}: MobileFormLayoutProps) {
  return (
    <div className={`flex flex-col min-h-dvh ${className}`}>
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {children}
      </div>
      
      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 safe-bottom">
        <div className="flex gap-3 max-w-md mx-auto">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 tap-target"
            >
              {cancelLabel}
            </Button>
          )}
          {onSubmit && (
            <Button
              type="submit"
              onClick={onSubmit}
              disabled={isLoading}
              className="flex-1 tap-target"
            >
              {isLoading ? "Saving..." : submitLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
