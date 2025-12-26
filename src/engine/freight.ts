export function extractSkonto(rawText: string): string | null {
  const lower = rawText.toLowerCase();

  if (lower.includes("skonto")) {
    return "2% Skonto within 10 days";
  }

  return null;
}

export function isFreightDescription(description: string | undefined): boolean {
  if (!description) return false;

  const lower = description.toLowerCase();
  return (
    lower.includes("seefracht") ||
    lower.includes("shipping") ||
    lower.includes("transport")
  );
}
