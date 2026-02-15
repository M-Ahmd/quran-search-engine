import { loadQuranData, loadMorphology, loadWordMap, search } from 'quran-search-engine';

function getConflictMessage(query, options, quranData) {
    // 1. Name vs ID Check
    if (options.suraName && options.suraId) {
        const check = search(query, quranData, null, null, { ...options, suraId: undefined, juzId: undefined }, { limit: 1 });
        if (check.pagination.totalResults > 0) {
            const m = check.results[0];
            if (m.sura_id !== options.suraId) {
                return `سورة ${options.suraName} هي رقم ${m.sura_id} في الجزء ${m.juz_id}. يرجى تعديل الرقم أو ترك الحقل فارغ.`;
            }
        }
    }

    // 2. Sura vs Juz Check
    if ((options.suraId || options.suraName) && options.juzId) {
        const check = search(query, quranData, null, null, { ...options, juzId: undefined }, { limit: 1 });
        if (check.pagination.totalResults > 0) {
            const m = check.results[0];
            if (m.juz_id !== options.juzId) {
                const name = options.suraName || `رقم ${options.suraId}`;
                return `سورة ${name} موجودة في الجزء ${m.juz_id}. يرجى تعديل رقم الجزء.`;
            }
        }
    }

    // 3. Global Check
    const globalCheck = search(query, quranData, null, null, { lemma: options.lemma, root: options.root, fuzzy: options.fuzzy }, { limit: 1 });
    if (globalCheck.pagination.totalResults > 0) {
        return "لا توجد نتائج ضمن الفلاتر الحالية، لكن توجد نتائج في أماكن أخرى من القرآن.";
    }

    return "لا توجد نتائج مطلقًا.";
}

async function main() {
    console.log('🚀 Loading Quran Search Engine data...\n');

    try {
        // Load all required data
        const [quranData, morphologyMap, wordMap] = await Promise.all([
            loadQuranData(),
            loadMorphology(),
            loadWordMap(),
        ]);

        console.log(`✅ Loaded ${quranData.length} verses`);
        console.log(`✅ Loaded morphology data for ${morphologyMap.size} verses`);
        console.log(`✅ Loaded word map with ${Object.keys(wordMap).length} entries\n`);

        // Example searches
        const examples = [
            { query: 'الله', description: 'Search for "Allah"' },
            { query: 'رحم', description: 'Search for root "رحم" (mercy)' },
            { query: 'كتب', description: 'Search for "kataba" (wrote)' },
            { query: 'الله', description: 'Search for "Allah" in Al-Fatiha (Sura 1)', suraId: 1 }, //+
            { query: 'الناس', description: 'Search for "An-Nas" (Sura 114)', suraId: 114 }, //+
        ];

        for (const example of examples) {
            console.log(`🔍 ${example.description}: "${example.query}"`);
            console.log('─'.repeat(50));

            const results = search(
                example.query,
                quranData,
                morphologyMap,
                wordMap,
                {
                    lemma: true,
                    root: true,
                    fuzzy: true,
                    suraId: example.suraId, //+  dynamic Injection
                    juzId: example.juzId,  //+  dynami Injection

                },
                {
                    page: 1,
                    limit: 5, // Show only first 5 results
                },
            );

            console.log(`📊 Found ${results.pagination.totalResults} matches`);

            if (results.pagination.totalResults === 0) {
                const msg = getConflictMessage(example.query, {
                    suraId: example.suraId,
                    juzId: example.juzId,
                    lemma: true, root: true, fuzzy: true
                }, quranData);
                console.log(`⚠️  ${msg}`);
            }
            console.log(`   - Exact: ${results.counts.simple}`);
            console.log(`   - Lemma: ${results.counts.lemma}`);
            console.log(`   - Root: ${results.counts.root}`);
            console.log(`   - Fuzzy: ${results.counts.fuzzy}\n`);

            // Display top results
            results.results.forEach((verse, index) => {
                console.log(`${index + 1}. ${verse.sura_name} (${verse.sura_id}:${verse.aya_id})`);
                console.log(`   Match: ${verse.matchType} (Score: ${verse.matchScore})`);
                console.log(`   Text: ${verse.uthmani}`);
                console.log();
            });

            console.log('─'.repeat(50));
            console.log();
        }

        // Interactive search if arguments provided
        const queryArg = process.argv[2];
        if (queryArg) {
            console.log(`🔍 Custom search: "${queryArg}"`);
            console.log('─'.repeat(50));

            const customResults = search(
                queryArg,
                quranData,
                morphologyMap,
                wordMap,
                {
                    lemma: true,
                    root: true,
                    fuzzy: true,
                },
                {
                    page: 1,
                    limit: 10,
                },
            );

            console.log(`📊 Found ${customResults.pagination.totalResults} matches\n`);

            if (customResults.pagination.totalResults === 0) {
                const msg = getConflictMessage(queryArg, { lemma: true, root: true, fuzzy: true }, quranData);
                console.log(`⚠️  ${msg}\n`);
            }

            customResults.results.forEach((verse, index) => {
                console.log(`${index + 1}. ${verse.sura_name} (${verse.sura_id}:${verse.aya_id})`);
                console.log(`   ${verse.uthmani}`);
                console.log();
            });
        } else {
            console.log('💡 Tip: Run with a search term as argument:');
            console.log('   pnpm start "your search term"');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

main();
