export interface WordEntry {
  word: string;
  frequency: number;
  relativeFrequency: number;
  rank: number;
  category?: string;
  categoryId?: string;
  categoryIcon?: string;
}

export interface WordCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const WORD_CATEGORIES: WordCategory[] = [
  { id: 'mixed-random', name: 'Mixed Random', description: 'Random words from all categories', icon: '🎲', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  { id: 'word', name: 'Most Used Words', description: 'Common words across all categories', icon: '📝', color: 'bg-blue-500' },
  { id: 'verb', name: 'Verbs', description: 'Action words and states of being', icon: '🏃', color: 'bg-green-500' },
  { id: 'noun', name: 'Nouns', description: 'People, places, and things', icon: '🏠', color: 'bg-purple-500' },
  { id: 'adj', name: 'Adjectives', description: 'Descriptive words', icon: '🌟', color: 'bg-yellow-500' },
  { id: 'adv', name: 'Adverbs', description: 'Words that modify verbs and adjectives', icon: '⚡', color: 'bg-orange-500' },
  { id: 'preposition', name: 'Prepositions', description: 'Words that show relationships', icon: '🔗', color: 'bg-pink-500' },
  { id: 'pronoun', name: 'Pronouns', description: 'Words that replace nouns', icon: '👤', color: 'bg-indigo-500' },
  { id: 'conjunction', name: 'Conjunctions', description: 'Connecting words', icon: '🤝', color: 'bg-teal-500' },
  { id: 'numbers', name: 'Numbers', description: 'Numerical expressions', icon: '🔢', color: 'bg-red-500' },
];

export const ACTUAL_CATEGORIES = WORD_CATEGORIES.filter(cat => cat.id !== 'mixed-random');

export function parseCSV(content: string): WordEntry[] {
  const lines = content.split('\n');
  const dataLines = lines.slice(3); // Skip header lines (corpus info + column headers)
  
  const words: WordEntry[] = [];
  let rank = 1;
  let skippedCount = 0;
  
  for (const line of dataLines) {
    if (!line.trim()) continue;
    
    const columns = parseCSVLine(line);
    const [item, frequency, relativeFrequency] = columns;
    
    // Handle both 2-column (Item, Frequency) and 3-column (Item, Frequency, Relative frequency) formats
    if (item && frequency) {
      // Clean the word (remove quotes and extra characters)
      const cleanWord = item.replace(/^"(.*)"$/, '$1').trim();
      
      // Skip punctuation and very short entries, but be more permissive
      if (cleanWord.length < 1 || cleanWord === '') {
        skippedCount++;
        continue;
      }
      
      // Skip pure punctuation and very short words, but allow meaningful short words
      if (/^[.,;:!?()[\]{}'"«»„"–—\-_+=@#$%^&*~`…]+$/.test(cleanWord)) {
        skippedCount++;
        continue;
      }
      
      // Skip very short entries unless they are common Serbian words
      if (cleanWord.length === 1 && !/^[aiouAIOU]$/.test(cleanWord)) {
        skippedCount++;
        continue;
      }
      
      const freqNum = parseInt(frequency, 10) || 0;
      const relFreqNum = relativeFrequency ? parseFloat(relativeFrequency) : 0;
      
      words.push({
        word: cleanWord,
        frequency: freqNum,
        relativeFrequency: relFreqNum,
        rank: rank++
      });
    } else {
      skippedCount++;
    }
  }
  
  console.log(`Parsed ${words.length} words, skipped ${skippedCount} entries`);
  return words;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current); // Add the last field
  return result;
}

export function getCategoryById(categoryId: string): WordCategory | undefined {
  return WORD_CATEGORIES.find(cat => cat.id === categoryId);
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}