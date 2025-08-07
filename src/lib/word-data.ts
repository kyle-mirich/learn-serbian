import { promises as fs } from 'fs';
import path from 'path';

export interface WordEntry {
  word: string;
  frequency: number;
  relativeFrequency: number;
  rank: number;
}

export interface WordCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const WORD_CATEGORIES: WordCategory[] = [
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

export async function loadWordsFromCategory(categoryId: string): Promise<WordEntry[]> {
  try {
    const csvPath = path.join(process.cwd(), 'most-used', categoryId);
    const files = await fs.readdir(csvPath);
    const csvFile = files.find(file => file.endsWith('.csv'));
    
    if (!csvFile) {
      throw new Error(`No CSV file found for category: ${categoryId}`);
    }
    
    const filePath = path.join(csvPath, csvFile);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    return parseCSV(fileContent);
  } catch (error) {
    console.error(`Error loading words from category ${categoryId}:`, error);
    return [];
  }
}

function parseCSV(content: string): WordEntry[] {
  const lines = content.split('\n');
  const dataLines = lines.slice(3); // Skip header lines (corpus info + column headers)
  
  const words: WordEntry[] = [];
  let rank = 1;
  
  for (const line of dataLines) {
    if (!line.trim()) continue;
    
    const [item, frequency, relativeFrequency] = parseCSVLine(line);
    
    if (item && frequency && relativeFrequency) {
      // Clean the word (remove quotes and extra characters)
      const cleanWord = item.replace(/^"(.*)"$/, '$1').trim();
      
      // Skip punctuation and very short entries
      if (cleanWord.length < 2 || /^[^\p{L}]+$/u.test(cleanWord)) {
        continue;
      }
      
      words.push({
        word: cleanWord,
        frequency: parseInt(frequency, 10),
        relativeFrequency: parseFloat(relativeFrequency),
        rank: rank++
      });
    }
  }
  
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