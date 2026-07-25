# Prestige Fiction Forge — Project Architecture

*Prestige Fiction Forge is a specialized Model Context Protocol (MCP) server combining local Natural Language Processing (NLP) metrics with adversarial LLM critique to analyze, edit, and benchmark manuscript prose.* (source: package.json, README.md)

<!-- kb-status: level=documented | phase="Architecture documented" | updated=2026-06-02 -->
**Status:** ⚪ Documented — architecture captured; current build phase not stated in source material [unverified]

---

## Architecture Components

The project is structured as an MCP server with modular analysis engines and a manuscript context layer:

```
prestige-fiction-forge/
├── index.js                              # MCP server gateway (registers all 10 tools)
├── src/
│   ├── engines/
│   │   ├── chapter-analyzer.js           # Local NLP analysis engine
│   │   ├── critique-engine.js            # Passive voice and cliché detector
│   │   ├── benchmark-engine.js           # Comp title benchmarking
│   │   ├── revision-engine.js            # Before/after editing engine
│   │   ├── memory-integration.js         # JSON file-based version storage
│   │   └── shark-autopsy-engine.js       # Adversarial LLM critique engine
│   └── context/
│       └── MANUSCRIPT_CONTEXT.md         # String Theory characters, science, and style rules
└── .memory/                              # Persistent local storage
```

---

## Technical Features (v2.0 - Shark Autopsy Edition)

Prestige Fiction Forge integrates mathematical style metrics with adversarial agent simulations using Google Gemini (`gemini-2.5-flash`):

### 1. Context Injection & NLP Evidence Base
- **Context Injection**: Every critique prompt dynamically embeds `MANUSCRIPT_CONTEXT.md`, ensuring the LLM understands character backstories, established science (e.g., VCH and 68.48 Hz carrier waves), and narrative constraints.
- **NLP Inputs**: Sentence length variety, passive voice density, and emotional trajectories from the `ChapterAnalyzer` feed directly into LLM prompts as quantitative evidence.

### 2. Multi-Dimensional Findings
Critique results are categorized and weighted before presentation:
- **Categorization**: MECHANICAL (structural errors) / AESTHETIC (taste-dependent styling) / CONTEXT_DEPENDENT (holistic manuscript requirements).
- **Weighting**: Each finding is scored by severity (1–10) and confidence (High/Medium/Low).
- **Preservation Layer**: Highlights structural elements that are functioning correctly to prevent the writer from deleting load-bearing prose.

### 3. Interactive Diagnostics
The critique engine generates HTML diagnostics featuring radar charts of style metrics, severity-coded findings, and before-and-after inline revisions.

---

## Tool Capabilities (10 Registered MCP Tools)

The MCP server exposes 10 tools to connected agents:

### The Shark Autopsy Tools
- `shark_autopsy_prose`: Runs line-level adversarial critiques of sample pages using local NLP evidence.
- `shark_autopsy_query`: Evaluates query letters against the Janet Reid query-critique protocol.
- `shark_autopsy_agent_sim`: Simulates a panel of virtual literary agents voting and providing distinct perspectives on submission materials.

### NLP and Benchmarking Tools
- `analyze_chapter_prestige`: Evaluates text density, passive voice, and generates a composite "Prestige Score."
- `benchmark_against_comps`: Compares style metrics against award-winning books.
- `generate_revisions`: Proposes specific, before-and-after edits for weak passages.
- `track_improvement`: Measures improvement indices across subsequent document versions.
- `get_prestige_checklist`: Generates submission readiness checklists.
- `baseline_manuscript`: Ingests and caches multiple chapters.
- `manuscript_snapshot`: Compiles manuscript-wide statistics.
