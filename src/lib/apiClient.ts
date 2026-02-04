import { ApiError, parseError, ERROR_CODES } from "@/services/errorService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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

    let response: Response;
    
    try {
      response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include", // Send cookies with every request
      });
    } catch (error) {
      // Network errors (no response from server)
      throw new ApiError(error);
    }

    // Handle 401 - redirect to backend login
    if (response.status === 401) {
      window.location.href = `${this.baseURL}/auth/login`;
      throw new ApiError({ code: ERROR_CODES.UNAUTHORIZED, message: "Please log in again" }, 401);
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
        throw new ApiError({ code: ERROR_CODES.IMPERSONATION_READONLY, message: errorText }, 403);
      }

      throw new ApiError({ code: ERROR_CODES.FORBIDDEN, message: errorText }, 403);
    }

    // Handle 413 - Payload too large (often from Nginx)
    if (response.status === 413) {
      const errorText = await response.text();
      throw new ApiError({ code: ERROR_CODES.PAYLOAD_TOO_LARGE, message: errorText }, 413);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(errorText, response.status);
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
