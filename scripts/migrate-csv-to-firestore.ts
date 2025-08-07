import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { parse } from 'csv-parse/sync';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
const app = initializeApp();
const db = getFirestore(app);

interface CSVWord {
  Item: string;
  Frequency: string;
  'Relative frequency': string;
}

const PART_OF_SPEECH_MAPPING = {
  'adj': 'adj',
  'adv': 'adv', 
  'conjunction': 'conjunction',
  'noun': 'noun',
  'numbers': 'numbers',
  'preposition': 'preposition',
  'pronoun': 'pronoun',
  'verb': 'verb',
  'word': 'word'
};

async function migrateCsvToFirestore() {
  console.log('Starting CSV to Firestore migration...');
  
  const mostUsedDir = join(process.cwd(), 'most-used');
  const categories = Object.keys(PART_OF_SPEECH_MAPPING);
  
  let totalWords = 0;
  const batch = db.batch();
  let batchCount = 0;
  const BATCH_SIZE = 500;

  for (const category of categories) {
    const categoryDir = join(mostUsedDir, category);
    
    try {
      const files = readdirSync(categoryDir).filter(file => file.endsWith('.csv'));
      
      for (const file of files) {
        const filePath = join(categoryDir, file);
        console.log(`Processing ${filePath}...`);
        
        const fileContent = readFileSync(filePath, 'utf-8');
        
        // Parse CSV, skipping the first two header lines
        const lines = fileContent.split('\n').slice(2);
        const csvContent = lines.join('\n');
        
        if (!csvContent.trim()) continue;
        
        try {
          const records = parse(csvContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true
          }) as CSVWord[];

          for (const record of records) {
            if (!record.Item || !record.Frequency) continue;
            
            const docRef = db.collection('words').doc();
            
            batch.set(docRef, {
              item: record.Item.replace(/"/g, ''), // Remove quotes
              frequency: parseInt(record.Frequency.replace(/"/g, '')),
              relativeFrequency: parseFloat(record['Relative frequency'].replace(/"/g, '')),
              partOfSpeech: category,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            
            batchCount++;
            totalWords++;
            
            // Commit batch when it reaches the size limit
            if (batchCount >= BATCH_SIZE) {
              console.log(`Committing batch of ${batchCount} words...`);
              await batch.commit();
              batchCount = 0;
            }
          }
        } catch (parseError) {
          console.error(`Error parsing CSV file ${filePath}:`, parseError);
        }
      }
    } catch (dirError) {
      console.log(`Directory ${categoryDir} not found, skipping...`);
    }
  }
  
  // Commit any remaining items in the batch
  if (batchCount > 0) {
    console.log(`Committing final batch of ${batchCount} words...`);
    await batch.commit();
  }
  
  console.log(`Migration completed! Total words migrated: ${totalWords}`);
}

// Run the migration
migrateCsvToFirestore()
  .then(() => {
    console.log('Migration finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });