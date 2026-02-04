/**
 * Sentry Configuration and Utilities
 * 
 * Provides error tracking, performance monitoring, and session replay.
 * Only initializes in production when VITE_SENTRY_DSN is configured.
 */

import * as Sentry from "@sentry/react";

// Environment variables
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const SENTRY_ENVIRONMENT = import.meta.env.VITE_SENTRY_ENVIRONMENT || "development";
const IS_DEVELOPMENT = import.meta.env.MODE === "development" || SENTRY_ENVIRONMENT === "development";

// Track initialization state
let isInitialized = false;

/**
 * Initialize Sentry for error tracking and performance monitoring.
 * Only runs in production when DSN is configured.
 */
export function initSentry(): void {
  // Skip if already initialized or conditions not met
  if (isInitialized) {
    console.log("[Sentry] Already initialized, skipping");
    return;
  }

  // Skip in development
  if (IS_DEVELOPMENT) {
    console.log("[Sentry] Skipping initialization in development environment");
    return;
  }

  // Skip if no DSN configured
  if (!SENTRY_DSN) {
    console.log("[Sentry] No DSN configured, skipping initialization");
    return;
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: SENTRY_ENVIRONMENT,
      
      // Integrations
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          // Mask text content for privacy
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],

      // Performance Monitoring
      tracesSampleRate: 0.1, // 10% of transactions

      // Session Replay
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% when errors occur

      // Release information (can be set at build time)
      release: import.meta.env.VITE_APP_VERSION || "1.0.0",

      // Filtering
      beforeSend(event) {
        // Filter out network errors from unreachable internal APIs
        if (event.exception?.values?.some(e => 
          e.value?.includes("ERR_CONNECTION_TIMED_OUT") ||
          e.value?.includes("net::ERR_") ||
          e.value?.includes("Failed to fetch")
        )) {
          // Still send but mark as network error
          event.tags = { ...event.tags, error_type: "network" };
        }
        return event;
      },
    });

    isInitialized = true;
    console.log(`[Sentry] Initialized for ${SENTRY_ENVIRONMENT} environment`);
  } catch (error) {
    console.error("[Sentry] Failed to initialize:", error);
  }
}

/**
 * Check if Sentry is initialized and ready
 */
export function isSentryInitialized(): boolean {
  return isInitialized;
}

/**
 * Set user context for Sentry (call after successful login)
 */
export function setSentryUser(user: {
  email?: string;
  name?: string;
  role?: string;
  department?: string;
  impersonating?: boolean;
  impersonatedBy?: { email?: string | null; name?: string | null } | null;
}): void {
  if (!isInitialized) return;

  Sentry.setUser({
    email: user.email,
    username: user.name,
  });

  // Set additional context
  Sentry.setContext("user_details", {
    role: user.role,
    department: user.department,
    impersonating: user.impersonating,
    impersonatedByEmail: user.impersonatedBy?.email,
    impersonatedByName: user.impersonatedBy?.name,
  });

  // Set impersonation tag for easy filtering
  if (user.impersonating) {
    Sentry.setTag("impersonation_active", "true");
  }
}

/**
 * Clear user context (call on logout)
 */
export function clearSentryUser(): void {
  if (!isInitialized) return;
  
  Sentry.setUser(null);
  Sentry.setContext("user_details", null);
  Sentry.setTag("impersonation_active", null);
}

/**
 * Add a breadcrumb for API requests (helps debug error context)
 */
export function addApiBreadcrumb(
  method: string,
  url: string,
  statusCode?: number,
  error?: string
): void {
  if (!isInitialized) return;

  Sentry.addBreadcrumb({
    category: "api",
    message: `${method} ${url}`,
    level: error ? "error" : statusCode && statusCode >= 400 ? "warning" : "info",
    data: {
      method,
      url,
      statusCode,
      error,
    },
  });
}

/**
 * Capture an exception with optional context
 */
export function captureException(
  error: Error | unknown,
  context?: Record<string, unknown>
): void {
  if (!isInitialized) {
    console.error("[Sentry not initialized] Error:", error);
    return;
  }

  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

/**
 * Capture a message with optional level
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info"
): void {
  if (!isInitialized) {
    console.log(`[Sentry not initialized] ${level}:`, message);
    return;
  }

  Sentry.captureMessage(message, level);
}

// Re-export Sentry for direct access if needed
export { Sentry };
