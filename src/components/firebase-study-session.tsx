'use client';

import { useState, useEffect, useMemo, useTransition, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Flashcard } from '@/components/flashcard';
import { ExampleSentencesDialog } from '@/components/example-sentences-dialog';
import { getTranslation, getExampleSentences } from '@/app/actions';
import { ArrowLeft, ArrowRight, RefreshCw, Home } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { wordsService } from '@/lib/firestore-service';
import { SerbianWord } from '@/lib/firestore-schemas';

interface FirebaseStudySessionProps {
  categoryId: string;
  studyMode: 'frequency' | 'random' | 'review';
  wordCount: number;
  onBack: () => void;
}

export function FirebaseStudySession({
  categoryId,
  studyMode,
  wordCount,
  onBack,
}: FirebaseStudySessionProps) {

  
  const [words, setWords] = useState<SerbianWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Example sentences state
  const [showExamplesDialog, setShowExamplesDialog] = useState(false);
  const [exampleSentences, setExampleSentences] = useState<Array<{serbian: string; english: string; explanation: string}>>([]);
  const [isLoadingExamples, setIsLoadingExamples] = useState(false);

  // Load words when component mounts
  useEffect(() => {
    const loadWords = async () => {
      try {
        setLoading(true);
        console.log(`Loading words for category: ${categoryId}, mode: ${studyMode}, count: ${wordCount}`);
        
        let loadedWords: SerbianWord[];
        
        if (studyMode === 'random') {
          console.log('Loading random words...');
          loadedWords = await wordsService.getRandomWords(wordCount, categoryId);
        } else {
          console.log('Loading words by category...');
          loadedWords = await wordsService.getWordsByCategory(categoryId, wordCount);
        }
        
        console.log(`Loaded ${loadedWords.length} words:`, loadedWords.slice(0, 3));
        setWords(loadedWords);
      } catch (err) {
        console.error('Error loading words:', err);
        if (err instanceof Error && err.message.includes('permissions')) {
          setError('Firestore permissions error. Please update your Firestore rules to allow public read access.');
        } else {
          setError('Failed to load words. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadWords();
  }, [categoryId, studyMode, wordCount]);



  const currentWord = useMemo(() => words[currentIndex], [words, currentIndex]);
  const currentTranslation = useMemo(() => translations[currentWord?.id], [translations, currentWord?.id]);

  const handleFlip = useCallback(() => {
    const wasFlipped = isFlipped;
    setIsFlipped(!wasFlipped);

    if (!wasFlipped && currentWord && !currentTranslation) {
      startTransition(async () => {
        const translation = await getTranslation(currentWord.item);
        setTranslations(prev => ({ ...prev, [currentWord.id]: translation }));
      });
    }
  }, [isFlipped, currentWord, currentTranslation]);



  const goTo = useCallback((index: number) => {
    if (index >= 0 && index < words.length) {
      setCurrentIndex(index);
      setIsFlipped(false);
    }
  }, [words.length]);
  
  const goToNext = useCallback(() => {
    goTo((currentIndex + 1) % words.length);
  }, [currentIndex, words.length, goTo]);
  
  const goToPrev = useCallback(() => {
    goTo((currentIndex - 1 + words.length) % words.length);
  }, [currentIndex, words.length, goTo]);

  const handleShowExamples = useCallback(async () => {
    if (!currentWord || !currentTranslation) return;

    setShowExamplesDialog(true);
    setIsLoadingExamples(true);
    setExampleSentences([]);

    try {
      const examples = await getExampleSentences(
        currentWord.item,
        currentTranslation,
        currentWord.partOfSpeech
      );
      setExampleSentences(examples);
    } catch (error) {
      console.error('Error loading examples:', error);
    } finally {
      setIsLoadingExamples(false);
    }
  }, [currentWord, currentTranslation]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          event.preventDefault();
          goToPrev();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          event.preventDefault();
          goToNext();
          break;
        case ' ':
        case 'f':
        case 'F':
          event.preventDefault();
          handleFlip();
          break;
        case 'e':
        case 'E':
          if (isFlipped && currentTranslation) {
            event.preventDefault();
            handleShowExamples();
          }
          break;
        case 'Escape':
          event.preventDefault();
          onBack();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [goToPrev, goToNext, handleFlip, handleShowExamples, isFlipped, currentTranslation, onBack]);



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E63946] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading words...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
          <Button onClick={onBack} className="mt-4">
            Go Back
          </Button>
        </Alert>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertDescription>
            No words found for this category. Please try another category.
          </AlertDescription>
          <Button onClick={onBack} className="mt-4">
            Go Back
          </Button>
        </Alert>
      </div>
    );
  }

  if (!currentWord) {
    return null;
  }

  const progress = {
    current: currentIndex + 1,
    total: words.length,
    percent: Math.round(((currentIndex + 1) / words.length) * 100)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col p-4 sm:p-6">
      {/* Header with progress */}
      <div className="text-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2 capitalize">
          {categoryId} Study
        </h1>
        
        <div className="max-w-sm mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs sm:text-sm text-slate-600">Progress</span>
            <Badge variant="secondary" className="text-xs">
              {progress.current}/{progress.total}
            </Badge>
          </div>
          <Progress value={progress.percent} className="h-1.5 sm:h-2" />
        </div>
      </div>

      {/* Flashcard */}
      <div className="flex-1 flex items-center justify-center mb-4 sm:mb-6">
        <div className="w-full max-w-sm sm:max-w-md" style={{ minHeight: '12rem' }}>
          <Flashcard
            serbianWord={currentWord.item}
            englishWord={currentTranslation}
            isFlipped={isFlipped}
            isLoading={isPending}
            onClick={handleFlip}
            category={currentWord.partOfSpeech}
            onShowExamples={handleShowExamples}
            showExamplesButton={isFlipped && !!currentTranslation}
          />
        </div>
      </div>

      {/* Example Sentences Dialog */}
      <ExampleSentencesDialog
        open={showExamplesDialog}
        onOpenChange={setShowExamplesDialog}
        serbianWord={currentWord.item}
        englishTranslation={currentTranslation || ''}
        examples={exampleSentences}
        isLoading={isLoadingExamples}
      />

      {/* Controls */}
      <div className="w-full max-w-sm sm:max-w-md mx-auto space-y-3 sm:space-y-4">
        <div className="flex gap-2">
          <Button onClick={goToPrev} variant="outline" className="flex-1 h-10 sm:h-12" aria-label="Previous (A or ←)">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          
          <Button 
            onClick={handleFlip} 
            className="flex-2 px-4 sm:px-6 h-10 sm:h-12 text-sm sm:text-base"
            aria-label="Flip (Space or F)"
          >
            <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 transition-transform duration-500 ${isFlipped ? 'rotate-180' : ''}`} />
            {isFlipped ? 'Serbian' : 'English'}
          </Button>
          
          <Button onClick={goToNext} variant="outline" className="flex-1 h-10 sm:h-12" aria-label="Next (D or →)">
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        <Button onClick={onBack} variant="outline" className="w-full h-9 sm:h-10 text-sm">
          <Home className="h-4 w-4 mr-2" />
          End Session
        </Button>

        <div className="text-center space-y-1">
          <div className="text-sm text-slate-600">
            {currentIndex + 1} of {words.length}
          </div>
          <div className="text-xs text-slate-500 hidden sm:block">
            A/← Previous • D/→ Next • Space/F Flip • Esc Exit
          </div>
        </div>
      </div>
    </div>
  );
}