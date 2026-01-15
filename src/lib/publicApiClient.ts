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

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
      // No credentials for public endpoints
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        errorText || `API Error: ${response.status} ${response.statusText}`
      );
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
}

// Export singleton instance for public (unauthenticated) requests
export const publicApiClient = new PublicApiClient(API_BASE_URL);
