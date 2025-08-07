import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { parseCsvContent } from '@/lib/csv-migrator';

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const { category } = params;
    
    // Validate category
    const validCategories = ['adj', 'adv', 'conjunction', 'noun', 'numbers', 'preposition', 'pronoun', 'verb', 'word'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }
    
    const categoryDir = join(process.cwd(), 'most-used', category);
    
    try {
      const files = readdirSync(categoryDir).filter(file => file.endsWith('.csv'));
      
      if (files.length === 0) {
        return NextResponse.json({ error: 'No CSV files found' }, { status: 404 });
      }
      
      // Read the first CSV file in the category
      const filePath = join(categoryDir, files[0]);
      const fileContent = readFileSync(filePath, 'utf-8');
      
      // Parse the CSV content
      const words = parseCsvContent(fileContent, category as 'adj' | 'adv' | 'conjunction' | 'noun' | 'numbers' | 'preposition' | 'pronoun' | 'verb' | 'word');
      
      return NextResponse.json(words);
    } catch (error) {
      console.error(`Error reading category ${category}:`, error);
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}