import { addApiBreadcrumb, captureException } from "@/lib/sentry";
import { ApiError, ERROR_CODES } from "@/services/errorService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class PublicApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const method = options.method || "GET";
    const url = `${this.baseURL}${endpoint}`;

    // Add breadcrumb for request start
    addApiBreadcrumb(method, `[public] ${endpoint}`);

    let response: Response;

    try {
      response = await fetch(url, {
        ...options,
        headers,
        // No credentials for public endpoints
      });
    } catch (error) {
      // Network errors (no response from server)
      addApiBreadcrumb(method, `[public] ${endpoint}`, 0, error instanceof Error ? error.message : "Network error");
      captureException(error, { endpoint, isPublicApi: true });
      throw new ApiError(error);
    }

    if (!response.ok) {
      const errorText = await response.text();
      addApiBreadcrumb(method, `[public] ${endpoint}`, response.status, errorText);
      
      // Map common status codes
      if (response.status === 400) {
        throw new ApiError({ code: ERROR_CODES.VALIDATION_ERROR, message: errorText }, 400);
      }
      if (response.status === 404) {
        throw new ApiError({ code: ERROR_CODES.NOT_FOUND, message: errorText }, 404);
      }
      if (response.status === 409) {
        throw new ApiError({ code: ERROR_CODES.CONFLICT, message: errorText }, 409);
      }
      if (response.status >= 500) {
        throw new ApiError({ code: ERROR_CODES.INTERNAL_SERVER_ERROR, message: errorText }, response.status);
      }
      
      throw new ApiError(errorText, response.status);
    }

    // Success breadcrumb
    addApiBreadcrumb(method, `[public] ${endpoint}`, response.status);

    // Handle empty responses (204 No Content or empty body)
    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");

    if (contentLength === "0" || response.status === 204) {
      return null;
    }

    // Only parse JSON if content-type indicates JSON
    if (contentType && contentType.includes("application/json")) {
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    }

    // For non-JSON responses, return text
    return response.text();
  }

  async get(endpoint: string) {
    return this.request(endpoint, { method: "GET" });
  }

  async post(endpoint: string, data?: unknown) {
    return this.request(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Export singleton instance for public (unauthenticated) requests
export const publicApiClient = new PublicApiClient(API_BASE_URL);
