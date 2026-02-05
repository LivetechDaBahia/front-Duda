/**
 * Error handling service with locale support
 * Parses backend errors and maps them to user-friendly messages
 */

import { captureException } from "@/lib/sentry";

export interface ApiErrorResponse {
  code?: string;
  message?: string;
  details?: string;
  statusCode?: number;
  error?: string;
}

export interface ParsedError {
  code: string;
  message: string;
  details?: string;
  statusCode: number;
  isNetworkError: boolean;
  isAuthError: boolean;
  isPermissionError: boolean;
  isValidationError: boolean;
  isServerError: boolean;
  isPayloadTooLarge: boolean;
  raw?: unknown;
}

// Error codes that can be returned from backend or generated client-side
export const ERROR_CODES = {
  // Network errors
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
  CONNECTION_REFUSED: "CONNECTION_REFUSED",

  // Auth errors
  UNAUTHORIZED: "UNAUTHORIZED",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",

  // Permission errors
  FORBIDDEN: "FORBIDDEN",
  IMPERSONATION_READONLY: "IMPERSONATION_READONLY",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",

  // Validation errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",

  // Payload errors
  PAYLOAD_TOO_LARGE: "PAYLOAD_TOO_LARGE",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",

  // Server errors
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  BAD_GATEWAY: "BAD_GATEWAY",

  // Resource errors
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  ALREADY_EXISTS: "ALREADY_EXISTS",

  // Generic
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * Parse an error response from the backend or a network error
 */
export function parseError(error: unknown, statusCode?: number): ParsedError {
  // Handle network errors (fetch failures)
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return {
      code: ERROR_CODES.NETWORK_ERROR,
      message: error.message,
      statusCode: 0,
      isNetworkError: true,
      isAuthError: false,
      isPermissionError: false,
      isValidationError: false,
      isServerError: false,
      isPayloadTooLarge: false,
      raw: error,
    };
  }

  // Handle Error objects with message
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Check for payload too large (413)
    if (
      message.includes("413") ||
      message.includes("too large") ||
      message.includes("payload")
    ) {
      return {
        code: ERROR_CODES.PAYLOAD_TOO_LARGE,
        message: error.message,
        statusCode: 413,
        isNetworkError: false,
        isAuthError: false,
        isPermissionError: false,
        isValidationError: false,
        isServerError: false,
        isPayloadTooLarge: true,
        raw: error,
      };
    }

    // Check for impersonation errors
    if (message.includes("impersonation") || message.includes("read-only")) {
      return {
        code: ERROR_CODES.IMPERSONATION_READONLY,
        message: error.message,
        statusCode: 403,
        isNetworkError: false,
        isAuthError: false,
        isPermissionError: true,
        isValidationError: false,
        isServerError: false,
        isPayloadTooLarge: false,
        raw: error,
      };
    }
  }

  // Handle string errors
  if (typeof error === "string") {
    return parseStringError(error, statusCode);
  }

  // Handle object errors (API responses)
  if (typeof error === "object" && error !== null) {
    return parseObjectError(error as ApiErrorResponse, statusCode);
  }

  // Fallback for unknown error types
  return {
    code: ERROR_CODES.UNKNOWN_ERROR,
    message: String(error),
    statusCode: statusCode || 500,
    isNetworkError: false,
    isAuthError: false,
    isPermissionError: false,
    isValidationError: false,
    isServerError: true,
    isPayloadTooLarge: false,
    raw: error,
  };
}

function parseStringError(error: string, statusCode?: number): ParsedError {
  const lowerError = error.toLowerCase();

  // Check for HTML error pages (like Nginx 413)
  if (error.includes("<html>") || error.includes("<!DOCTYPE")) {
    // Extract title if present
    const titleMatch = error.match(/<title>([^<]+)<\/title>/i);
    const extractedMessage = titleMatch?.[1] || "Server Error";

    if (lowerError.includes("413") || lowerError.includes("too large")) {
      return {
        code: ERROR_CODES.PAYLOAD_TOO_LARGE,
        message: extractedMessage,
        details: "The file or request is too large for the server to process.",
        statusCode: 413,
        isNetworkError: false,
        isAuthError: false,
        isPermissionError: false,
        isValidationError: false,
        isServerError: false,
        isPayloadTooLarge: true,
        raw: error,
      };
    }

    if (lowerError.includes("502") || lowerError.includes("bad gateway")) {
      return {
        code: ERROR_CODES.BAD_GATEWAY,
        message: extractedMessage,
        statusCode: 502,
        isNetworkError: false,
        isAuthError: false,
        isPermissionError: false,
        isValidationError: false,
        isServerError: true,
        isPayloadTooLarge: false,
        raw: error,
      };
    }

    if (lowerError.includes("503") || lowerError.includes("unavailable")) {
      return {
        code: ERROR_CODES.SERVICE_UNAVAILABLE,
        message: extractedMessage,
        statusCode: 503,
        isNetworkError: false,
        isAuthError: false,
        isPermissionError: false,
        isValidationError: false,
        isServerError: true,
        isPayloadTooLarge: false,
        raw: error,
      };
    }
  }

  // Try to parse as JSON
  try {
    const parsed = JSON.parse(error);
    return parseObjectError(parsed, statusCode);
  } catch {
    // Not JSON, treat as plain message
  }

  return {
    code: mapStatusCodeToErrorCode(statusCode),
    message: error,
    statusCode: statusCode || 500,
    isNetworkError: false,
    isAuthError: statusCode === 401,
    isPermissionError: statusCode === 403,
    isValidationError: statusCode === 400 || statusCode === 422,
    isServerError: (statusCode || 500) >= 500,
    isPayloadTooLarge: statusCode === 413,
    raw: error,
  };
}

