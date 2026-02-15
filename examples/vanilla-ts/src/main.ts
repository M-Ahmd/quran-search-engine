import {
  loadQuranData,
  loadMorphology,
  loadWordMap,
  search,
  type QuranText,
  type MorphologyAya,
  type WordMap,
  type SearchResponse,
  getHighlightRanges,
} from 'quran-search-engine';

class QuranSearchApp {
  private quranData: QuranText[] = [];
  private morphologyMap: Map<number, MorphologyAya> | null = null;
  private wordMap: WordMap | null = null;
  private loading = true;
  private uxMessage: string | null = null;

  private searchInput: HTMLInputElement;
  private lemmaCheckbox: HTMLInputElement;
  private rootCheckbox: HTMLInputElement;
  private fuzzyCheckbox: HTMLInputElement;
  private suraIdInput: HTMLInputElement;
  private juzIdInput: HTMLInputElement;
  private suraNameInput: HTMLInputElement;
  private resultsDiv: HTMLDivElement;

  constructor() {
    this.searchInput = document.getElementById('search-input') as HTMLInputElement;
    this.lemmaCheckbox = document.getElementById('lemma') as HTMLInputElement;
    this.rootCheckbox = document.getElementById('root') as HTMLInputElement;
    this.fuzzyCheckbox = document.getElementById('fuzzy') as HTMLInputElement;
    this.suraIdInput = document.getElementById('sura-id') as HTMLInputElement;
    this.juzIdInput = document.getElementById('juz-id') as HTMLInputElement;
    this.suraNameInput = document.getElementById('sura-name') as HTMLInputElement;
    this.resultsDiv = document.getElementById('results') as HTMLDivElement;

    this.init();
    this.setupEventListeners();
  }

  private async init() {
    try {
      this.showLoading();
      const [data, morphology, dictionary] = await Promise.all([
        loadQuranData(),
        loadMorphology(),
        loadWordMap(),
      ]);
      this.quranData = data;
      this.morphologyMap = morphology;
      this.wordMap = dictionary;
    } catch (error) {
      console.error('Failed to load Quran data:', error);
      this.showError('Failed to load Quran data');
    } finally {
      this.loading = false;
      this.hideLoading();
    }
  }

  private setupEventListeners() {
    this.searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
    this.lemmaCheckbox.addEventListener('change', this.handleSearch.bind(this));
    this.rootCheckbox.addEventListener('change', this.handleSearch.bind(this));
    this.fuzzyCheckbox.addEventListener('change', this.handleSearch.bind(this));
  }

