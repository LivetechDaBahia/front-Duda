import {
  QueryClient,
  QueryCache,
  MutationCache,
  Query,
  Mutation,
} from "@tanstack/react-query";
import { captureException, addApiBreadcrumb } from "@/lib/sentry";

/**
 * Global error handler for React Query
 * Reports all query/mutation errors to Sentry with context
 */
function handleQueryError(
  error: Error,
  query: Query<unknown, unknown, unknown, readonly unknown[]>,
) {
  const context = {
    queryKey: query?.queryKey ? JSON.stringify(query.queryKey) : undefined,
    source: "react-query",
  };

  captureException(error, context);

  // Add breadcrumb for query failures
  addApiBreadcrumb(
    "QUERY",
    query?.queryKey?.[0]?.toString() || "unknown",
    0,
    error.message,
  );
}

function handleMutationError(
  error: Error,
  _variables: unknown,
  _context: unknown,
  mutation: Mutation<unknown, unknown, unknown, unknown>,
) {
  const mutationKey = mutation?.options?.mutationKey;
  const context = {
    mutationKey: mutationKey ? JSON.stringify(mutationKey) : undefined,
    source: "react-query-mutation",
  };

  captureException(error, context);

  // Add breadcrumb for mutation failures
  addApiBreadcrumb(
    "MUTATION",
    mutationKey?.[0]?.toString() || "unknown",
    0,
    error.message,
  );
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleQueryError,
  }),
  mutationCache: new MutationCache({
    onError: handleMutationError,
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
