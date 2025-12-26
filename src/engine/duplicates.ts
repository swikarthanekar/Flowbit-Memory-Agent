import { Invoice } from "../../types";

function parseDate(dateStr: string): number {
  // Expected format: DD.MM.YYYY
  const [day, month, year] = dateStr.split(".").map(Number);
  return new Date(year, month - 1, day).getTime();
}

export function isDuplicate(
  current: Invoice,
  allInvoices: Invoice[]
): boolean {
  return allInvoices.some(inv => {
    if (inv.invoiceId === current.invoiceId) return false;

    const sameVendor = inv.vendor === current.vendor;
    const sameNumber =
      inv.fields.invoiceNumber === current.fields.invoiceNumber;

    if (!sameVendor || !sameNumber) return false;

    const d1 = parseDate(inv.fields.invoiceDate);
    const d2 = parseDate(current.fields.invoiceDate);

    const daysDiff = Math.abs(d1 - d2) / (1000 * 60 * 60 * 24);
    return daysDiff <= 3;
  });
}
