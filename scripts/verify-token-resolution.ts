import {
  loadWordMap,
  normalizeArabic,
} from '../src/index';

const verifyResolution = async () => {
  console.log('🚀 Verifying Token Resolution...');

  try {
    const wordMap = await loadWordMap();

    const targetWord = "وُسۡعَهَا";
    const normalized = normalizeArabic(targetWord); // "وسعها"
    
    console.log(`Original: ${targetWord}`);
    console.log(`Normalized: ${normalized}`);
    
    const entry = wordMap[normalized];
    if (entry) {
        console.log(`✅ Found in WordMap!`);
        console.log(`Lemma: ${entry.lemma}`);
        console.log(`Root: ${entry.root}`);
        
        if (entry.root === "و-س-ع") {
            console.log(`✅ Root matches target.`);
        } else {
            console.error(`❌ Root mismatch. Expected: و-س-ع, Got: ${entry.root}`);
        }
    } else {
        console.error(`❌ Not found in WordMap.`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

verifyResolution();
