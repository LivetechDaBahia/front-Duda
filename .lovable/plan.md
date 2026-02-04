

# Sentry Observability Re-Implementation Plan

## Overview

Re-implement Sentry for comprehensive error tracking, performance monitoring, and session replay. This time, the `.env` file will **not be modified** since it's already in `.gitignore` and should not be committed.

## Key Change from Previous Implementation

Instead of modifying `.env` directly, I will:
1. Create an `.env.example` file documenting the required Sentry variables
2. You'll need to manually add the Sentry DSN to your local `.env` file

---

## Implementation Steps

### Step 1: Install Sentry Packages

Add the required dependencies:
- `@sentry/react` - Core React integration with error boundary
- `@sentry/vite-plugin` - Source map uploads for readable stack traces

### Step 2: Create `.env.example`

Create a template file showing required environment variables (without actual values):
```
# Sentry Configuration (add these to your .env)
VITE_SENTRY_DSN=
VITE_SENTRY_ENVIRONMENT=development
# SENTRY_AUTH_TOKEN= (build-time only, for source map uploads)
```

### Step 3: Create Sentry Configuration

Create `src/lib/sentry.ts` with:
- DSN-based initialization
- Environment detection (only runs in production)
- Browser tracing and session replay integrations
- Helper functions for user context and API breadcrumbs

### Step 4: Create Error Boundary Component

Create `src/components/shared/ErrorBoundary.tsx`:
- Catches React rendering errors
- Displays locale-compatible fallback UI
- Reports errors to Sentry automatically
- Includes "Try Again" and "Report Issue" buttons

### Step 5: Update Application Entry Point

Modify `src/main.tsx` to:
- Import and initialize Sentry before rendering
- Wrap app with ErrorBoundary component

### Step 6: Add User Context to Auth

Update `src/contexts/AuthContext.tsx` to:
- Set Sentry user on successful login
- Clear Sentry user on logout
- Track impersonation context

### Step 7: Integrate with Error Service

Update `src/services/errorService.ts`:
- Add Sentry.captureException in ApiError class

### Step 8: Integrate with Error Handler Hook

Update `src/hooks/useErrorHandler.ts`:
- Report handled errors to Sentry with context

### Step 9: Add API Breadcrumbs

Update `src/lib/apiClient.ts`:
- Add breadcrumbs for API requests/failures

### Step 10: Configure Vite Plugin

Update `vite.config.ts`:
- Add Sentry plugin for source map uploads (production builds only)

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `.env.example` | Create | Template for required Sentry env vars |
| `src/lib/sentry.ts` | Create | Sentry configuration and utilities |
| `src/components/shared/ErrorBoundary.tsx` | Create | React error boundary with Sentry |
| `src/main.tsx` | Modify | Initialize Sentry, wrap with ErrorBoundary |
| `src/contexts/AuthContext.tsx` | Modify | Set user context on auth changes |
| `src/services/errorService.ts` | Modify | Capture exceptions in ApiError |
| `src/hooks/useErrorHandler.ts` | Modify | Report handled errors |
| `src/lib/apiClient.ts` | Modify | Add API breadcrumbs |
| `vite.config.ts` | Modify | Add Sentry Vite plugin |
| `package.json` | Modify | Add @sentry/react and @sentry/vite-plugin |

---

## After Implementation - Manual Setup Required

You'll need to:

1. **Create a Sentry project** at sentry.io
2. **Get your DSN** from Project Settings → Client Keys
3. **Add to your local `.env`**:
   ```
   VITE_SENTRY_DSN=https://your-key@sentry.io/your-project-id
   VITE_SENTRY_ENVIRONMENT=production
   ```
4. **(Optional)** For source map uploads, set `SENTRY_AUTH_TOKEN` in your CI/CD environment

---

## Technical Details

### Sentry Initialization Logic

```text
if (VITE_SENTRY_DSN is set AND environment !== 'development') {
  → Initialize Sentry with tracing + replay
} else {
  → Skip initialization (dev mode or no DSN)
}
```

### Sampling Configuration

| Environment | Errors | Traces | Session Replay |
|-------------|--------|--------|----------------|
| Production  | 100%   | 10%    | 10% normal, 100% on error |
| Development | Skip   | Skip   | Skip |

### User Context Flow

```text
Login Success → setSentryUser({email, name, role, department})
               → Set impersonation context if applicable

Logout → clearSentryUser()
```

### Error Capture Points

1. **ApiError class** - Captures all API errors with status codes
2. **useErrorHandler hook** - Captures handled errors shown to users
3. **ErrorBoundary** - Catches React rendering crashes
4. **apiClient breadcrumbs** - Tracks API request trail for debugging

