'use client';

import { useState, useMemo, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Flashcard } from '@/components/flashcard';
import { getTranslation } from '@/app/actions';
import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';

const serbianWords = [
  "kuća",
  "pas",
  "mačka",
  "knjiga",
  "drvo",
  "sunce",
  "voda",
  "nebo",
  "ljubav",
  "prijatelj"
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const currentWord = useMemo(() => serbianWords[currentIndex], [currentIndex]);
  const currentTranslation = useMemo(() => translations[currentWord], [translations, currentWord]);

  const handleFlip = () => {
    const wasFlipped = isFlipped;
    setIsFlipped(!wasFlipped);

    if (!wasFlipped && !currentTranslation) {
      startTransition(async () => {
        const translation = await getTranslation(currentWord);
        setTranslations(prev => ({ ...prev, [currentWord]: translation }));
      });
    }
  };

  const goTo = (index: number) => {
    if (index >= 0 && index < serbianWords.length) {
      setCurrentIndex(index);
      setIsFlipped(false);
    }
  };
  
  const goToNext = () => goTo((currentIndex + 1) % serbianWords.length);
  const goToPrev = () => goTo((currentIndex - 1 + serbianWords.length) % serbianWords.length);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="text-center mb-8">
        <h1 className="font-headline text-5xl md:text-6xl font-bold text-primary">Serbian Flash</h1>
        <p className="font-body text-muted-foreground mt-2 text-lg">Учимо српски! (Let's learn Serbian!)</p>
      </div>

      <div className="w-full max-w-md mb-8 flex items-center justify-center" style={{ minHeight: '16rem' }}>
        <Flashcard
          serbianWord={currentWord}
          englishWord={currentTranslation}
          isFlipped={isFlipped}
          isLoading={isPending}
          onClick={handleFlip}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
        <div className="flex gap-4 w-full sm:w-auto">
          <Button onClick={goToPrev} variant="outline" size="lg" className="flex-1 sm:flex-none" aria-label="Previous card">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <Button onClick={goToNext} variant="outline" size="lg" className="flex-1 sm:flex-none" aria-label="Next card">
            <ArrowRight className="h-6 w-6" />
          </Button>
        </div>
        <Button onClick={handleFlip} size="lg" className="w-full sm:flex-1" aria-label="Flip card">
          <RefreshCw className={`h-6 w-6 mr-2 transition-transform duration-500 ${isFlipped ? 'rotate-180' : ''}`} />
          {isFlipped ? 'Flip to Serbian' : 'Reveal English'}
        </Button>
      </div>
        <div className="mt-4 text-sm text-muted-foreground font-body">
            Card {currentIndex + 1} of {serbianWords.length}
        </div>
    </main>
  );
}
