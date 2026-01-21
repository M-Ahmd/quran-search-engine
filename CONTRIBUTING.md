# Contributing to quran-search-engine

First off, thank you for considering contributing to `quran-search-engine`! It's people like you that make the open-source community such a great place.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Help?

- **Reporting Bugs:** Use the bug report template to help us identify and fix issues.
- **Suggesting Features:** Have an idea? We'd love to hear it!
- **Improving Documentation:** Documentation is just as important as code.
- **Submitting Pull Requests:** Check out the issues labeled `good first issue` to get started.

## Development Setup

This project uses **pnpm** for package management.

1. **Clone the repository:**

   ```bash
   git clone https://github.com/adelpro/quran-search-engine.git
   cd quran-search-engine
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Build the library:**

   ```bash
   pnpm build
   ```

4. **Run tests:**
   ```bash
   pnpm test
   ```

## Project Structure

- `src/core`: Main search logic and tokenization.
- `src/utils`: Normalization, highlighting, and data loading.
- `src/data`: Bundled Quranic datasets (morphology, word maps).
- `examples/`: Demonstration apps (Vite/React, Node.js, Vanilla TS).

## Pull Request Process

1. Ensure all tests pass: `pnpm test`.
2. Follow the existing code style (linting will run automatically via husky).
3. Update the `CHANGELOG.md` with your changes under the `[Unreleased]` section.
4. Submit your PR with a clear description of the problem solved.

## Questions?

Feel free to open a [Discussion](https://github.com/adelpro/quran-search-engine/discussions) or reach out via email.
