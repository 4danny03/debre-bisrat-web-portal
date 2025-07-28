import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  fullScreen?: boolean;
  ariaLabel?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  size = "md",
  className,
  fullScreen = false,
  ariaLabel,
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const containerClasses = fullScreen
    ? "fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
    : "flex items-center justify-center p-8";

  return (
    <div
      className={cn(containerClasses, className)}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel || message}
    >
      <div className="flex flex-col items-center space-y-4">
        <Loader2
          className={cn("animate-spin text-church-burgundy", sizeClasses[size])}
          aria-hidden="true"
        />
        {message && (
          <p className="text-gray-600 text-sm font-medium animate-pulse" aria-live="polite">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingState;
