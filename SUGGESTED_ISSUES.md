# 🚀 Suggested Issues & Tasks

Welcome to the `quran-search-engine` contributor community! Whether you are a beginner or an experienced developer, there is something for you to help with.

Below is a list of 10 suggested tasks categorized by difficulty. Feel free to open an issue for any of these to start the discussion!

---

## 🟢 Easy Tasks (Low Effort)

### 1. Documentation: Comprehensive JSDoc

- **Labels:** `documentation`, `good first issue`
- **Goal:** Add detailed JSDoc comments to all public functions in `src/utils/` and `src/core/`.
- **Focus:** Explain parameters, return types, and provide usage examples.
- **Files:** `highlight.ts`, `search.ts`, `tokenization.ts`.

### 2. Feature: Sura Metadata Constants

- **Labels:** `feature`, `good first issue`
- **Goal:** Create a new file `src/data/metadata.ts` that exports an array of all 114 Suras with their Arabic names, English names, total verses, and Juz mapping.
- **Benefit:** Helps UI builders create navigation menus without external datasets.

### 3. Utility: `isArabic(text)` Helper

- **Labels:** `enhancement`, `good first issue`
- **Goal:** Implement a utility function that returns `true` if a string contains Arabic characters (Unicode range `\u0600-\u06FF`).
- **File:** `src/utils/normalization.ts`.

---

## 🟡 Medium Tasks (Medium Effort)

### 4. Testing: Formalize Integration Testing (`verify-loader.ts`)

- **Labels:** `enhancement`, `testing`
- **Goal:** Convert the current [verify-loader.ts CLI script](scripts/verify-loader.ts) into a formal integration test suite.
- **Benefit:** Replaces manual console inspection with automated assertions and proper exit codes for CI pipelines.

### 5. Feature: Range Search Support

- **Labels:** `feature`
- **Goal:** Parse queries like `2:255` or `1:1-7` to return specific verses directly.
- **Logic:** Add a parsing layer before the linguistic search to handle numeric coordinates.

### 6. Optimization: Fuse.js Pre-indexing

- **Labels:** `optimization`, `performance`
- **Goal:** Modify the `search` function to accept an optional pre-computed Fuse index.
- **Benefit:** Prevents re-indexing the entire dataset on every keystroke, significantly boosting UI performance.

### 7. Feature: Text Snippet Generation

- **Labels:** `feature`
- **Goal:** Add a utility that takes a verse and matched tokens, returning a short string (e.g., 5 words before/after) for cleaner search result displays.

---

## 🔴 Hard Tasks (High Effort)

### 8. Refactor: Runtime Schema Checks

- **Labels:** `enhancement`, `dx`
- **Goal:** Use a lightweight validation approach to ensure custom Quran data passed to the library matches the expected `VerseInput` structure at runtime.

### 9. Architecture: Inverted Index

- **Labels:** `enhancement`, `performance`
- **Goal:** Design and implement a word-to-GID inverted index to replace the linear `filter` scan for exact matches.
- **Benefit:** Massive performance gain for large-scale applications or low-powered mobile devices.

### 10. Feature: Phonetic / Transliterated Search

- **Labels:** `feature`, `accessibility`
- **Goal:** Allow users to search for "Bismillah" and find "بسم الله" by implementing a transliteration mapping layer (e.g., Buckwalter or similar).

* **Focus:** Mapping Latin phonetics to the normalized Arabic search index.

---

## How to get started?

- Read our [Contributing Guide](CONTRIBUTING.md).
- Open an issue titled `[Proposal] <Task Name>` to discuss your approach.
- Have fun coding! 🤲
