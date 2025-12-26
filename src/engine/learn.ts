import { Invoice, HumanCorrection, MemoryEntry } from "../../types";

const memoryStore = require("../memory/memoryStore");

export function learnFromHuman(
  invoice: Invoice,
  correction: HumanCorrection
) {
  for (const c of correction.corrections) {
    const entry: MemoryEntry = {
      key: c.field,
      value: c.to,
      confidence: 0.8,
      occurrences: 1,
      lastUpdated: new Date().toISOString()
    };

    memoryStore.upsertVendorMemory(invoice.vendor, entry);
  }
}
