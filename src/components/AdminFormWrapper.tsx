import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AdminFormWrapperProps {
  children: React.ReactNode;
  onSubmit: (formData: FormData) => Promise<void>;
  submitText?: string;
  successMessage?: string;
  className?: string;
  disabled?: boolean;
  formId?: string;
  ariaLabel?: string;
}

export default function AdminFormWrapper({
  children,
  onSubmit,
  submitText = "Save Changes",
  successMessage = "Changes saved successfully",
  className = "",
  disabled = false,
  formId,
  ariaLabel,
}: AdminFormWrapperProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const errorRef = React.useRef<HTMLDivElement>(null);
  const successRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
    } else if (success && successRef.current) {
      successRef.current.focus();
    }
  }, [error, success]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData(e.currentTarget);
      await onSubmit(formData);
      setSuccess(true);
      toast({
        title: "Success",
        description: successMessage,
      });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      id={formId}
      aria-label={ariaLabel || 'Admin form'}
      onSubmit={handleSubmit}
      className={`space-y-6 ${className}`}
      role="form"
      tabIndex={-1}
    >
      {children}

      {error && (
        <Alert
          variant="destructive"
          role="alert"
          tabIndex={-1}
          ref={errorRef}
          aria-live="assertive"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert
          className="border-green-200 bg-green-50"
          role="status"
          tabIndex={-1}
          ref={successRef}
          aria-live="polite"
        >
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
        <Button
          type="submit"
          disabled={loading || disabled}
          className="bg-church-burgundy hover:bg-church-burgundy/90"
          aria-label={submitText}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            submitText
          )}
        </Button>
      </div>
    </form>
  );
}
