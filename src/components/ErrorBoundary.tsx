import React from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dataSyncService } from "@/services/DataSyncService";
import { useToast } from "@/components/ui/use-toast";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId?: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorId: Date.now().toString(),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);

    // Store error info in state
    this.setState({ errorInfo });

    // Extract component name from stack trace for better error context
    const componentMatch =
      errorInfo.componentStack?.match(/\s+at\s+([\w.]+)/)?.[1];
    const componentName = componentMatch || "unknown component";

    // Log to DataSyncService with improved context
    dataSyncService.logError(
      "React Error Boundary",
      error,
      `Component: ${componentName}`,
    );

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service in production
    if (import.meta.env.PROD) {
      this.logToExternalService(error, errorInfo);
    }

    // Report error to console with structured data for debugging
    console.group("React Error Details");
    console.error("Error:", error.message);
    console.error("Component:", componentName);
    console.error("Stack:", error.stack);
    console.error("Component Stack:", errorInfo.componentStack);
    console.groupEnd();
  }

  private logToExternalService = (error: Error, errorInfo: React.ErrorInfo) => {
    // In production, integrate with error tracking service like Sentry
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      errorId: this.state.errorId,
    };

    // TODO: Send to error tracking service
    console.error("Production error logged:", errorData);

    // For now, store in localStorage as fallback
    try {
      const existingErrors = JSON.parse(
        localStorage.getItem("app_errors") || "[]",
      );
      existingErrors.push(errorData);
      // Keep only last 10 errors
      const recentErrors = existingErrors.slice(-10);
      localStorage.setItem("app_errors", JSON.stringify(recentErrors));
    } catch (storageError) {
      console.error("Failed to store error in localStorage:", storageError);
    }
  };

  resetError = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined,
    });

    // Clear any cached data that might be causing issues
    if (typeof window !== "undefined") {
      try {
        // Clear relevant localStorage items (but preserve important user data)
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (
            key &&
            (key.includes("admin_cache") ||
              key.includes("sync_cache") ||
              key.includes("temp_") ||
              key.includes("error_") ||
              key.includes("debug_"))
          ) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));

        // Clear only temporary session storage items
        const sessionKeysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (
            key &&
            (key.includes("temp_") ||
              key.includes("cache_") ||
              key.includes("error_"))
          ) {
            sessionKeysToRemove.push(key);
          }
        }
        sessionKeysToRemove.forEach((key) => sessionStorage.removeItem(key));

        // Reset any error flags in the data sync service
        try {
          dataSyncService.clearLogs();
        } catch (syncError) {
          console.warn("Failed to clear data sync logs:", syncError);
        }

        // Log recovery attempt
        console.log(
          "Error boundary reset - cleared temporary storage and error logs",
        );
      } catch (e) {
        console.warn("Failed to clear storage:", e);
      }
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
          />
        );
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-red-900 text-xl">
                Oops! Something went wrong
              </CardTitle>
              <CardDescription className="text-base">
                We encountered an unexpected error. Our team has been notified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Error Details */}
              {this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">
                    Error Details:
                  </h4>
                  <p className="text-sm text-red-800 font-mono break-all">
                    {this.state.error.message}
                  </p>
                  {this.state.errorId && (
                    <p className="text-xs text-red-600 mt-2">
                      Error ID: {this.state.errorId}
                    </p>
                  )}
                </div>
              )}

              {/* Development Info */}
              {!import.meta.env.PROD && this.state.errorInfo && (
                <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <summary className="font-semibold text-gray-900 cursor-pointer">
                    Technical Details (Development)
                  </summary>
                  <pre className="text-xs text-gray-700 mt-2 overflow-auto max-h-40">
                    {this.state.error?.stack}
                  </pre>
                  <pre className="text-xs text-gray-600 mt-2 overflow-auto max-h-32">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.resetError}
                  className="flex-1 bg-church-burgundy hover:bg-church-burgundy/90"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
                <Button
                  onClick={() => (window.location.href = "/")}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>

              {/* Help Text */}
              <div className="text-center text-sm text-gray-500">
                <p>
                  If this problem persists, please contact support with Error
                  ID:{" "}
                  <code className="bg-gray-100 px-1 rounded">
                    {this.state.errorId}
                  </code>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
