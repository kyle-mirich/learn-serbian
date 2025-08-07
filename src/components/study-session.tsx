'use client';

import { useState, useMemo, useTransition, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Flashcard } from '@/components/flashcard';
import { getTranslation } from '@/app/actions';
import { ArrowLeft, ArrowRight, RefreshCw, Home, CheckCircle } from 'lucide-react';
import { WordEntry, getCategoryById, shuffleArray } from '@/lib/word-data';
import { StudyMode } from '@/components/study-mode-selector';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface StudySessionProps {
  categoryId: string;
  words: WordEntry[];
  studyMode: StudyMode;
  onBack: () => void;
  onWordStudied: (word: string) => void;
  studiedWords: Set<string>;
}

export function StudySession({
  categoryId,
  words,
  studyMode,
  onBack,
  onWordStudied,
  studiedWords
}: StudySessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const category = getCategoryById(categoryId);
  
  const studyWords = useMemo(() => {
    if (studyMode === 'random') {
      return shuffleArray(words);
    }
    return words;
  }, [words, studyMode]);

  const currentWord = useMemo(() => studyWords[currentIndex], [studyWords, currentIndex]);
  const currentTranslation = useMemo(() => translations[currentWord?.word], [translations, currentWord]);

  const progress = useMemo(() => {
    const total = studyWords.length;
    const studied = studyWords.filter(word => studiedWords.has(word.word)).length;
    return { studied, total, percent: total > 0 ? Math.round((studied / total) * 100) : 0 };
  }, [studyWords, studiedWords]);

  const handleFlip = useCallback(() => {
    const wasFlipped = isFlipped;
    setIsFlipped(!wasFlipped);

    if (!wasFlipped && currentWord && !currentTranslation) {
      startTransition(async () => {
        const translation = await getTranslation(currentWord.word);
        setTranslations(prev => ({ ...prev, [currentWord.word]: translation }));
      });
    }
  }, [isFlipped, currentWord, currentTranslation]);

  const markAsStudied = useCallback(() => {
    if (currentWord) {
      onWordStudied(currentWord.word);
    }
  }, [currentWord, onWordStudied]);

  const goTo = useCallback((index: number) => {
    if (index >= 0 && index < studyWords.length) {
      setCurrentIndex(index);
      setIsFlipped(false);
    }
  }, [studyWords.length]);
  
  const goToNext = useCallback(() => {
    goTo((currentIndex + 1) % studyWords.length);
  }, [currentIndex, studyWords.length, goTo]);
  
  const goToPrev = useCallback(() => {
    goTo((currentIndex - 1 + studyWords.length) % studyWords.length);
  }, [currentIndex, studyWords.length, goTo]);

  if (!currentWord || !category) {
    return null;
  }

  const isCurrentWordStudied = studiedWords.has(currentWord.word);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      {/* Header with category info and progress */}
      <div className="text-center mb-6 w-full max-w-2xl">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${category.color}`}>
            {category.icon}
          </div>
          <div>
            <h1 className="font-headline text-3xl font-bold text-primary">{category.name}</h1>
            <p className="text-muted-foreground font-body">{studyMode === 'random' ? 'Random Order' : 'Frequency Order'}</p>
          </div>
        </div>
        
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <Badge variant="secondary">
                {progress.studied}/{progress.total}
              </Badge>
            </div>
            <Progress value={progress.percent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1 text-center">
              {progress.percent}% of words studied
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Flashcard */}
      <div className="w-full max-w-md mb-6 flex items-center justify-center" style={{ minHeight: '16rem' }}>
        <Flashcard
          serbianWord={currentWord.word}
          englishWord={currentTranslation}
          isFlipped={isFlipped}
          isLoading={isPending}
          onClick={handleFlip}
          rank={currentWord.rank}
          frequency={currentWord.frequency}
          category={currentWord.category}
          categoryIcon={currentWord.categoryIcon}
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

        <div className="flex gap-2 w-full">
          {!isCurrentWordStudied && (
            <Button 
              onClick={markAsStudied} 
              variant="default" 
              size="sm" 
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Studied
            </Button>
          )}
          
          <Button onClick={onBack} variant="outline" size="sm" className="flex-1">
            <Home className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
        </div>

        <div className="text-center">
          <div className="text-sm text-muted-foreground font-body mb-1">
            Card {currentIndex + 1} of {studyWords.length}
          </div>
          {isCurrentWordStudied && (
            <Badge variant="default" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Studied
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}