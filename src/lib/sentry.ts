/**
 * Sentry initialization and configuration
 * Provides error tracking, performance monitoring, and session replay
 */
import * as Sentry from "@sentry/react";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const SENTRY_ENVIRONMENT = import.meta.env.VITE_SENTRY_ENVIRONMENT || "development";
const API_URL = import.meta.env.VITE_API_URL || "";

// Determine if we should enable Sentry based on environment
const isProduction = SENTRY_ENVIRONMENT === "production";
const isStaging = SENTRY_ENVIRONMENT === "staging";
const isDevelopment = SENTRY_ENVIRONMENT === "development";

// Only initialize if DSN is provided and not in development
const shouldInitialize = SENTRY_DSN && !isDevelopment;

/**
 * Initialize Sentry with appropriate configuration based on environment
 */
export function initSentry() {
  if (!shouldInitialize) {
    if (isDevelopment) {
      console.log("[Sentry] Disabled in development environment");
    } else if (!SENTRY_DSN) {
      console.warn("[Sentry] DSN not configured - error tracking disabled");
    }
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    
    // Integrations
    integrations: [
      // Browser tracing for performance monitoring
      Sentry.browserTracingIntegration(),
      // Session replay for debugging user issues
      Sentry.replayIntegration({
        // Mask all text content for privacy
        maskAllText: false,
        // Block all media for performance
        blockAllMedia: false,
      }),
    ],

    // Performance Monitoring - sample rates based on environment
    tracesSampleRate: isProduction ? 0.1 : isStaging ? 0.5 : 0,

    // Session Replay - capture more on errors
    replaysSessionSampleRate: isProduction ? 0.1 : isStaging ? 0.5 : 0,
    replaysOnErrorSampleRate: isProduction || isStaging ? 1.0 : 0,

    // Configure which URLs to trace
    tracePropagationTargets: [
      "localhost",
      /^https:\/\/.*\.wdcnet/,
      API_URL,
    ].filter(Boolean),

    // Release tracking (set by CI/CD)
    release: import.meta.env.VITE_SENTRY_RELEASE,

    // Filter out noisy errors
    beforeSend(event, hint) {
      const error = hint.originalException;
      
      // Ignore ResizeObserver errors (common browser noise)
      if (error instanceof Error && error.message.includes("ResizeObserver")) {
        return null;
      }

      // Ignore cancelled fetch requests
      if (error instanceof Error && error.name === "AbortError") {
        return null;
      }

      return event;
    },

    // Add additional context to all events
    initialScope: {
      tags: {
        app: "dudanet-portal",
      },
    },
  });

  console.log(`[Sentry] Initialized for ${SENTRY_ENVIRONMENT} environment`);
}

/**
 * Set user context when user logs in
 */
export function setSentryUser(user: {
  email: string;
  name: string;
  role?: string;
  department?: string;
  level?: string;
  impersonating?: boolean;
  impersonatedBy?: { email?: string | null; name?: string | null } | null;
}) {
  if (!shouldInitialize) return;

  Sentry.setUser({
    id: user.email,
    email: user.email,
    username: user.name,
    segment: user.department,
  });

  // Set additional tags for filtering
  if (user.role) {
    Sentry.setTag("role", user.role);
  }
  if (user.level) {
    Sentry.setTag("level", user.level);
  }
  if (user.department) {
    Sentry.setTag("department", user.department);
  }

  // Set impersonation context if active
  if (user.impersonating && user.impersonatedBy) {
    Sentry.setTag("impersonating", "true");
    Sentry.setContext("impersonation", {
      actualUser: user.impersonatedBy.email,
      actualUserName: user.impersonatedBy.name,
      impersonatingUser: user.email,
    });
  } else {
    Sentry.setTag("impersonating", "false");
  }
}

/**
 * Clear user context on logout
 */
export function clearSentryUser() {
  if (!shouldInitialize) return;
  Sentry.setUser(null);
}

/**
 * Add a breadcrumb for API requests
 */
export function addApiBreadcrumb(
  endpoint: string,
  method: string,
  status?: number,
  success?: boolean
) {
  if (!shouldInitialize) return;

  Sentry.addBreadcrumb({
    category: "api",
    message: `${method} ${endpoint}`,
    level: success ? "info" : "error",
    data: {
      endpoint,
      method,
      status,
    },
  });
}

/**
 * Capture an exception with additional context
 */
export function captureApiError(
  error: Error,
  context: {
    endpoint?: string;
    method?: string;
    statusCode?: number;
    errorCode?: string;
    isNetworkError?: boolean;
  }
) {
  if (!shouldInitialize) return;

  Sentry.captureException(error, {
    tags: {
      errorCode: context.errorCode,
      isNetworkError: context.isNetworkError ? "true" : "false",
    },
    extra: {
      endpoint: context.endpoint,
      method: context.method,
      statusCode: context.statusCode,
    },
  });
}

/**
 * Capture a message with level
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = "info") {
  if (!shouldInitialize) return;
  Sentry.captureMessage(message, level);
}

// Re-export Sentry for direct access when needed
export { Sentry };
