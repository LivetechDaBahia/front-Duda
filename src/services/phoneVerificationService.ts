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
 * Check if user needs to complete first access (phone verification)
 */
export async function getFirstAccess(): Promise<FirstAccessResponse> {
  const res = await fetch(`${API_BASE}/auth/first-access`, {
    credentials: "include",
  });
  if (!res.ok)
    throw {
      status: res.status,
      ...(await res.json().catch(() => ({}))),
    };
  return res.json();
}

/**
 * Send verification code to phone via WhatsApp
 */
export async function sendPhoneCode(
  phone: string,
  name: string,
): Promise<SendCodeResponse> {
  const res = await fetch(`${API_BASE}/auth/phone/send-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ phone: toDigits(phone), name }),
  });
  if (!res.ok)
    throw {
      status: res.status,
      ...(await res.json().catch(() => ({}))),
    };
  return res.json();
}

/**
 * Verify phone code
 */
export async function verifyPhoneCode(
  phone: string,
  code: string,
): Promise<VerifyCodeResponse> {
  const res = await fetch(`${API_BASE}/auth/phone/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      phone: toDigits(phone),
      code: String(code).padStart(6, "0"),
    }),
  });
  if (!res.ok)
    throw {
      status: res.status,
      ...(await res.json().catch(() => ({}))),
    };
  return res.json();
}
