import { Invoice, MemoryEntry } from "../../types";

const memoryStore = require("../memory/memoryStore");

export function recallMemory(invoice: Invoice): MemoryEntry[] {
  const memory = memoryStore.loadMemory();
  return memory.vendorMemory[invoice.vendor] || [];
}
