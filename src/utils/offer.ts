/**
 * Normalize/format a raw offer identifier into digits-only string.
 * Examples:
 *  - "01-801185/00" -> "0180118500"
 *  - "  12-345/67  " -> "1234567"
 */
export function formatOfferId(raw: string | null | undefined): string {
  if (!raw) return "";
  return String(raw).replace(/\D/g, "");
}

export default formatOfferId;
