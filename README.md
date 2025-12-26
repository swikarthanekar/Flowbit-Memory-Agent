# Memory-Driven Invoice Agent

## Overview
This project implements a memory-driven decision layer for invoice automation.
The goal is to improve automation rates over time by learning from past human
corrections and vendor-specific patterns, while remaining explainable,
auditable, and safe.

This system assumes invoice data has already been extracted and focuses only
on post-extraction intelligence.

---

## Core Idea
Instead of treating every invoice as a new document, the agent remembers:
- Vendor-specific field mappings
- Repeated correction patterns
- How discrepancies were resolved by humans

These learnings are reused to make better decisions on future invoices.

---

## Architecture

The system follows a deterministic pipeline:

1. **Recall**
   - Retrieve relevant memory for the invoice vendor and context

2. **Apply**
   - Normalize fields
   - Suggest corrections
   - Apply high-confidence memory only

3. **Decide**
   - Auto-accept, auto-correct, or escalate for human review
   - Low-confidence memory is never auto-applied

4. **Learn**
   - Store new insights from human corrections
   - Reinforce or weaken memory confidence
   - Maintain an audit trail

Memory is persisted across runs using a file-based store.

---

## Memory Types

### Vendor Memory
- Vendor-specific field mappings (e.g., serviceDate)
- VAT behavior
- Discount terms (Skonto)
- SKU mappings

### Correction Memory
- Repeated human fixes (e.g., VAT recomputation)

### Resolution Memory
- Tracks whether past suggestions were approved or rejected
- Used to adjust confidence

---

## Decision Logic & Safety

- Memory is consulted before final decisions
- Low-confidence memory is skipped
- Duplicate invoices are detected and escalated
- Duplicate invoices do not create or modify memory
- Confidence increases with reinforcement and decays over time if unused
- Every action is explainable and logged

---

## Demonstrated Scenarios

The demo runner script demonstrates learning over time across multiple vendors:

1. **Supplier GmbH**
   - Learns service date mapping from human correction

2. **Parts AG**
   - Detects VAT-included pricing and recomputes totals

3. **Duplicate Detection**
   - Safely escalates duplicates and prevents bad learning

4. **Freight & Co**
   - Detects Skonto discount terms
   - Maps freight descriptions to a standardized SKU

---

## Tech Stack
- TypeScript (strict mode)
- Node.js
- File-based persistent memory (JSON)

---

## How to Run

```bash
npm install
npm run demo
