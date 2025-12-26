export function vatIncludedInText(rawText: string): boolean {
  const patterns = [
    "mwst. inkl",
    "prices incl. vat",
    "vat included"
  ];

  const lower = rawText.toLowerCase();
  return patterns.some(p => lower.includes(p));
}

export function recomputeFromGross(
  grossTotal: number,
  taxRate: number
) {
  const netTotal = +(grossTotal / (1 + taxRate)).toFixed(2);
  const taxTotal = +(grossTotal - netTotal).toFixed(2);

  return { netTotal, taxTotal, grossTotal };
}
