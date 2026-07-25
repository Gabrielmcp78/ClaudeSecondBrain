# WriteTrack — Project Architecture

*WriteTrack is a local, privacy-first manuscript monitoring and semantic analysis tool. It watches for changes in `.pages` and `.docx` manuscripts, extracts raw text, and invokes on-device Apple Intelligence via FModCLI to analyze prose metrics, tone, rhythm, and narrative structure.* (source: WriteTrack/package.json, STATUS.md, IMPLEMENTATION.md)

<!-- kb-status: level=operational | phase="Working pipeline (14-18s processing)" | updated=2026-06-20 -->
**Status:** 🔵 Operational — extraction/analysis pipeline functioning per documented performance metrics

---

## Architecture Components

WriteTrack operates as a CLI tool with modular extraction and analysis components:

```
WriteTrack/
├── config/
│   └── default.json          # Default configuration parameters
├── src/
│   ├── index.js              # Command Line Interface (CLI) entry point
│   ├── monitor.js            # File system watcher using Chokidar
│   ├── extractors/
│   │   └── pages.js          # .pages zip archive extractor
│   └── analyzers/
│       └── fmodcli.js        # FModCLI (Apple Intelligence) wrapper
└── versions/                 # Persistent storage for JSON analysis files
```

---

## Technical Workflow

WriteTrack operates non-invasively in the background during writing sessions:

```
[File Saved (.pages)] -> [chokidar Watcher] -> [Debounce (3000ms)] -> [pages.js Extractor] -> [fmodcli.js Analyzer] -> [JSON Version Saved]
```

### 1. File Monitoring & Extraction
- **Directory Watcher**: chokidar monitors the targeted manuscripts folder (defaulting to `~/Documents/Manuscripts` or custom path).
- **Debouncing**: A 3-second debounce window prevents multiple evaluations during rapid, successive file updates.
- **Pages Parser**: Extracts raw XML document files directly from the `.pages` ZIP archive structure in 100–200 milliseconds, bypassing Apple Pages API.

### 2. On-Device Semantic Analysis
The extraction engine hands raw text off to the `FModCLI` local utility (running on port-independent Apple Intelligence) to perform concurrent analysis across three domains:
- **Tone**: Evaluates primary emotional tone, intensity (scale 1–10), atmospheric quality, and emotional trajectory.
- **Rhythm**: Measures sentence patterns (staccato vs. flowing), pacing, punctuation density, and musical qualities of the prose.
- **Narrative**: Analyzes POV, psychic distance, tension score (scale 1–10), character voices, momentum, and thematic markers.
- **Prose Metrics**: Computes word/sentence/paragraph counts, average sentence length, and sentence length variance.

### 3. Version Storage & Processing
- Outputs are saved as metadata-enriched JSON records in the `versions/` folder.
- Processing completes in 14–18 seconds (100–200ms extraction, 13–17s FModCLI processing).

---

## Target Use Cases for *String Theory*

WriteTrack is tailored to enforce the literary parameters of Gabriel's novel *String Theory*:
1. **Sentence Variance Tracking**: Monitors sentence length variance to quantify David Lang's voice fragmentation in chapters.
2. **Quartet Structure Evolution**: Tracks structural metrics across multiple documents to align the manuscript's four-movement tempo.
3. **Physics/Emotion Balance**: Extracts thematic occurrences to audit the density of speculative physics concepts versus human narrative stakes.
4. **Tension Curve Auditing**: Generates version-over-version tension mapping to ensure the dramatic momentum follows designated curves.
