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
import { Search, Loader2, ChevronLeft, ChevronRight, Hash } from 'lucide-react';
import './App.css';

function App() {
  const [quranData, setQuranData] = useState<QuranText[]>([]);
  const [morphologyMap, setMorphologyMap] = useState<Map<number, MorphologyAya> | null>(null);
  const [wordMap, setWordMap] = useState<WordMap | null>(null);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [options, setOptions] = useState({ lemma: true, root: true });
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
    if (!loading && quranData.length > 0 && morphologyMap && wordMap && query.trim()) {
      const response = advancedSearch(query, quranData, morphologyMap, wordMap, options, {
        page: currentPage,
        limit: PAGE_SIZE,
      });
      setSearchResponse(response);
    } else {
      setSearchResponse(null);
    }
  }, [query, options, currentPage, quranData, morphologyMap, wordMap, loading]);

  // Reset page when query or options change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, options]);

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
        <Search size={24} color="#666" />
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
      </div>

      {searchResponse && (
        <>
          <div className="results-info">
            Found <strong>{searchResponse.pagination.totalResults}</strong> matches
            {searchResponse.pagination.totalResults > 0 &&
              ` (showing page ${searchResponse.pagination.currentPage} of ${searchResponse.pagination.totalPages})`}
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
    return getPositiveTokens(verse, mode, cleanQuery, morphologyMap, wordMap[cleanQuery]);
  }, [verse, query, morphologyMap, wordMap]);

  const highlightVerse = (text: string, matchedTokens: string[]) => {
    if (matchedTokens.length === 0) return text;

    // Sort tokens by length (longer first) to avoid partial matches
    const sortedTokens = [...matchedTokens].sort((a, b) => b.length - a.length);

    // Create a regex to match any of the tokens
    // Note: This is an oversimplification for the demo.
    // In a real app, word-boundary aware splitting is better.
    let highlighted = text;
    for (const token of sortedTokens) {
      // We use a temporary placeholder to avoid double-highlighting
      const regex = new RegExp(`(${token})`, 'g');
      highlighted = highlighted.replace(regex, '<span class="highlight">$1</span>');
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
          {verse.matchType} (Score: {verse.matchScore})
        </span>
      </div>
      <div className="verse-arabic">{highlightVerse(verse.uthmani, tokens)}</div>
    </div>
  );
}

export default App;
