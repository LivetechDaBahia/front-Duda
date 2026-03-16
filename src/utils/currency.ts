/**
 * Map common currency symbols/abbreviations to ISO 4217 codes.
 */
const CURRENCY_MAP: Record<string, string> = {
  R$: "BRL",
  $: "USD",
  "€": "EUR",
  "£": "GBP",
  "¥": "JPY",
};

/**
 * Resolve a raw currency string (symbol or ISO code) to ISO 4217.
 */
function resolveISO(raw: string | null | undefined): string {
  if (!raw) return "BRL";
  const trimmed = raw.trim();
  return CURRENCY_MAP[trimmed] ?? trimmed;
}

/**
 * Locale-to-Intl locale mapping.
 */
const LOCALE_MAP: Record<string, string> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es-ES",
};

/**
 * Format a numeric value as currency using Intl.NumberFormat.
 *
 * @param value    – the amount
 * @param currency – ISO code or symbol (e.g. "BRL", "R$", "USD")
 * @param locale   – app locale key ("pt", "en", "es"); defaults to "pt"
 */
export function formatCurrency(
  value: number,
  currency: string = "BRL",
  locale: string = "pt",
): string {
  const iso = resolveISO(currency);
  const intlLocale = LOCALE_MAP[locale] ?? "pt-BR";
  try {
    return new Intl.NumberFormat(intlLocale, {
      style: "currency",
      currency: iso,
    }).format(value);
  } catch {
    return `${iso} ${value.toFixed(2)}`;
  }
}
