const fs = require("fs");
const path = require("path");

const MEMORY_PATH = path.join(__dirname, "memoryStore.json");

// Tunables (easy to explain in README)
const MIN_CONFIDENCE = 0.3;
const DECAY_PER_DAY = 0.02;
const DECAY_START_DAYS = 7;

function applyConfidenceDecay(memory) {
  const now = Date.now();

  Object.values(memory.vendorMemory).forEach(entries => {
    entries.forEach(entry => {
      if (!entry.lastUpdated) return;

      const last = new Date(entry.lastUpdated).getTime();
      const daysSinceUse =
        (now - last) / (1000 * 60 * 60 * 24);

      if (daysSinceUse > DECAY_START_DAYS) {
        const decayAmount =
          (daysSinceUse - DECAY_START_DAYS) * DECAY_PER_DAY;

        entry.confidence = Math.max(
          MIN_CONFIDENCE,
          +(entry.confidence - decayAmount).toFixed(2)
        );
      }
    });
  });
}

function loadMemory() {
  if (!fs.existsSync(MEMORY_PATH)) {
    const empty = {
      vendorMemory: {},
      correctionMemory: [],
      resolutionMemory: []
    };
    fs.writeFileSync(MEMORY_PATH, JSON.stringify(empty, null, 2));
    return empty;
  }

  const memory = JSON.parse(fs.readFileSync(MEMORY_PATH, "utf-8"));

  // Apply decay before using memory
  applyConfidenceDecay(memory);

  return memory;
}

function saveMemory(memory) {
  fs.writeFileSync(MEMORY_PATH, JSON.stringify(memory, null, 2));
}

function upsertVendorMemory(vendor, entry) {
  const memory = loadMemory();

  if (!memory.vendorMemory[vendor]) {
    memory.vendorMemory[vendor] = [];
  }

  const existing = memory.vendorMemory[vendor].find(
    m => m.key === entry.key
  );

  if (existing) {
    existing.confidence = Math.min(1, existing.confidence + 0.2);
    existing.occurrences += 1;
    existing.lastUpdated = new Date().toISOString();
  } else {
    memory.vendorMemory[vendor].push({
      ...entry,
      lastUpdated: new Date().toISOString()
    });
  }

  saveMemory(memory);
}

module.exports = {
  loadMemory,
  saveMemory,
  upsertVendorMemory
};
