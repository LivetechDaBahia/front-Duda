import React, { Component, ErrorInfo, ReactNode } from "react";
import * as Sentry from "@sentry/react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, MessageSquare } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  eventId: string | null;
}

/**
 * Error boundary component that catches React rendering errors,
 * reports them to Sentry, and displays a user-friendly fallback UI.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Report to Sentry with component stack
    const eventId = Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
      },
    });

    this.setState({ eventId });

    // Log to console in development
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, eventId: null });
    // Try to recover by reloading the current route
    window.location.reload();
  };

  handleReport = () => {
    if (this.state.eventId) {
      Sentry.showReportDialog({ eventId: this.state.eventId });
    }
  };

  render() {
    if (this.state.hasError) {
      // Allow custom fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center space-y-6">
            {/* Error Icon */}
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>

            {/* Error Title */}
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-foreground">
                Something went wrong
              </h1>
              <p className="text-muted-foreground">
                An unexpected error occurred. Our team has been notified and is
                working on a fix.
              </p>
            </div>

            {/* Error Details (only in development) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="bg-muted rounded-lg p-4 text-left">
                <p className="text-sm font-mono text-destructive break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleReset} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>

              {this.state.eventId && (
                <Button
                  variant="outline"
                  onClick={this.handleReport}
                  className="gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Report Issue
                </Button>
              )}
            </div>

            {/* Event ID for support */}
            {this.state.eventId && (
              <p className="text-xs text-muted-foreground">
                Error ID: {this.state.eventId}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
