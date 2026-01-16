import {
  loadQuranData,
  loadMorphology,
  loadWordMap,
  advancedSearch,
} from '../src/index';

const verifyHighlighting = async () => {
  console.log('🚀 Verifying Search Highlighting...');

  try {
    const quranData = await loadQuranData();
    const morphologyMap = await loadMorphology();
    const wordMap = await loadWordMap();

    // Test Case: "وسعها" -> Should highlight due to root match "و-س-ع"
    const query = "وسعها";
    console.log(`\n🔍 Searching for: "${query}" (Root Search)`);
    
    const results = advancedSearch(
      query,
      quranData,
      morphologyMap,
      wordMap,
      { lemma: false, root: true }, // Only root to test root highlighting specifically
      { page: 1, limit: 5 }
    );

    console.log(`Found ${results.results.length} results.`);

    // Find 2:286 where "لا يكلف الله نفسا الا وسعها" exists
    // But "وسعها" is in the query. 
    // Wait, the query IS "وسعها".
    // "وُسۡعَهَا" in 2:286.
    
    const targetVerse = results.results.find(v => v.aya_id_display === '286' && v.sura_id === 2);
    
    if (targetVerse) {
        console.log(`✅ Found Verse 2:286`);
        console.log(`Matched Tokens:`, targetVerse.matchedTokens);
        
        // Check if "وُسۡعَهَا" is in matchedTokens
        // Note: matchedTokens should contain the EXACT string from the verse text
        const expectedToken = "وُسۡعَهَا"; 
        // Or normalized? matchedTokens usually stores the exact text for highlighting.
        
        const found = targetVerse.matchedTokens.some(t => t.includes("وُسۡعَهَا") || t === "وُسۡعَهَا");
        
        if (found) {
            console.log(`✅ Success: "وُسۡعَهَا" is in matchedTokens!`);
        } else {
            console.error(`❌ Failure: "وُسۡعَهَا" NOT found in matchedTokens.`);
            console.log(`Tokens found: ${JSON.stringify(targetVerse.matchedTokens)}`);
        }
    } else {
        console.log(`⚠️ Verse 2:286 not found in top results.`);
        // List top results
        results.results.slice(0, 3).forEach(r => console.log(`${r.sura_id}:${r.aya_id} - Score: ${r.matchScore}`));
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

verifyHighlighting();
