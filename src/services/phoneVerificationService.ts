import { addApiBreadcrumb, captureException } from "@/lib/sentry";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Normalize phone number to digits only
 */
export function toDigits(phone: string): string {
  return (phone || "").replace(/\D+/g, "");
}

/**
 * Mask phone number for display (shows only last 4 digits)
 */
export function maskPhone(phone: string): string {
  const digits = toDigits(phone);
  if (digits.length <= 4) return phone;
  return "*".repeat(digits.length - 4) + digits.slice(-4);
}

/**
 * Format seconds as MM:SS countdown
 */
export function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Type definitions
export interface FirstAccessResponse {
  firstAccess: boolean;
}

export interface SendCodeResponse {
  status: "sent";
  ttl: number;
  cooldown: number;
}

export interface VerifyCodeResponse {
  status: "verified";
}

export interface ApiError {
  status: number;
  error?: string;
  message?: string;
  attemptsLeft?: number;
  retryAfter?: number;
}

/**
 * Helper to handle API responses with Sentry tracking
 */
async function handleResponse<T>(
  res: Response,
  method: string,
  endpoint: string,
): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage =
      errorData.message || errorData.error || `API Error: ${res.status}`;

    addApiBreadcrumb(
      method,
      `[phone-verification] ${endpoint}`,
      res.status,
      errorMessage,
    );

    const error = {
      status: res.status,
      ...errorData,
    };

    // Report to Sentry for server errors
    if (res.status >= 500) {
      captureException(new Error(errorMessage), {
        endpoint,
        status: res.status,
        service: "phone-verification",
      });
    }

    throw error;
  }

  addApiBreadcrumb(method, `[phone-verification] ${endpoint}`, res.status);
  return res.json();
}

/**
 * Check if user needs to complete first access (phone verification)
 */
export async function getFirstAccess(): Promise<FirstAccessResponse> {
  const endpoint = "/auth/first-access";
  addApiBreadcrumb("GET", `[phone-verification] ${endpoint}`);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      credentials: "include",
    });
    return handleResponse(res, "GET", endpoint);
  } catch (error) {
    if (!(error as ApiError).status) {
      // Network error
      addApiBreadcrumb(
        "GET",
        `[phone-verification] ${endpoint}`,
        0,
        "Network error",
      );
      captureException(error, { endpoint, service: "phone-verification" });
    }
    throw error;
  }
}

/**
 * Send verification code to phone via WhatsApp
 */
export async function sendPhoneCode(
  phone: string,
  name: string,
): Promise<SendCodeResponse> {
  const endpoint = "/auth/phone/send-code";
  addApiBreadcrumb("POST", `[phone-verification] ${endpoint}`);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ phone: toDigits(phone), name }),
    });
    return handleResponse(res, "POST", endpoint);
  } catch (error) {
    if (!(error as ApiError).status) {
      // Network error
      addApiBreadcrumb(
        "POST",
        `[phone-verification] ${endpoint}`,
        0,
        "Network error",
      );
      captureException(error, { endpoint, service: "phone-verification" });
    }
    throw error;
  }
}

/**
 * Verify phone code
 */
export async function verifyPhoneCode(
  phone: string,
  code: string,
): Promise<VerifyCodeResponse> {
  const endpoint = "/auth/phone/verify";
  addApiBreadcrumb("POST", `[phone-verification] ${endpoint}`);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        phone: toDigits(phone),
        code: String(code).padStart(6, "0"),
      }),
    });
    return handleResponse(res, "POST", endpoint);
  } catch (error) {
    if (!(error as ApiError).status) {
      // Network error
      addApiBreadcrumb(
        "POST",
        `[phone-verification] ${endpoint}`,
        0,
        "Network error",
      );
      captureException(error, { endpoint, service: "phone-verification" });
    }
    throw error;
  }
}
