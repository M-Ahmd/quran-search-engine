import {
  loadQuranData,
  loadMorphology,
} from '../src/index';

const verifyAlignment = async () => {
  console.log('🚀 Verifying Morphology Alignment...');

  try {
    const quranData = await loadQuranData();
    const morphologyMap = await loadMorphology();

    // Check first 10 verses
    for (let i = 0; i < 10; i++) {
      const verse = quranData[i];
      const morph = morphologyMap.get(verse.gid);
      
      if (!morph) {
        console.error(`Missing morphology for verse ${verse.gid}`);
        continue;
      }

      // verse.standard
      const words = verse.standard.trim().split(/\s+/);
      
      // morph.lemmas and morph.roots
      const lemmas = morph.lemmas;
      const roots = morph.roots;
      
      console.log(`\nVerse ${verse.sura_id}:${verse.aya_id} (GID: ${verse.gid})`);
      console.log(`Text Words: ${words.length}`);
      console.log(`Lemmas: ${lemmas.length}`);
      console.log(`Roots: ${roots.length}`);
      
      if (words.length !== lemmas.length || words.length !== roots.length) {
        console.error(`❌ Mismatch in length!`);
        console.log(`Words: ${words.join(', ')}`);
        console.log(`Lemmas: ${lemmas.join(', ')}`);
        console.log(`Roots: ${roots.join(', ')}`);
      } else {
        console.log(`✅ Aligned.`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

verifyAlignment();
