import { useState, useEffect, useMemo } from 'react';
import {
  loadQuranData,
  loadMorphology,
  loadWordMap,
  advancedSearch,
  getPositiveTokens,
  type QuranText,
  type MorphologyAya,
  type WordMap,
  type ScoredQuranText,
  type SearchResponse,
} from 'quran-search-engine';
import { Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDebounce } from './useDebounce';
import './App.css';

function App() {
  const [quranData, setQuranData] = useState<QuranText[]>([]);
  const [morphologyMap, setMorphologyMap] = useState<Map<number, MorphologyAya> | null>(null);
  const [wordMap, setWordMap] = useState<WordMap | null>(null);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [options, setOptions] = useState({ lemma: true, root: true, fuzzy: true });
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // 1. Initial Data Loading
  useEffect(() => {
    async function init() {
      try {
        const [data, morphology, dictionary] = await Promise.all([
          loadQuranData(),
          loadMorphology(),
          loadWordMap(),
        ]);
        setQuranData(data);
        setMorphologyMap(morphology);
        setWordMap(dictionary);
      } catch (error) {
        console.error('Failed to load Quran data:', error);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // 2. Search Logic
  useEffect(() => {
    if (!loading && quranData.length > 0 && morphologyMap && wordMap && debouncedQuery.trim()) {
      const response = advancedSearch(debouncedQuery, quranData, morphologyMap, wordMap, options, {
        page: currentPage,
        limit: PAGE_SIZE,
      });

      // Filter out fuzzy results if disabled
      if (!options.fuzzy) {
        const filteredResults = response.results.filter(
          (r) => r.matchType !== 'none' && r.matchType !== 'fuzzy',
        );
        const filteredCount = filteredResults.length;
        const newTotalPages = Math.ceil(filteredCount / PAGE_SIZE);

        // Since pagination is done in the library, we might have fewer results than PAGE_SIZE if we filter here.
        // For a perfect implementation, the library should handle this flag.
        // But for this demo, filtering the current page's results is a visual fix.
        // A better approach is to pass this option to the library if supported.
        // Since the library currently returns a page slice, client-side filtering after pagination is tricky
        // because it reduces the page size.
        // Ideally, we should update the library to accept a 'fuzzy' option.
        // For now, let's just visually hide them or accept that the page might be shorter.

        setSearchResponse({
          ...response,
          results: filteredResults,
          pagination: {
            ...response.pagination,
            totalResults: response.counts.total - response.counts.fuzzy, // approximate update
            totalPages: newTotalPages,
          },
        });
      } else {
        setSearchResponse(response);
      }
    } else {
      setSearchResponse(null);
    }
  }, [debouncedQuery, options, currentPage, quranData, morphologyMap, wordMap, loading]);

  // Reset page when query or options change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, options]);

  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 className="animate-spin" size={32} />
        <span style={{ marginLeft: '1rem' }}>Loading Quranic datasets...</span>
      </div>
    );
  }

  return (
    <div className="search-container">
      <header className="search-header">
        <h1>
          Quran Search Engine <small style={{ fontSize: '0.8rem', opacity: 0.6 }}>Demo</small>
        </h1>
      </header>

      <div className="search-input-group">
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Search for a word (e.g., كتب, الله, رحم)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Search className="search-icon" size={24} />
      </div>

      <div className="options-group">
        <label className="option-item">
          <input
            type="checkbox"
            checked={options.lemma}
            onChange={(e) => setOptions({ ...options, lemma: e.target.checked })}
          />
          Lemma Search
        </label>
        <label className="option-item">
          <input
            type="checkbox"
            checked={options.root}
            onChange={(e) => setOptions({ ...options, root: e.target.checked })}
          />
          Root Search
        </label>
        <label className="option-item">
          <input
            type="checkbox"
            checked={options.fuzzy}
            onChange={(e) => setOptions({ ...options, fuzzy: e.target.checked })}
          />
          Fuzzy Search
        </label>
      </div>

      {searchResponse && (
        <>
          <div className="results-info">
            <div className="results-count">
              Found <strong>{searchResponse.pagination.totalResults}</strong> matches
              {searchResponse.pagination.totalResults > 0 &&
                ` (showing page ${searchResponse.pagination.currentPage} of ${searchResponse.pagination.totalPages})`}
            </div>
            <div className="results-stats">
              <span className="stat-item">
                <span className="indicator indicator-exact"></span>
                <span className="stat-label">Exact:</span>
                <span className="stat-value">{searchResponse.counts.simple}</span>
              </span>
              <span className="stat-item">
                <span className="indicator indicator-lemma"></span>
                <span className="stat-label">Lemma:</span>
                <span className="stat-value">{searchResponse.counts.lemma}</span>
              </span>
              <span className="stat-item">
                <span className="indicator indicator-root"></span>
                <span className="stat-label">Root:</span>
                <span className="stat-value">{searchResponse.counts.root}</span>
              </span>
              <span className="stat-item">
                <span className="indicator indicator-fuzzy"></span>
                <span className="stat-label">Fuzzy:</span>
                <span className="stat-value">{searchResponse.counts.fuzzy}</span>
              </span>
            </div>
          </div>

          <div className="results-list">
            {searchResponse.results.map((verse) => (
              <VerseItem
                key={verse.gid}
                verse={verse}
                query={query}
                morphologyMap={morphologyMap!}
                wordMap={wordMap!}
              />
            ))}
          </div>

          {searchResponse.pagination.totalPages > 1 && (
            <div className="pagination-controls">
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft size={20} />
              </button>
              <span>
                Page {currentPage} of {searchResponse.pagination.totalPages}
              </span>
              <button
                className="page-btn"
                disabled={currentPage === searchResponse.pagination.totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function VerseItem({
  verse,
  query,
  morphologyMap,
  wordMap,
}: {
  verse: ScoredQuranText;
  query: string;
  morphologyMap: Map<number, MorphologyAya>;
  wordMap: WordMap;
}) {
  const tokens = useMemo(() => {
    const cleanQuery = query.replace(/[^\u0621-\u064A\s]/g, '').trim();
    const mode =
      verse.matchType === 'root' || verse.matchType === 'lemma' ? verse.matchType : 'text';

    const wordEntry = wordMap[cleanQuery];
    return getPositiveTokens(
      verse,
      mode,
      wordEntry?.lemma,
      wordEntry?.root,
      cleanQuery,
      morphologyMap,
    );
  }, [verse, query, morphologyMap, wordMap]);

  const highlightVerse = (text: string, matchedTokens: string[]) => {
    if (matchedTokens.length === 0) return text;

    // Determine the highlight class based on the verse match type
    const matchType = verse.matchType === 'none' ? 'fuzzy' : verse.matchType;
    const highlightClass = `highlight highlight-${matchType}`;

    // Sort tokens by length (longer first) to avoid partial matches
    const sortedTokens = [...matchedTokens].sort((a, b) => b.length - a.length);

    // Create a regex to match the token with optional diacritics between letters
    const createDiacriticRegex = (token: string) => {
      // Normalize Alefs in the token first to handle simple vs standard mismatch
      const normalizedToken = token.replace(/[أإآ]/g, 'ا');
      const escaped = normalizedToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Arabic diacritics range (Tashkeel + others) INCLUDING Dagger Alif and Tatweel
      // We use non-greedy matching (*?)
      // \u0640 is Tatweel (Kashida)
      const tashkeel = '[\\u064B-\\u065F\\u0670\\u06D6-\\u06ED\\u0640]*?';

      // Match Alef variants (أ, إ, آ, ٱ, ا) interchangeably if the token has 'ا'
      // Match Ya/Alef Maqsura variants (ي, ى) interchangeably
      // Match Ta Marbuta/Ha variants (ة, ه) interchangeably (optional but robust)
      const letters = escaped.split('').map((char) => {
        if (char === 'ا') return '[اأإآٱ\\u0670]';
        if (char === 'ي') return '[يى]';
        if (char === 'ى') return '[ىي]';
        if (char === 'ة') return '[ةه]';
        if (char === 'ه') return '[هة]';
        return char;
      });

      return new RegExp(`(${letters.join(tashkeel)})`, 'g');
    };

    let highlighted = text;
    for (const token of sortedTokens) {
      // Use the diacritic-aware regex
      const regex = createDiacriticRegex(token);
      // Use $1 to preserve the actual matched text (with its diacritics)
      highlighted = highlighted.replace(regex, `<span class="${highlightClass}">$1</span>`);
    }
    return <div dangerouslySetInnerHTML={{ __html: highlighted }} />;
  };

  return (
    <div className="verse-card">
      <div className="verse-card-header">
        <span>
          {verse.sura_name} ({verse.sura_id}:{verse.aya_id})
        </span>
        <span className={`match-tag tag-${verse.matchType}`}>
          {verse.matchType === 'none' ? 'fuzzy' : verse.matchType} (Score: {verse.matchScore})
        </span>
      </div>
      <div className="verse-arabic">{highlightVerse(verse.uthmani, tokens)}</div>
    </div>
  );
}

export default App;
