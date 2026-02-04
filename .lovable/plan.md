
# Sentry Observability Implementation Plan

## Overview
Implement Sentry for comprehensive error tracking, performance monitoring, and session replay to help debug production issues effectively. This integration will capture JavaScript errors, API failures, and user context automatically.

## What Sentry Will Provide
- **Automatic error capture**: Stack traces, browser info, and user context for all JavaScript errors
- **Performance monitoring**: Track slow pages, API latency, and Core Web Vitals
- **Session replay**: See what users did before an error occurred
- **User identification**: Link errors to specific users/departments for faster triage
- **Breadcrumbs**: Automatic trail of user actions leading to errors

---

## Implementation Steps

### Step 1: Install Sentry Packages

Add the required Sentry packages:
- `@sentry/react` - Core React integration
- `@sentry/vite-plugin` - Source map uploads for readable stack traces

### Step 2: Create Sentry Configuration

Create a new file `src/lib/sentry.ts` that:
- Initializes Sentry with your DSN
- Configures browser tracing for performance monitoring
- Sets up session replay integration
- Configures environment-based sampling rates (higher in production)
- Filters out development noise

### Step 3: Integrate with Application Entry Point

Update `src/main.tsx` to:
- Import and initialize Sentry before React renders
- Wrap the app in Sentry's error boundary

### Step 4: Add User Context

Update `src/contexts/AuthContext.tsx` to:
- Call `Sentry.setUser()` when a user logs in (email, department, role)
- Call `Sentry.setUser(null)` on logout
- Include impersonation context when active

### Step 5: Integrate with Error Service

Update `src/services/errorService.ts` and `src/hooks/useErrorHandler.ts` to:
- Capture API errors with `Sentry.captureException()`
- Add custom context (endpoint, status code, error code)
- Create breadcrumbs for API calls

### Step 6: Add React Error Boundary

Create `src/components/shared/ErrorBoundary.tsx`:
- Catches React rendering errors
- Displays a user-friendly fallback UI
- Automatically reports to Sentry

### Step 7: Configure Vite Plugin for Source Maps

Update `vite.config.ts` to:
- Upload source maps during production builds
- Associate releases with commits for easier debugging

### Step 8: Add Environment Variables

Add to `.env`:
- `VITE_SENTRY_DSN` - Your Sentry project DSN (public key)
- `SENTRY_AUTH_TOKEN` - For source map uploads (build-time only, not exposed)
- `VITE_SENTRY_ENVIRONMENT` - production/staging/development

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/sentry.ts` | Create | Sentry configuration and initialization |
| `src/components/shared/ErrorBoundary.tsx` | Create | React error boundary with Sentry integration |
| `src/main.tsx` | Modify | Initialize Sentry, wrap app in error boundary |
| `src/contexts/AuthContext.tsx` | Modify | Set user context on login/logout |
| `src/services/errorService.ts` | Modify | Add Sentry.captureException calls |
| `src/hooks/useErrorHandler.ts` | Modify | Report handled errors to Sentry |
| `src/lib/apiClient.ts` | Modify | Add breadcrumbs for API requests |
| `vite.config.ts` | Modify | Add Sentry Vite plugin for source maps |
| `.env` | Modify | Add Sentry configuration variables |

---

## Technical Details

### Sentry Initialization (`src/lib/sentry.ts`)

```text
┌─────────────────────────────────────────────┐
│           Sentry.init() Config              │
├─────────────────────────────────────────────┤
│ • DSN from environment variable             │
│ • browserTracingIntegration()               │
│ • replayIntegration() for session replay    │
│ • tracePropagationTargets for API URLs      │
│ • tracesSampleRate: 0.1 (10% of traffic)    │
│ • replaysSessionSampleRate: 0.1             │
│ • replaysOnErrorSampleRate: 1.0 (100%)      │
│ • environment: production/staging/dev       │
└─────────────────────────────────────────────┘
```

### User Context Flow

```text
User Logs In → AuthContext.checkAuth()
                    │
                    ▼
            Sentry.setUser({
              id: user.email,
              email: user.email,
              username: user.name,
              segment: user.department
            })
                    │
                    ▼
            Sentry.setTag('role', user.role)
            Sentry.setTag('level', user.level)
                    │
                    ▼
            If impersonating:
              Sentry.setContext('impersonation', {
                actualUser: impersonatedBy.email,
                impersonating: user.email
              })
```

### Error Capture Integration

```text
API Error Occurs
       │
       ▼
  apiClient catches error
       │
       ├──► Sentry.addBreadcrumb({
       │      category: 'api',
       │      message: 'API request failed',
       │      data: { endpoint, status }
       │    })
       │
       ▼
  useErrorHandler.handleError()
       │
       ├──► Sentry.captureException(error, {
       │      tags: { errorCode, isNetworkError },
       │      extra: { endpoint, parsedError }
       │    })
       │
       ▼
  Toast notification shown to user
```

### Error Boundary Component

The error boundary will:
1. Catch React component errors during rendering
2. Display a locale-compatible error message with "Try Again" and "Report Issue" buttons
3. Automatically submit error to Sentry with component stack
4. Show Sentry's feedback dialog when user clicks "Report Issue"

---

## Setup Requirements

After implementation, you'll need to:

1. **Create a Sentry project** at sentry.io (free tier available)
2. **Get your DSN** from Project Settings → Client Keys
3. **Add environment variables** to your deployment pipeline
4. **Get an auth token** for source map uploads (optional but recommended)

---

## Sampling Strategy

| Environment | Error Rate | Trace Rate | Session Replay |
|-------------|------------|------------|----------------|
| Production  | 100%       | 10%        | 10% normal, 100% on error |
| Staging     | 100%       | 50%        | 50% |
| Development | 0%         | 0%         | 0% (disabled) |

This ensures you capture all errors while keeping performance monitoring costs manageable.
