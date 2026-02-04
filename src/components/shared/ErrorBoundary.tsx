/**
 * Error Boundary Component
 * 
 * Catches React rendering errors and displays a user-friendly fallback UI.
 * Reports errors to Sentry automatically.
 */

import { Component, ErrorInfo, ReactNode } from "react";
import { captureException, isSentryInitialized, Sentry } from "@/lib/sentry";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Bug } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  eventId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Capture to Sentry with component stack
    if (isSentryInitialized()) {
      const eventId = Sentry.captureException(error, {
        extra: {
          componentStack: errorInfo.componentStack,
        },
      });
      this.setState({ eventId: eventId || null });
    } else {
      captureException(error, { componentStack: errorInfo.componentStack });
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, eventId: null });
  };

  handleReportIssue = (): void => {
    if (isSentryInitialized() && this.state.eventId) {
      Sentry.showReportDialog({ eventId: this.state.eventId });
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex min-h-[400px] w-full items-center justify-center p-6">
          <div className="max-w-md text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <AlertTriangle className="h-10 w-10 text-destructive" />
              </div>
            </div>

            {/* Title and Message */}
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">
                Something went wrong
              </h2>
              <p className="text-muted-foreground">
                An unexpected error occurred. Our team has been notified and is
                working to fix it.
              </p>
            </div>

            {/* Error details (development only) */}
            {import.meta.env.MODE === "development" && this.state.error && (
              <div className="rounded-lg bg-muted p-4 text-left">
                <p className="text-sm font-mono text-destructive break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleReset} variant="default">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>

              {isSentryInitialized() && this.state.eventId && (
                <Button onClick={this.handleReportIssue} variant="outline">
                  <Bug className="mr-2 h-4 w-4" />
                  Report Issue
                </Button>
              )}
            </div>

            {/* Event ID for support */}
            {this.state.eventId && (
              <p className="text-xs text-muted-foreground">
                Reference: {this.state.eventId}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
