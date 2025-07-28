import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
  ariaLabel?: string;
}

export default function LoadingSpinner(props: LoadingSpinnerProps) {
  const { size = "md", className, text, ariaLabel } = props;
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      className={cn("flex items-center justify-center", className)}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel || text || "Loading"}
    >
      <div className="flex items-center space-x-2">
        <Loader2
          className={cn("animate-spin text-church-burgundy", sizeClasses[size])}
          aria-hidden="true"
        />
        {text && <span className="text-gray-600" aria-live="polite">{text}</span>}
      </div>
    </div>
  );
}
