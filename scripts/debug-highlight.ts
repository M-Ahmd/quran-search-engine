const createDiacriticRegex = (token: string) => {
  // Normalize Alefs in the token first to handle simple vs standard mismatch
  const normalizedToken = token.replace(/[أإآ]/g, 'ا');
  const escaped = normalizedToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Arabic diacritics range (Tashkeel + others) INCLUDING Dagger Alif
  const tashkeel = '[\\u064B-\\u065F\\u0670\\u06D6-\\u06ED]*?'; // Note the *? for non-greedy

  // Match Alef variants (أ, إ, آ, ٱ, ا) interchangeably if the token has 'ا'
  // AND allow matching Dagger Alif (\u0670)
  const letters = escaped.split('').map((char) => {
    if (char === 'ا') return '[اأإآٱ\\u0670]';
    return char;
  });

  return new RegExp(`(${letters.join(tashkeel)})`, 'g');
};

const testHighlight = (text: string, token: string) => {
  const regex = createDiacriticRegex(token);
  const match = text.match(regex);
  console.log(`Token: "${token}"`);
  console.log(`Text:  "${text}"`);
  console.log(`Match: ${match ? 'YES' : 'NO'}`);
  if (match) console.log(`Found: ${match[0]}`);
  console.log('---');
};

// Case 1: Simple word
testHighlight('يَكْتُبُونَ', 'يكتبون');

// Case 2: Dagger Alif acting as letter (Kitab)
// Token has explicit Alif
testHighlight('كِتَٰبَ', 'كتاب');

// Case 3: Dagger Alif acting as diacritic (Ar-Rahman)
// Token usually does NOT have Alif for Rahman (normalization)
// If token is "الرحمن"
testHighlight('ٱلرَّحْمَٰنِ', 'الرحمن');

// Case 5: Testing "يكتب"
testHighlight('يَكْتُبُ', 'يكتب'); // Should match
testHighlight('وَلْيَكْتُب', 'يكتب'); // Should match "يكتب" inside? No, exact search usually matches whole words or depending on tokenization.
// But the highlight logic just matches the string inside the text.
testHighlight('يَكْتُبُونَ', 'يكتب'); // Should match start?
