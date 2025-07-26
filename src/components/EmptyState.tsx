import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  ariaLabel?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className,
  ariaLabel,
}) => {
  return (
    <Card className={cn("border-dashed", className)} role="region" aria-label={ariaLabel || title}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4" aria-hidden="true">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2" id="empty-state-title">{title}</h3>
        {description && (
          <p className="text-gray-500 mb-6 max-w-sm" aria-live="polite">{description}</p>
        )}
        {action && (
          <Button
            onClick={action.onClick}
            className="bg-church-burgundy hover:bg-church-burgundy/90"
            aria-label={action.label}
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;
