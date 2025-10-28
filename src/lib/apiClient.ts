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

    // Handle 403 - permissions issue
    if (response.status === 403) {
      throw new Error(
        "Access Denied: Your account doesn't have the required permissions (purchase_orders:read). Please contact your system administrator.",
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        errorText || `API Error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
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
