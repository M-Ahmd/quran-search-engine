# Using `quran-search-engine`

This pure TypeScript library provides advanced searching capabilities for Quranic text, including morphological matching (roots and lemmas) and fuzzy search.

## Installation

```bash
npm install quran-search-engine
# or
yarn add quran-search-engine
```

## Core Concepts

The engine is stateless. You provide the data (Quran text) and the query, and it returns results. This ensures maximum flexibility for any framework (React, Node.js, Vue, etc.).

## Public API

### 1. Data Loading

Large datasets like Quranic text, morphology, and word maps are lazy-loaded to keep your initial bundle size small.

```typescript
import {
  loadQuranData,
  loadMorphology,
  loadWordMap,
  type WordMap,
  type MorphologyAya,
  type QuranText,
} from 'quran-search-engine';

/**
 * loads datasets asynchronously.
 * Returns:
 * - quranData: QuranText[] -> The complete dataset of Quranic verses.
 * - morphologyMap: Map<gid, MorphologyAya> -> Fast lookup for roots/lemmas by verse ID.
 * - wordMap: WordMap -> Dictionary mapping words to their canonical root/lemma.
 */
const [quranData, morphologyMap, wordMap] = await Promise.all([
  loadQuranData(),
  loadMorphology(),
  loadWordMap(),
]);
```

### 2. Normalization

The library provides a high-performance Arabic normalization utility. It is essential for ensuring that queries (often typed without diacritics) match the indexed text.

```typescript
import { normalizeArabic, removeTashkeel } from 'quran-search-engine';

// removeTashkeel: Only removes diacritics and Quranic marks
const simple = removeTashkeel('بِسْمِ'); // "بسم"

// normalizeArabic: Full normalization (Alef unification, Hamza cleanup, etc.)
const heavy = normalizeArabic('بِسْمِ ٱللَّهِ'); // "بسم الله"
```

### 3. Search Functions

#### `simpleSearch`

A fast, straightforward search for filtering arrays based on a specific field.

```typescript
import { simpleSearch } from 'quran-search-engine';

// simpleSearch<T extends Record<string, unknown>>(items: T[], query: string, field: keyof T)
const results = simpleSearch(quranData, 'الله', 'standard');
```

#### `advancedSearch`

The core engine. It uses `fuse.js` for fuzzy matching and the morphology data for linguistic matching.
The primary search function. It combines text matching, linguistic analysis (lemma/root), and fuzzy fallback.

```typescript
import { advancedSearch, loadQuranData, loadMorphology, loadWordMap } from 'quran-search-engine';

const response = advancedSearch(
  'كتب',
  quranData,
  morphologyMap,
  wordMap,
  { lemma: true, root: true },
  { page: 1, limit: 10 }, // Optional pagination
);

console.log(response.results); // ScoredQuranText[] (10 items)
console.log(response.counts); // Global counts for all matches
console.log(response.pagination); // { totalResults, totalPages, currentPage, limit }
```

**Scoring System:**

- **Exact Match**: 3 points per token.
- **Lemma Match**: 2 points per token.
- **Root Match**: 1 point per token.

#### `getPositiveTokens`

Identify exactly which words in a verse caused the match. Perfect for UI highlighting.

```typescript
import { getPositiveTokens } from 'quran-search-engine';

const tokens = getPositiveTokens(
  verse,
  'lemma',
  'كتب', // The search query
  morphologyMap,
  wordMap['كتب'],
);
// Returns: ['فاكتبوه', 'وليكتب', ...]
```

---

### Core Types

#### `QuranText`

The standard structure for Quranic verses.

```typescript
type QuranText = {
  gid: number;
  uthmani: string;
  simple: string;
  standard: string;
  // ... other surah/aya metadata
};
```

#### `ScoredQuranText`

Extends `QuranText` with search metadata.

```typescript
type ScoredQuranText = QuranText & {
  matchScore: number;
  matchType: 'exact' | 'lemma' | 'root' | 'fuzzy' | 'none';
};
```

#### `SearchResponse`

The structure returned by `advancedSearch`.

```typescript
type SearchResponse = {
  results: ScoredQuranText[];
  counts: {
    simple: number;
    lemma: number;
    root: number;
    total: number;
  };
  pagination: {
    totalResults: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
};
```

---

## Framework Integration

### React Example

```tsx
import { useEffect, useState } from 'react';
import { advancedSearch, loadMorphology, loadWordMap } from 'quran-search-engine';

export function SearchPage() {
  const [data, setData] = useState({ morph: null, words: null });

  useEffect(() => {
    // Load once on mount
    Promise.all([loadMorphology(), loadWordMap()]).then(([morph, words]) => {
      setData({ morph, words });
    });
  }, []);

  const results = advancedSearch('query', quranJson, data.morph, data.words, { root: true });

  // ... render results
}
```

---

## Testing & Verification

### Testing & Verification

We provide two ways to test the library:

#### 1. Unit Tests (Recommended)

Comprehensive unit tests using Vitest that cover all core logic:

```bash
npm test
# or
yarn test
```

These tests cover:

- **Normalization**: Ensures correct handling of Arabic diacritics, unification of Alefs/Hamzas.
- **Tokenization**: Verifies how text is split and matched against queries (Exact/Lemma/Root).
- **Search Logic**: Validates `simpleSearch` and `advancedSearch` algorithms, including scoring and pagination.
- **Data Loading**: Ensures the large JSON datasets load correctly and have the expected structure.

#### 2. Verification Script (Manual)

A standalone script to perform a "smoke test" in a real Node.js environment. It loads the actual data files and runs a series of real-world queries.

```bash
npx tsx scripts/verify-loader.ts
```

This is useful for:

- Verifying the build/data integrity.
- Seeing real performance metrics (execution time).
- Debugging without the test runner overhead.

---

## Example Application

A complete React + TypeScript example is available in the `example/` folder. This demonstrates:

- Integration with Vite
- Real-time search implementation
- UI highlighting of matched tokens
- Pagination handling
- Performance optimizations

To run the example:

```bash
cd example
npm install
npm run dev
```
