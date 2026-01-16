# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-01-16

### Added

- Initial release of `quran-search-engine`.
- Core stateless advanced search functionality.
- `simpleSearch` for fast filter-based searching.
- `advancedSearch` supporting exact match, fuzzy search (Fuse.js), and linguistic match (root/lemma).
- Arabic text normalization utility `normalizeArabic`.
- Data loading utility `loadMorphology`.
- TypeScript definitions for `QuranText` and `SearchResult`.
