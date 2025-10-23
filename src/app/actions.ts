'use server';

import { translateSerbianWord } from '@/ai/flows/translate-serbian-word';
import { generateExampleSentences } from '@/ai/flows/generate-example-sentences';
import { unstable_cache as cache } from 'next/cache';
import { parseCSV, WordEntry, WORD_CATEGORIES, ACTUAL_CATEGORIES, shuffleArray } from '@/lib/word-data';
import { promises as fs } from 'fs';
import path from 'path';

// Translation without caching - each request calls the AI
export async function getTranslation(serbianWord: string): Promise<string> {
  try {
    const result = await translateSerbianWord({ serbianWord });
    return result.englishTranslation;
  } catch (error) {
    console.error(`Error translating "${serbianWord}":`, error);
    // Return a user-friendly error message
    return 'Could not get translation.';
  }
}

async function loadWordsFromCategory(categoryId: string): Promise<WordEntry[]> {
  try {
    console.log(`Loading words for category: ${categoryId}`);
    const csvPath = path.join(process.cwd(), 'most-used', categoryId);
    console.log(`CSV path: ${csvPath}`);
    
    const files = await fs.readdir(csvPath);
    console.log(`Files found: ${files.join(', ')}`);
    
    const csvFile = files.find(file => file.endsWith('.csv'));
    
    if (!csvFile) {
      throw new Error(`No CSV file found for category: ${categoryId}`);
    }
    
    console.log(`Using CSV file: ${csvFile}`);
    const filePath = path.join(csvPath, csvFile);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    console.log(`File content length: ${fileContent.length}`);
    
    const words = parseCSV(fileContent);
    console.log(`Parsed ${words.length} words for category ${categoryId}`);
    console.log(`First 3 words: ${words.slice(0, 3).map(w => w.word).join(', ')}`);
    
    return words;
  } catch (error) {
    console.error(`Error loading words from category ${categoryId}:`, error);
    return [];
  }
}

// Cache word data for 24 hours since it doesn't change often
export const getCategoryWords = cache(
  async (categoryId: string, limit?: number): Promise<WordEntry[]> => {
    try {
      const words = await loadWordsFromCategory(categoryId);
      if (words.length === 0) {
        console.warn(`No words loaded for category ${categoryId}, returning fallback data`);
        return getFallbackWords(categoryId);
      }
      console.log(`Successfully loaded ${words.length} words for category ${categoryId}`);
      return limit ? words.slice(0, limit) : words;
    } catch (error) {
      console.error(`Error loading words from category ${categoryId}:`, error);
      return getFallbackWords(categoryId);
    }
  },
  ['category-words-v3'], // Changed cache key to bust old cache
  {
    revalidate: 86400, // Revalidate every 24 hours
  }
);

function getFallbackWords(categoryId: string): WordEntry[] {
  const fallbackData: Record<string, string[]> = {
    verb: ['biti', 'imati', 'moći', 'reći', 'ići', 'doći', 'videti', 'znati', 'dati', 'naći', 'hteti', 'trebati', 'raditi', 'živeti', 'voleti', 'govoriti', 'učiti', 'pisati', 'čitati', 'voziti'],
    noun: ['kuća', 'čovek', 'dan', 'vreme', 'zemlja', 'rad', 'deo', 'mesto', 'pitanje', 'grad', 'godina', 'srbija', 'problem', 'život', 'ruka', 'oko', 'glava', 'srce', 'posao', 'škola'],
    adj: ['veliki', 'novi', 'dobar', 'mali', 'isti', 'potreban', 'evropski', 'srpski', 'stari', 'ostali', 'važan', 'pravi', 'glavni', 'kratki', 'dugačak', 'širok', 'visok', 'nizak', 'jak', 'slab'],
    word: ['i', 'u', 'da', 'se', 'na', 'za', 'je', 'od', 'sa', 'do', 'ako', 'kad', 'što', 'kako', 'zašto', 'gde', 'kada', 'koje', 'koja', 'koji'],
    adv: ['vrlo', 'takođe', 'možda', 'često', 'uvek', 'nikad', 'ponekad', 'danas', 'sutra', 'juče', 'sada', 'ovde', 'tamo', 'lako', 'teško', 'brzo', 'sporo', 'dobro', 'loše', 'mnogo'],
    preposition: ['u', 'na', 'za', 'od', 'sa', 'do', 'iz', 'po', 'bez', 'preko', 'oko', 'kod', 'protiv', 'zbog', 'pre', 'posle', 'tokom', 'među', 'kroz', 'pored'],
    pronoun: ['ja', 'ti', 'on', 'ona', 'ono', 'mi', 'vi', 'oni', 'one', 'ovo', 'to', 'ko', 'što', 'neki', 'svaki', 'naš', 'vaš', 'njihov', 'moj', 'tvoj'],
    conjunction: ['i', 'ali', 'ili', 'da', 'jer', 'ako', 'kad', 'dok', 'čim', 'pošto', 'mada', 'ipak', 'zato', 'dakle', 'međutim', 'nego', 'već', 'pa', 'te', 'ni'],
    numbers: ['jedan', 'dva', 'tri', 'četiri', 'pet', 'šest', 'sedam', 'osam', 'devet', 'deset', 'jedanaest', 'dvanaest', 'trinaest', 'četrnaest', 'petnaest', 'dvadeset', 'trideset', 'sto', 'hiljada', 'milion']
  };

  const words = fallbackData[categoryId] || ['test', 'primer', 'reč', 'tekst', 'jezik'];
  
  return words.map((word, index) => ({
    word,
    frequency: 10000 - (index * 100),
    relativeFrequency: 1000 - (index * 10),
    rank: index + 1
  }));
}

