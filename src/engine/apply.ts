import { Invoice, MemoryEntry } from "../../types";
import { vatIncludedInText, recomputeFromGross } from "./vat";
import { extractSkonto, isFreightDescription } from "./freight";

export function applyMemory(
  invoice: Invoice,
  memories: MemoryEntry[]
) {
  const proposedCorrections: string[] = [];
  let reasoning = "";
  const normalizedInvoice = { ...invoice.fields };

  // 1. Apply learned vendor memories
  for (const mem of memories) {
    if (mem.confidence >= 0.75) {
      normalizedInvoice[mem.key] = mem.value;
      proposedCorrections.push(
        `Filled ${mem.key} using learned vendor pattern`
      );
      reasoning += `Applied learned vendor memory for ${mem.key} (confidence ${mem.confidence}). `;
    } else {
      reasoning += `Skipped low-confidence memory for ${mem.key} (confidence ${mem.confidence}). `;
    }
  }

  // 2. Parts AG VAT logic
  if (
    invoice.vendor === "Parts AG" &&
    vatIncludedInText(invoice.rawText)
  ) {
    const recomputed = recomputeFromGross(
      normalizedInvoice.grossTotal,
      normalizedInvoice.taxRate
    );

    normalizedInvoice.netTotal = recomputed.netTotal;
    normalizedInvoice.taxTotal = recomputed.taxTotal;

    proposedCorrections.push(
      "Recomputed net and tax totals because VAT is included in prices"
    );

    reasoning +=
      "Detected VAT-included pricing from raw text; recomputed tax and net totals. ";
  }

  // 3. Freight & Co logic
  if (invoice.vendor === "Freight & Co") {
    // Skonto detection
    const skonto = extractSkonto(invoice.rawText);
    if (skonto) {
      normalizedInvoice.discountTerms = skonto;
      proposedCorrections.push(
        "Detected Skonto terms from raw text"
      );
      reasoning += "Detected Skonto terms from raw text. ";
    }

    // Description → SKU mapping
    if (
      normalizedInvoice.lineItems &&
      normalizedInvoice.lineItems[0] &&
      isFreightDescription(normalizedInvoice.lineItems[0].description)
    ) {
      normalizedInvoice.lineItems[0].sku = "FREIGHT";
      proposedCorrections.push(
        "Mapped freight description to SKU FREIGHT"
      );
      reasoning +=
        "Mapped freight-related description to SKU FREIGHT. ";
    }
  }

  return { proposedCorrections, reasoning, normalizedInvoice };
}
