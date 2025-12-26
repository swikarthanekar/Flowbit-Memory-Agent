import fs from "fs";
import path from "path";
import { Invoice, HumanCorrection, AgentOutput } from "./types";
import { recallMemory } from "./src/engine/recall";
import { applyMemory } from "./src/engine/apply";
import { decideAction } from "./src/engine/decide";
import { learnFromHuman } from "./src/engine/learn";
import { isDuplicate } from "./src/engine/duplicates";

function loadJSON<T>(file: string): T {
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, "src/data", file), "utf-8")
  );
}

const invoices = loadJSON<Invoice[]>("invoices.json");
const corrections = loadJSON<HumanCorrection[]>("human_corrections.json");

function runScenario(
  title: string,
  invoice1: Invoice,
  invoice2: Invoice | null
) {
  console.log(`\n\n==============================`);
  console.log(`SCENARIO: ${title}`);
  console.log(`==============================`);

  // RUN 1 
  const duplicate1 = isDuplicate(invoice1, invoices);
  const recall1 = recallMemory(invoice1);
  const applied1 = applyMemory(invoice1, recall1);
  const decision1 = decideAction(
    invoice1.confidence,
    applied1.proposedCorrections
  );

  const output1: AgentOutput = {
    normalizedInvoice: applied1.normalizedInvoice,
    proposedCorrections: applied1.proposedCorrections,
    requiresHumanReview: duplicate1
      ? true
      : decision1.requiresHumanReview,
    reasoning: duplicate1
      ? "Possible duplicate invoice detected (same vendor and invoice number within close dates). Escalated for human review."
      : applied1.reasoning,
    confidenceScore: decision1.confidenceScore,
    memoryUpdates: [],
    auditTrail: [
      {
        step: "recall",
        timestamp: new Date().toISOString(),
        details: "Vendor memory loaded"
      },
      {
        step: "apply",
        timestamp: new Date().toISOString(),
        details: duplicate1
          ? "Duplicate detection triggered"
          : applied1.reasoning
      },
      {
        step: "decide",
        timestamp: new Date().toISOString(),
        details: "Decision completed"
      }
    ]
  };

  console.log("\n--- RUN 1 ---");
  console.log(JSON.stringify(output1, null, 2));

  // LEARN 
  const human = corrections.find(
    c => c.invoiceId === invoice1.invoiceId
  );
  if (human && !duplicate1) {
    learnFromHuman(invoice1, human);
  }

  // RUN 2 
  if (!invoice2) return;

  const duplicate2 = isDuplicate(invoice2, invoices);
  const recall2 = recallMemory(invoice2);
  const applied2 = applyMemory(invoice2, recall2);
  const decision2 = decideAction(
    invoice2.confidence,
    applied2.proposedCorrections
  );

  const output2: AgentOutput = {
    normalizedInvoice: applied2.normalizedInvoice,
    proposedCorrections: applied2.proposedCorrections,
    requiresHumanReview: duplicate2
      ? true
      : decision2.requiresHumanReview,
    reasoning: duplicate2
      ? "Possible duplicate invoice detected (same vendor and invoice number within close dates). Escalated for human review."
      : applied2.reasoning,
    confidenceScore: decision2.confidenceScore,
    memoryUpdates: [],
    auditTrail: [
      {
        step: "recall",
        timestamp: new Date().toISOString(),
        details: "Vendor memory loaded"
      },
      {
        step: "apply",
        timestamp: new Date().toISOString(),
        details: duplicate2
          ? "Duplicate detection triggered"
          : applied2.reasoning
      },
      {
        step: "decide",
        timestamp: new Date().toISOString(),
        details: "Decision completed"
      }
    ]
  };

  console.log("\n--- RUN 2 (AFTER LEARNING) ---");
  console.log(JSON.stringify(output2, null, 2));
}

/* SCENARIO 1: Supplier GmbH – serviceDate learning */
runScenario(
  "Supplier GmbH – Service Date Learning",
  invoices.find(i => i.invoiceId === "INV-A-001")!,
  invoices.find(i => i.invoiceId === "INV-A-002")!
);

/* SCENARIO 2: Parts AG – VAT Included Logic */
runScenario(
  "Parts AG – VAT Included Detection",
  invoices.find(i => i.invoiceId === "INV-B-001")!,
  invoices.find(i => i.invoiceId === "INV-B-002")!
);

/* SCENARIO 3: Duplicate Detection */
runScenario(
  "Duplicate Detection – No Learning",
  invoices.find(i => i.invoiceId === "INV-A-003")!,
  invoices.find(i => i.invoiceId === "INV-A-004")!
);

/* SCENARIO 4: Freight & Co – Skonto & SKU Learning */
runScenario(
  "Freight & Co – Skonto + SKU Mapping",
  invoices.find(i => i.invoiceId === "INV-C-001")!,
  invoices.find(i => i.invoiceId === "INV-C-002")!
);
