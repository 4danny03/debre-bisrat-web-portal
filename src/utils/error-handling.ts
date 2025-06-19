import { toast } from "@/components/ui/use-toast";

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
  ) {
    super(message);
    this.name = "APIError";
  }
}

export const handleAPIError = (error: unknown): APIError => {
  if (error instanceof APIError) {
    return error;
  }

  const apiError = new APIError(
    error instanceof Error ? error.message : "An unexpected error occurred",
  );

  // Log error for monitoring
  console.error("API Error:", error);

  // Show toast notification
  toast({
    title: "Error",
    description: apiError.message,
    variant: "destructive",
  });

  return apiError;
};

export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      throw handleAPIError(error);
    }
  };
};
