'use client';

import { useState, useEffect, useMemo } from 'react';
import { CategoryGrid } from '@/components/category-grid';
import { StudyModeSelector, StudyMode } from '@/components/study-mode-selector';
import { StudySession } from '@/components/study-session';
import { getCategoryWords, getWordCategories, getMixedRandomWords } from '@/app/actions';
import { WordCategory, WordEntry } from '@/lib/word-data';
import { 
  getStoredProgress, 
  saveProgress, 
  getProgressSummary, 
  markWordAsStudied,
  initializeCategoryProgress,
  StudyProgress 
} from '@/lib/progress';

type AppState = 'categories' | 'study-mode' | 'studying';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('categories');
  const [categories, setCategories] = useState<WordCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [studyMode, setStudyMode] = useState<StudyMode>('sequential');
  const [categoryWords, setCategoryWords] = useState<WordEntry[]>([]);
  const [progress, setProgress] = useState<StudyProgress>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load categories and progress on mount
  useEffect(() => {
    const loadInitialData = async () => {
      const categoriesData = await getWordCategories();
      setCategories(categoriesData);
      setProgress(getStoredProgress());
    };

    loadInitialData();
  }, []);

  // Save progress whenever it changes
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const progressSummary = useMemo(() => getProgressSummary(progress), [progress]);

  const selectedCategory = useMemo(() => 
    categories.find(cat => cat.id === selectedCategoryId), 
    [categories, selectedCategoryId]
  );

  const studiedWordsSet = useMemo(() => 
    progress[selectedCategoryId]?.studiedWords || new Set<string>(),
    [progress, selectedCategoryId]
  );

  const handleSelectCategory = async (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setIsLoading(true);

    try {
      let words: WordEntry[] = [];
      
      if (categoryId === 'mixed-random') {
        // Load mixed random words from all categories
        words = await getMixedRandomWords(); // ALL words from all categories
        setStudyMode('random'); // Force random mode for mixed
      } else {
        // Load all words for the selected category
        words = await getCategoryWords(categoryId);
      }
      
      setCategoryWords(words);
      
      // Initialize progress for this category
      setProgress(prev => initializeCategoryProgress(prev, categoryId, words.length));
      
      setAppState('study-mode');
    } catch (error) {
      console.error('Error loading category words:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartStudying = () => {
    setAppState('studying');
  };

  const handleBackToCategories = () => {
    setAppState('categories');
    setSelectedCategoryId('');
    setCategoryWords([]);
  };

  const handleBackToStudyMode = () => {
    setAppState('study-mode');
  };

  const handleWordStudied = (word: string) => {
    setProgress(prev => markWordAsStudied(prev, selectedCategoryId, word));
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading words...</p>
        </div>
      </main>
    );
  }

  if (appState === 'studying' && selectedCategory) {
    return (
      <StudySession
        categoryId={selectedCategoryId}
        words={categoryWords}
        studyMode={studyMode}
        onBack={handleBackToStudyMode}
        onWordStudied={handleWordStudied}
        studiedWords={studiedWordsSet}
      />
    );
  }

  if (appState === 'study-mode' && selectedCategory) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-2">Serbian Flash</h1>
          <p className="font-body text-muted-foreground text-lg">Учимо srpski! (Let's learn Serbian!)</p>
        </div>

        <StudyModeSelector
          category={selectedCategory}
          studyMode={studyMode}
          onStudyModeChange={setStudyMode}
          onStartStudying={handleStartStudying}
          wordCount={categoryWords.length}
          progress={progressSummary[selectedCategoryId] || { studied: 0, total: 0 }}
        />

        <div className="mt-6">
          <button
            onClick={handleBackToCategories}
            className="text-muted-foreground hover:text-primary transition-colors text-sm"
          >
            ← Back to categories
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="text-center mb-8">
        <h1 className="font-headline text-5xl md:text-6xl font-bold text-primary mb-2">Serbian Flash</h1>
        <p className="font-body text-muted-foreground text-lg">Учимо српски! (Let's learn Serbian!)</p>
        <p className="font-body text-muted-foreground text-sm mt-2">Choose a category to start learning</p>
      </div>

      <CategoryGrid
        categories={categories}
        selectedCategory={selectedCategoryId}
        onSelectCategory={handleSelectCategory}
        progress={progressSummary}
      />
    </main>
  );
}
