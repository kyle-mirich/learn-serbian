'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { FC } from 'react';

interface FlashcardProps {
  serbianWord: string;
  englishWord: string | null;
  isFlipped: boolean;
  isLoading: boolean;
  onClick: () => void;
}

export const Flashcard: FC<FlashcardProps> = ({
  serbianWord,
  englishWord,
  isFlipped,
  isLoading,
  onClick,
}) => {
  return (
    <div
      className={cn('group [perspective:1000px] w-full max-w-md h-64 cursor-pointer', isFlipped && 'is-flipped')}
      onClick={onClick}
      role="button"
      aria-label={`Flashcard for ${serbianWord}. Click to flip.`}
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <div
        className="relative h-full w-full rounded-lg shadow-xl transition-transform duration-700 [transform-style:preserve-3d] group-[.is-flipped]:[transform:rotateY(180deg)]"
      >
        {/* Front of the card */}
        <Card className="absolute h-full w-full [backface-visibility:hidden]">
          <CardContent className="flex h-full items-center justify-center">
            <h2 className="font-headline text-5xl text-primary">{serbianWord}</h2>
          </CardContent>
        </Card>

        {/* Back of the card */}
        <Card className="absolute h-full w-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <CardContent className="flex h-full items-center justify-center text-center p-6">
            {isLoading ? (
              <Skeleton className="h-12 w-3/4" />
            ) : (
              <h2 className="font-headline text-5xl text-accent-foreground">{englishWord}</h2>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