function parseObjectError(
  error: ApiErrorResponse,
  statusCode?: number,
): ParsedError {
  const code =
    error.code || mapStatusCodeToErrorCode(statusCode || error.statusCode);
  const effectiveStatus = statusCode || error.statusCode || 500;

  return {
    code,
    message: error.message || error.error || "An error occurred",
    details: error.details,
    statusCode: effectiveStatus,
    isNetworkError: false,
    isAuthError: effectiveStatus === 401 || code === ERROR_CODES.UNAUTHORIZED,
    isPermissionError:
      effectiveStatus === 403 || code === ERROR_CODES.FORBIDDEN,
    isValidationError:
      effectiveStatus === 400 ||
      effectiveStatus === 422 ||
      code === ERROR_CODES.VALIDATION_ERROR,
    isServerError: effectiveStatus >= 500,
    isPayloadTooLarge:
      effectiveStatus === 413 || code === ERROR_CODES.PAYLOAD_TOO_LARGE,
    raw: error,
  };
}

function mapStatusCodeToErrorCode(statusCode?: number): ErrorCode {
  switch (statusCode) {
    case 400:
      return ERROR_CODES.VALIDATION_ERROR;
    case 401:
      return ERROR_CODES.UNAUTHORIZED;
    case 403:
      return ERROR_CODES.FORBIDDEN;
    case 404:
      return ERROR_CODES.NOT_FOUND;
    case 409:
      return ERROR_CODES.CONFLICT;
    case 413:
      return ERROR_CODES.PAYLOAD_TOO_LARGE;
    case 422:
      return ERROR_CODES.VALIDATION_ERROR;
    case 500:
      return ERROR_CODES.INTERNAL_SERVER_ERROR;
    case 502:
      return ERROR_CODES.BAD_GATEWAY;
    case 503:
      return ERROR_CODES.SERVICE_UNAVAILABLE;
    default:
      return ERROR_CODES.UNKNOWN_ERROR;
  }
}

/**
 * Get a localized error message using the translation function
 * Falls back to the raw error message if no translation is found
 */
export function getLocalizedErrorMessage(
  parsedError: ParsedError,
  t: (key: string) => string,
): { title: string; description: string } {
  const translationKey = `errors.${parsedError.code}`;
  const translatedTitle = t(translationKey);

  // If translation exists (different from key), use it
  const hasTranslation = translatedTitle !== translationKey;

  const title = hasTranslation ? translatedTitle : getDefaultTitle(parsedError);
  const description =
    parsedError.details ||
    (hasTranslation
      ? t(`errors.${parsedError.code}.description`)
      : parsedError.message);

  return { title, description };
}

function getDefaultTitle(error: ParsedError): string {
  if (error.isNetworkError) return "Network Error";
  if (error.isAuthError) return "Authentication Required";
  if (error.isPermissionError) return "Access Denied";
  if (error.isValidationError) return "Invalid Request";
  if (error.isPayloadTooLarge) return "File Too Large";
  if (error.isServerError) return "Server Error";
  return "Error";
}

/**
 * Create an enhanced Error with parsed information
 * Automatically reports to Sentry when created
 */
export class ApiError extends Error {
  public readonly parsed: ParsedError;

  constructor(error: unknown, statusCode?: number) {
    const parsed = parseError(error, statusCode);
    super(parsed.message);
    this.name = "ApiError";
    this.parsed = parsed;

    // Report to Sentry with context
    captureException(this, {
      errorCode: parsed.code,
      statusCode: parsed.statusCode,
      isNetworkError: parsed.isNetworkError,
      isAuthError: parsed.isAuthError,
      isPermissionError: parsed.isPermissionError,
      details: parsed.details,
    });
  }
}
