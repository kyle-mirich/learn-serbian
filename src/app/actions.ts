'use server';

import { translateSerbianWord } from '@/ai/flows/translate-serbian-word';
import { unstable_cache as cache } from 'next/cache';

// Using unstable_cache to cache translations across requests for an hour.
export const getTranslation = cache(
  async (serbianWord: string): Promise<string> => {
    try {
      const result = await translateSerbianWord({ serbianWord });
      return result.englishTranslation;
    } catch (error) {
      console.error(`Error translating "${serbianWord}":`, error);
      // Return a user-friendly error message
      return 'Could not get translation.';
    }
  },
  ['serbian-translations'], // A unique identifier for this cache segment
  {
    revalidate: 3600, // Revalidate the cache every hour
  }
);
