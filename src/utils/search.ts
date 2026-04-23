interface SearchMatchOptions {
  textFields?: Array<string | null | undefined>;
  digitFields?: Array<string | null | undefined>;
}

function normalizeText(value: string | null | undefined): string {
  return String(value ?? "").toLowerCase();
}

function normalizeDigits(value: string | null | undefined): string {
  return String(value ?? "").replace(/\D/g, "");
}

export function matchesSearchTerm(
  rawSearch: string | null | undefined,
  options: SearchMatchOptions,
): boolean {
  const search = String(rawSearch ?? "").trim();
  if (!search) return true;

  const normalizedSearch = search.toLowerCase();
  const normalizedSearchDigits = normalizeDigits(search);

  const hasTextMatch = (options.textFields ?? []).some((field) =>
    normalizeText(field).includes(normalizedSearch),
  );
  if (hasTextMatch) return true;

  if (!normalizedSearchDigits) return false;

  return (options.digitFields ?? []).some((field) =>
    normalizeDigits(field).includes(normalizedSearchDigits),
  );
}

