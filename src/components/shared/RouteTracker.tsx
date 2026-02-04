import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { addNavigationBreadcrumb, setTag } from "@/lib/sentry";

/**
 * Component that tracks route changes and reports them to Sentry as breadcrumbs.
 * Must be rendered inside a Router context.
 */
export function RouteTracker() {
  const location = useLocation();
  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    const previousPath = previousPathRef.current;

    // Track route change as breadcrumb
    if (previousPath !== null && previousPath !== currentPath) {
      addNavigationBreadcrumb(previousPath, currentPath);
    }

    // Set current page tag for filtering in Sentry
    setTag("page", location.pathname);

    // Update previous path ref
    previousPathRef.current = currentPath;
  }, [location]);

  return null;
}
