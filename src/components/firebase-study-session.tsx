'use client';

import { useState, useEffect, useMemo, useTransition, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Flashcard } from '@/components/flashcard';
import { getTranslation } from '@/app/actions';
import { ArrowLeft, ArrowRight, RefreshCw, Home, CheckCircle, X, ThumbsUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth-context';
import { useProgress } from '@/hooks/use-progress';
import { wordsService } from '@/lib/firestore-service';
import { SerbianWord } from '@/lib/firestore-schemas';

interface FirebaseStudySessionProps {
  categoryId: string;
  studyMode: 'frequency' | 'random' | 'review';
  onBack: () => void;
}

export function FirebaseStudySession({
  categoryId,
  studyMode,
  onBack,
}: FirebaseStudySessionProps) {
  const { user } = useAuth();
  const { startSession, endSession, recordAnswer, sessionStats, currentSession, getWordsForReview } = useProgress();
  
  const [words, setWords] = useState<SerbianWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load words when component mounts
  useEffect(() => {
    const loadWords = async () => {
      try {
        setLoading(true);
        console.log(`Loading words for category: ${categoryId}, mode: ${studyMode}`);
        
        let loadedWords: SerbianWord[];
        
        if (studyMode === 'review') {
          // Load words that need review
          console.log('Loading review words...');
          const reviewProgress = await getWordsForReview(20);
          const wordIds = reviewProgress.map(p => p.wordId);
          loadedWords = await Promise.all(
            wordIds.map(id => wordsService.getWordById(id)).filter(Boolean)
          ) as SerbianWord[];
        } else if (studyMode === 'random') {
          console.log('Loading random words...');
          loadedWords = await wordsService.getRandomWords(20, categoryId);
        } else {
          console.log('Loading words by category...');
          loadedWords = await wordsService.getWordsByCategory(categoryId, 20);
        }
        
        console.log(`Loaded ${loadedWords.length} words:`, loadedWords.slice(0, 3));
        setWords(loadedWords);
        
        // Start a session
        if (user) {
          await startSession(studyMode === 'review' ? 'review' : 'flashcard');
        }
      } catch (err) {
        console.error('Error loading words:', err);
        setError('Failed to load words. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadWords();
    }
  }, [categoryId, studyMode, user]);

  // End session when component unmounts
  useEffect(() => {
    return () => {
      if (currentSession) {
        endSession();
      }
    };
  }, [currentSession]);

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

  const handleAnswer = useCallback(async (isCorrect: boolean) => {
    if (!currentWord || !user) return;
    
    await recordAnswer(currentWord.id, isCorrect);
    
    // Auto-advance to next word after a short delay
    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      }
    }, 1000);
  }, [currentWord, user, recordAnswer, currentIndex, words.length]);

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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertDescription>
            Please sign in to access the study session.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      {/* Header with progress */}
      <div className="text-center mb-6 w-full max-w-2xl">
        <div className="mb-4">
          <h1 className="font-headline text-3xl font-bold text-primary mb-2">
            {studyMode === 'review' ? 'Review Session' : `${categoryId} Study`}
          </h1>
          <p className="text-muted-foreground font-body">
            {studyMode === 'random' ? 'Random Order' : studyMode === 'review' ? 'Spaced Repetition' : 'Frequency Order'}
          </p>
        </div>
        
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Session Progress</span>
              <Badge variant="secondary">
                {progress.current}/{progress.total}
              </Badge>
            </div>
            <Progress value={progress.percent} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Correct: {sessionStats.correctAnswers}</span>
              <span>Total: {sessionStats.totalAnswers}</span>
              <span>Accuracy: {sessionStats.totalAnswers > 0 ? Math.round((sessionStats.correctAnswers / sessionStats.totalAnswers) * 100) : 0}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flashcard */}
      <div className="w-full max-w-md mb-6 flex items-center justify-center" style={{ minHeight: '16rem' }}>
        <Flashcard
          serbianWord={currentWord.item}
          englishWord={currentTranslation}
          isFlipped={isFlipped}
          isLoading={isPending}
          onClick={handleFlip}
          rank={currentIndex + 1}
          frequency={currentWord.frequency}
          category={currentWord.partOfSpeech}
          categoryIcon=""
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        <div className="flex gap-2 w-full">
          <Button onClick={goToPrev} variant="outline" size="lg" className="flex-1" aria-label="Previous card">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Button 
            onClick={handleFlip} 
            size="lg" 
            className="flex-2 px-6"
            aria-label="Flip card"
          >
            <RefreshCw className={`h-5 w-5 mr-2 transition-transform duration-500 ${isFlipped ? 'rotate-180' : ''}`} />
            {isFlipped ? 'Serbian' : 'English'}
          </Button>
          
          <Button onClick={goToNext} variant="outline" size="lg" className="flex-1" aria-label="Next card">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Answer buttons - only show when card is flipped */}
        {isFlipped && currentTranslation && (
          <div className="flex gap-2 w-full">
            <Button 
              onClick={() => handleAnswer(false)} 
              variant="outline" 
              size="lg" 
              className="flex-1 border-red-200 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-2 text-red-500" />
              Incorrect
            </Button>
            
            <Button 
              onClick={() => handleAnswer(true)} 
              variant="outline" 
              size="lg" 
              className="flex-1 border-green-200 hover:bg-green-50"
            >
              <ThumbsUp className="h-4 w-4 mr-2 text-green-500" />
              Correct
            </Button>
          </div>
        )}

        <div className="flex gap-2 w-full">
          <Button onClick={onBack} variant="outline" size="sm" className="flex-1">
            <Home className="h-4 w-4 mr-2" />
            End Session
          </Button>
        </div>

        <div className="text-center">
          <div className="text-sm text-muted-foreground font-body">
            Word {currentIndex + 1} of {words.length}
          </div>
        </div>
      </div>
    </div>
  );
}