  private debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    }) as T;
  }

  private handleSearch() {
    const query = this.searchInput.value.trim();
    if (!query || this.loading) {
      this.resultsDiv.innerHTML = '';
      return;
    }

    const options = {
      lemma: this.lemmaCheckbox.checked,
      root: this.rootCheckbox.checked,
      fuzzy: this.fuzzyCheckbox.checked,
      //new
      suraId: this.suraIdInput.value ? parseInt(this.suraIdInput.value) : undefined,
      juzId: this.juzIdInput.value ? parseInt(this.juzIdInput.value) : undefined,
      suraName: this.suraNameInput.value || undefined
    };

    try {
      const response = search(query, this.quranData, this.morphologyMap!, this.wordMap!, options, {
        page: 1,
        limit: 20,
      });

      this.uxMessage = null;
      if (response.pagination.totalResults === 0 && query) {
        this.uxMessage = this.checkConflicts(query, options);
      }

      this.renderResults(response);
    } catch (error) {
      console.error('Search error:', error);
      this.showError('Search failed');
    }
  }

  private renderResults(response: SearchResponse) {
    if (!response.results.length) {
      if (this.uxMessage) {
        this.resultsDiv.innerHTML = `
           <div class="results-info" style="background: #fff3cd; color: #856404; border-color: #ffeeba;">
             <p style="margin: 0; font-weight: bold; text-align: right;" dir="rtl">⚠️ ${this.uxMessage}</p>
           </div>
         `;
      } else {
        this.resultsDiv.innerHTML = '<p>No results found.</p>';
      }
      return;
    }

    const html = `
      <div class="results-info">
        <div>Found <strong>${response.pagination.totalResults}</strong> matches</div>
        <div class="stats">
          <span class="stat-item">
            <span class="indicator indicator-exact"></span>
            <span>Exact: ${response.counts.simple}</span>
          </span>
          <span class="stat-item">
            <span class="indicator indicator-lemma"></span>
            <span>Lemma: ${response.counts.lemma}</span>
          </span>
          <span class="stat-item">
            <span class="indicator indicator-root"></span>
            <span>Root: ${response.counts.root}</span>
          </span>
          <span class="stat-item">
            <span class="indicator indicator-fuzzy"></span>
            <span>Fuzzy: ${response.counts.fuzzy}</span>
          </span>
        </div>
      </div>
      ${response.results.map((verse) => this.renderVerse(verse)).join('')}
    `;

    this.resultsDiv.innerHTML = html;
  }

  private renderVerse(verse: any) {
    const ranges = getHighlightRanges(verse.uthmani, verse.matchedTokens, verse.tokenTypes);
    let highlightedText = verse.uthmani;

    if (ranges.length > 0) {
      const parts: string[] = [];
      let cursor = 0;

      for (const range of ranges) {
        if (cursor < range.start) {
          parts.push(verse.uthmani.slice(cursor, range.start));
        }
        const segment = verse.uthmani.slice(range.start, range.end);
        parts.push(`<span class="highlight-${range.matchType}">${segment}</span>`);
        cursor = range.end;
      }

      if (cursor < verse.uthmani.length) {
        parts.push(verse.uthmani.slice(cursor));
      }

      highlightedText = parts.join('');
    }

    return `
      <div class="verse-card">
        <div class="verse-header">
          <span>${verse.sura_name} (${verse.sura_id}:${verse.aya_id})</span>
          <span class="match-tag">${verse.matchType === 'none' ? 'fuzzy' : verse.matchType} (Score: ${verse.matchScore})</span>
        </div>
        <div class="verse-arabic">${highlightedText}</div>
      </div>
    `;
  }

  private showLoading() {
    this.resultsDiv.innerHTML = '<div class="loading">Loading Quranic datasets...</div>';
  }

  private hideLoading() {
    if (this.resultsDiv.querySelector('.loading')) {
      this.resultsDiv.innerHTML = '';
    }
  }

  private showError(message: string) {
    this.resultsDiv.innerHTML = `<div style="color: red; padding: 20px;">${message}</div>`;
  }

  private checkConflicts(query: string, opts: any): string {
    const { quranData, morphologyMap: morph, wordMap } = this;
    if (!quranData || !morph || !wordMap) return "لا توجد نتائج مطلقًا.";

    // 1. Name vs ID Check
    if (opts.suraName && opts.suraId) {
      const res = search(query, quranData, morph, wordMap, { ...opts, suraId: undefined, juzId: undefined }, { limit: 1 });
      if (res.results.length > 0) {
        const match = res.results[0];
        if (match.sura_id !== opts.suraId) {
          return `سورة ${opts.suraName} هي رقم ${match.sura_id} في الجزء ${match.juz_id}. يرجى تعديل الرقم أو ترك الحقل فارغ.`;
        }
      }
    }

    // 2. Sura vs Juz Check
    if ((opts.suraId || opts.suraName) && opts.juzId) {
      const res = search(query, quranData, morph, wordMap, { ...opts, juzId: undefined }, { limit: 1 });
      if (res.results.length > 0) {
        const match = res.results[0];
        if (match.juz_id !== opts.juzId) {
          const name = opts.suraName || `رقم ${opts.suraId}`;
          return `سورة ${name} موجودة في الجزء ${match.juz_id}. يرجى تعديل رقم الجزء.`;
        }
      }
    }

    // 3. Global Check
    const globalRes = search(query, quranData, morph, wordMap,
      { ...opts, suraId: undefined, juzId: undefined, suraName: undefined },
      { limit: 1 }
    );

    if (globalRes.results.length > 0) {
      return "لا توجد نتائج ضمن الفلاتر الحالية، لكن توجد نتائج في أماكن أخرى من القرآن.";
    }

    return "لا توجد نتائج مطلقًا.";
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new QuranSearchApp();
});