export async function getWordCategories() {
  return WORD_CATEGORIES;
}

export async function testCategoryLoad(categoryId: string) {
  console.log(`Testing category load for: ${categoryId}`);
  const words = await loadWordsFromCategory(categoryId);
  return {
    categoryId,
    wordCount: words.length,
    firstWords: words.slice(0, 5).map(w => ({ word: w.word, rank: w.rank })),
    success: words.length > 0
  };
}

export async function testMixedRandomLoad() {
  console.log('=== TESTING MIXED RANDOM (NO CACHE) ===');

  const allWords: WordEntry[] = [];
  let totalExpected = 0;

  for (const category of ACTUAL_CATEGORIES) {
    console.log(`\n--- Loading ${category.name} ---`);
    const categoryWords = await loadWordsFromCategory(category.id);
    const wordsToTake = Math.min(50, categoryWords.length); // Take only 50 for testing
    totalExpected += wordsToTake;

    console.log(`Available: ${categoryWords.length}, Taking: ${wordsToTake}`);

    const selectedWords = categoryWords.slice(0, wordsToTake).map(word => ({
      ...word,
      category: category.name,
      categoryId: category.id,
      categoryIcon: category.icon
    }));

    allWords.push(...selectedWords);
    console.log(`Added: ${selectedWords.length}, Running total: ${allWords.length}`);
  }

  console.log(`\n=== FINAL RESULTS ===`);
  console.log(`Expected total: ${totalExpected}`);
  console.log(`Actual total: ${allWords.length}`);
  console.log(`Categories processed: ${ACTUAL_CATEGORIES.length}`);

  return {
    totalWords: allWords.length,
    expectedTotal: totalExpected,
    categoriesProcessed: ACTUAL_CATEGORIES.length,
    wordsPerCategory: ACTUAL_CATEGORIES.map(cat => ({
      name: cat.name,
      count: allWords.filter(w => w.categoryId === cat.id).length
    }))
  };
}

// Cache example sentences for an hour like translations
export const getExampleSentences = cache(
  async (serbianWord: string, englishTranslation: string, partOfSpeech?: string) => {
    try {
      const result = await generateExampleSentences({
        serbianWord,
        englishTranslation,
        partOfSpeech
      });
      return result.examples;
    } catch (error) {
      console.error(`Error generating examples for "${serbianWord}":`, error);
      return [];
    }
  },
  ['serbian-examples'],
  {
    revalidate: 3600, // Revalidate the cache every hour
  }
);

// Load ALL words from all categories mixed together
export const getMixedRandomWords = cache(
  async (): Promise<WordEntry[]> => {
    try {
      console.log(`Loading ALL words from all categories for mixed random mode`);
      
      const allWords: WordEntry[] = [];
      
      // Load ALL words from each actual category (excluding mixed-random)
      for (const category of ACTUAL_CATEGORIES) {
        try {
          const categoryWords = await loadWordsFromCategory(category.id);
          
          // Take ALL words from each category and add category info
          const selectedWords = categoryWords.map(word => ({
            ...word,
            category: category.name,
            categoryId: category.id,
            categoryIcon: category.icon
          }));
          
          allWords.push(...selectedWords);
          console.log(`Added ALL ${selectedWords.length} words from ${category.name}`);
          console.log(`Running total so far: ${allWords.length}`);
        } catch (error) {
          console.error(`Error loading category ${category.id}:`, error);
        }
      }
      
      // Shuffle all words together
      const shuffledWords = shuffleArray(allWords);
      console.log(`Mixed random: ${shuffledWords.length} total words from all categories`);
      
      return shuffledWords;
    } catch (error) {
      console.error('Error loading mixed random words:', error);
      return [];
    }
  },
  ['mixed-random-words-all-v1'], // Updated cache key for ALL words
  {
    revalidate: 86400, // Cache for 24 hours since this is a lot of data
  }
);
