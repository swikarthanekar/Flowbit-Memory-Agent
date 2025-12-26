export interface Invoice {
  invoiceId: string;
  vendor: string;
  fields: Record<string, any>;
  rawText: string;
  confidence: number;
}

export interface Correction {
  field: string;
  from: any;
  to: any;
  reason: string;
}

export interface HumanCorrection {
  invoiceId: string;
  vendor: string;
  corrections: Correction[];
  finalDecision: "approved" | "rejected";
}

export interface MemoryEntry {
  key: string;
  value: any;
  confidence: number;
  occurrences: number;
  lastUpdated: string;
}

export interface MemoryStore {
  vendorMemory: Record<string, MemoryEntry[]>;
  correctionMemory: MemoryEntry[];
  resolutionMemory: {
    invoiceId: string;
    decision: string;
    timestamp: string;
  }[];
}

export interface AuditStep {
  step: "recall" | "apply" | "decide" | "learn";
  timestamp: string;
  details: string;
}

export interface AgentOutput {
  normalizedInvoice: Record<string, any>;
  proposedCorrections: string[];
  requiresHumanReview: boolean;
  reasoning: string;
  confidenceScore: number;
  memoryUpdates: string[];
  auditTrail: AuditStep[];
}
