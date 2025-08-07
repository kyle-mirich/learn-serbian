import { wordsService } from './firestore-service';

interface CSVWord {
  item: string;
  frequency: number;
  relativeFrequency: number;
  partOfSpeech: 'adj' | 'adv' | 'conjunction' | 'noun' | 'numbers' | 'preposition' | 'pronoun' | 'verb' | 'word';
}

// Parse CSV data from the existing word-data.ts structure
export async function migrateCsvDataToFirestore() {
  console.log('Starting CSV data migration to Firestore...');
  
  const categories = ['adj', 'adv', 'conjunction', 'noun', 'numbers', 'preposition', 'pronoun', 'verb'];
  let totalMigrated = 0;
  
  for (const category of categories) {
    try {
      // Fetch CSV data
      const csvData = await fetchCategoryData(category);
      
      if (csvData.length > 0) {
        console.log(`Migrating ${csvData.length} ${category} words...`);
        
        // Process in smaller batches to avoid timeouts
        const batchSize = 50; // Smaller batches for better reliability
        for (let i = 0; i < csvData.length; i += batchSize) {
          const batch = csvData.slice(i, i + batchSize);
          try {
            await wordsService.batchAddWords(batch);
            totalMigrated += batch.length;
            console.log(`Migrated ${totalMigrated} words so far (${category}: ${Math.min(i + batchSize, csvData.length)}/${csvData.length})`);
            
            // Add a small delay between batches to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (batchError) {
            console.error(`Error migrating batch for ${category}:`, batchError);
          }
        }
      } else {
        console.log(`No data found for category: ${category}`);
      }
    } catch (error) {
      console.error(`Error migrating ${category}:`, error);
    }
  }
  
  console.log(`Migration completed! Total words migrated: ${totalMigrated}`);
  return totalMigrated;
}

async function fetchCategoryData(category: string): Promise<CSVWord[]> {
  try {
    console.log(`Fetching data for category: ${category}`);
    const response = await fetch(`/api/csv-data/${category}`);
    if (response.ok) {
      const data = await response.json();
      console.log(`Loaded ${data.length} words for ${category}`);
      return data;
    } else {
      console.error(`Failed to fetch ${category}: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error fetching ${category} data:`, error);
  }
  return [];
}

// Helper function to parse CSV text content
export function parseCsvContent(csvContent: string, partOfSpeech: 'adj' | 'adv' | 'conjunction' | 'noun' | 'numbers' | 'preposition' | 'pronoun' | 'verb' | 'word'): CSVWord[] {
  const lines = csvContent.split('\n');
  const words: CSVWord[] = [];
  
  // Skip header lines (first 3 lines based on your CSV format)
  for (let i = 3; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV line - handle quotes and commas
    const matches = line.match(/^"([^"]*)",(\d+),([0-9.]+)$/);
    if (matches) {
      const [, item, frequency, relativeFrequency] = matches;
      words.push({
        item: item,
        frequency: parseInt(frequency),
        relativeFrequency: parseFloat(relativeFrequency),
        partOfSpeech
      });
    }
  }
  
  return words;
}