import React from "react";
import { AlertTriangle, RefreshCw, Home, Bug, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface AdminErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId?: string;
  isRetrying: boolean;
  connectionStatus: "checking" | "connected" | "disconnected";
}

interface AdminErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class AdminErrorBoundary extends React.Component<
  AdminErrorBoundaryProps,
  AdminErrorBoundaryState
> {
  private retryTimeoutId?: NodeJS.Timeout;

  constructor(props: AdminErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      isRetrying: false,
      connectionStatus: "checking",
    };
  }

  static getDerivedStateFromError(
    error: Error,
  ): Partial<AdminErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: Date.now().toString(),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Admin Error Boundary caught error:", error, errorInfo);

    this.setState({ errorInfo });

    // Check database connection
    this.checkConnection();

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error details
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      errorId: this.state.errorId,
    };

    console.error("Admin error details:", errorData);

    // Store in localStorage for debugging
    try {
      const existingErrors = JSON.parse(
        localStorage.getItem("admin_errors") || "[]",
      );
      existingErrors.unshift(errorData);
      const recentErrors = existingErrors.slice(0, 5);
      localStorage.setItem("admin_errors", JSON.stringify(recentErrors));
    } catch (storageError) {
      console.error("Failed to store admin error:", storageError);
    }
  }

  checkConnection = async () => {
    this.setState({ connectionStatus: "checking" });
    try {
      const { error } = await supabase
        .from("profiles")
        .select("count")
        .limit(1);

      if (error) {
        throw error;
      }

      this.setState({ connectionStatus: "connected" });
    } catch (error) {
      console.error("Database connection check failed:", error);
      this.setState({ connectionStatus: "disconnected" });
    }
  };

  resetError = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined,
      isRetrying: false,
    });

    // Clear problematic cache data
    if (typeof window !== "undefined") {
      try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (
            key &&
            (key.includes("admin_cache") || key.includes("sync_cache"))
          ) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));
      } catch (e) {
        console.warn("Failed to clear cache:", e);
      }
    }
  };

  retryWithDelay = () => {
    this.setState({ isRetrying: true });

    this.retryTimeoutId = setTimeout(() => {
      this.resetError();
    }, 2000);
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }


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

      // Accessibility: focus error card on mount
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-3xl" role="alertdialog" aria-modal="true" aria-labelledby="admin-error-title" aria-describedby="admin-error-desc" tabIndex={-1} ref={el => el && el.focus && el.focus()}>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4" aria-hidden="true">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle id="admin-error-title" className="text-red-900 text-xl">
                Admin System Error
              </CardTitle>
              <CardDescription id="admin-error-desc" className="text-base">
                The admin panel encountered an error. Don't worry - your data is safe.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Connection Status */}
              <Alert role="status" aria-live="polite">
                <Database className="h-4 w-4" />
                <AlertDescription>
                  Database Status:
                  <span
                    className={`ml-2 font-semibold ${
                      this.state.connectionStatus === "connected"
                        ? "text-green-600"
                        : this.state.connectionStatus === "disconnected"
                          ? "text-red-600"
                          : "text-yellow-600"
                    }`}
                  >
                    {this.state.connectionStatus === "connected"
                      ? "Connected"
                      : this.state.connectionStatus === "disconnected"
                        ? "Disconnected"
                        : "Checking..."}
                  </span>
                </AlertDescription>
              </Alert>

              {/* Error Details */}
              {this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="region" aria-label="Error details">
                  <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                    <Bug className="w-4 h-4 mr-2" />
                    Error Details:
                  </h4>
                  <p className="text-sm text-red-800 font-mono break-all mb-2">
                    {this.state.error.message}
                  </p>
                  {this.state.errorId && (
                    <p className="text-xs text-red-600">
                      Error ID: {this.state.errorId}
                    </p>
                  )}
                </div>
              )}

              {/* Troubleshooting Steps */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" role="region" aria-label="Troubleshooting steps">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Troubleshooting Steps:
                </h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Try refreshing the page</li>
                  <li>Check your internet connection</li>
                  <li>Clear browser cache and cookies</li>
                  <li>If the problem persists, contact support</li>
                </ol>
              </div>

              {/* Development Info */}
              {!import.meta.env.PROD && this.state.errorInfo && (
                <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <summary className="font-semibold text-gray-900 cursor-pointer">
                    Technical Details (Development)
                  </summary>
                  <pre className="text-xs text-gray-700 mt-2 overflow-auto max-h-40 whitespace-pre-wrap">
                    {this.state.error?.stack}
                  </pre>
                  <pre className="text-xs text-gray-600 mt-2 overflow-auto max-h-32 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.retryWithDelay}
                  disabled={this.state.isRetrying}
                  className="flex-1 bg-church-burgundy hover:bg-church-burgundy/90"
                  aria-label="Retry error recovery"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${this.state.isRetrying ? "animate-spin" : ""}`}
                  />
                  {this.state.isRetrying ? "Retrying..." : "Retry"}
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="flex-1"
                  aria-label="Refresh page"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
                <Button
                  onClick={() => (window.location.href = "/admin/dashboard")}
                  variant="outline"
                  className="flex-1"
                  aria-label="Go to dashboard"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </div>

              {/* Help Text */}
              <div className="text-center text-sm text-gray-500">
                <p>
                  If this problem persists, please contact support with Error
                  ID: <code className="bg-gray-100 px-1 rounded font-mono">{this.state.errorId}</code>
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

export default AdminErrorBoundary;
