const isDev = (import.meta as any).env?.DEV;
// In development, use Vite proxy (/api → target) to ensure first‑party cookies
const API_BASE_URL = isDev
  ? "/api"
  : import.meta.env.VITE_API_URL || "http://localhost:3000";

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Debug: capture expected vs actual email being sent
    if (isDev) {
      try {
        const method = (options.method || "GET").toString().toUpperCase();
        const fullUrl = `${this.baseURL}${endpoint}`;
        const urlObj = new URL(fullUrl);
        const actualEmailQuery = urlObj.searchParams.get("userEmail") || null;

        let actualEmailBody: string | null = null;
        const body = (options as any).body;
        if (typeof body === "string" && body.trim().startsWith("{")) {
          try {
            const parsed = JSON.parse(body);
            if (parsed && typeof parsed === "object") {
              // common shapes: { email }, { payload: { email } }
              if (typeof parsed.email === "string") {
                actualEmailBody = parsed.email;
              } else if (
                parsed.payload &&
                typeof parsed.payload === "object" &&
                typeof parsed.payload.email === "string"
              ) {
                actualEmailBody = parsed.payload.email;
              }
            }
          } catch (_) {
            // ignore JSON parse errors in debug
          }
        }

        const authDebug = (window as any).__IMPERSONATION_DEBUG__ || {};
        // eslint-disable-next-line no-console
        console.log("[apiClient] request", {
          method,
          endpoint,
          url: fullUrl,
          expectedEmail: authDebug.expectedEmail,
          impersonating: !!authDebug.impersonating,
          actualUserEmailQuery: actualEmailQuery,
          actualUserEmailBody: actualEmailBody,
          sendingCookies: true,
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("[apiClient] debug logging failed", e);
      }
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include", // Send cookies with every request
    });

    // Handle 401 - redirect to backend login
    if (response.status === 401) {
      window.location.href = `${this.baseURL}/auth/login`;
      throw new Error("Unauthorized - Please log in again");
    }

    // Handle 403 - permissions issue or impersonation read-only
    if (response.status === 403) {
      const errorText = await response.text();
      
      // Check if this is an impersonation read-only error
      if (
        errorText.toLowerCase().includes("impersonation") ||
        errorText.toLowerCase().includes("read-only") ||
        response.headers.get("X-Impersonating") === "true"
      ) {
        throw new Error(
          "You're in view-as mode (read-only). Stop impersonation to perform this action.",
        );
      }
      
      throw new Error(
        errorText ||
          "Access Denied: Your account doesn't have the required permissions. Please contact your system administrator.",
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        errorText || `API Error: ${response.status} ${response.statusText}`,
      );
    }

    // Debug: log impersonation headers on every successful response
    if (isDev) {
      try {
        const xImp = response.headers.get("X-Impersonating");
        const xImpUser = response.headers.get("X-Impersonated-User");
        // eslint-disable-next-line no-console
        console.log("[apiClient] response", {
          status: response.status,
          xImpersonating: xImp,
          xImpersonatedUser: xImpUser,
        });
      } catch (_) {
        // ignore
      }
    }

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

  async post(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, { method: "DELETE" });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
