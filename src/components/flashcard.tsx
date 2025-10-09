'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BookOpen } from 'lucide-react';
import type { FC } from 'react';

interface FlashcardProps {
  serbianWord: string;
  englishWord: string | null;
  isFlipped: boolean;
  isLoading: boolean;
  onClick: () => void;
  rank?: number;
  frequency?: number;
  category?: string;
  categoryIcon?: string;
  onShowExamples?: () => void;
  showExamplesButton?: boolean;
}

export const Flashcard: FC<FlashcardProps> = ({
  serbianWord,
  englishWord,
  isFlipped,
  isLoading,
  onClick,
  rank,
  frequency,
  category,
  categoryIcon,
  onShowExamples,
  showExamplesButton = false,
}) => {
  const handleExamplesClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip when clicking the button
    onShowExamples?.();
  };

  return (
    <div
      className={cn('group [perspective:1000px] w-full max-w-md h-64', isFlipped && 'is-flipped')}
      role="button"
      aria-label={`Flashcard for ${serbianWord}. Click to flip.`}
    >
      <div
        className="relative h-full w-full rounded-lg shadow-xl transition-transform duration-700 [transform-style:preserve-3d] group-[.is-flipped]:[transform:rotateY(180deg)]"
        onClick={onClick}
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      >
        {/* Front of the card */}
        <Card className="absolute h-full w-full [backface-visibility:hidden] cursor-pointer">
          <CardContent className="flex h-full flex-col items-center justify-center p-6">
            <h2 className="font-headline text-5xl text-primary mb-4">{serbianWord}</h2>
            {(rank || category) && (
              <div className="flex gap-2 flex-wrap justify-center">
                {category && (
                  <Badge variant="default" className="text-xs">
                    {categoryIcon} {category}
                  </Badge>
                )}
                {rank && (
                  <Badge variant="secondary" className="text-xs">
                    #{rank}
                  </Badge>
                )}
                {frequency && (
                  <Badge variant="outline" className="text-xs">
                    {frequency.toLocaleString()} uses
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back of the card */}
        <Card className="absolute h-full w-full [backface-visibility:hidden] [transform:rotateY(180deg)] cursor-pointer">
          <CardContent className="flex h-full flex-col items-center justify-center text-center p-6 gap-4">
            {isLoading ? (
              <Skeleton className="h-12 w-3/4" />
            ) : (
              <>
                <h2 className="font-headline text-5xl text-accent-foreground">{englishWord}</h2>
                {showExamplesButton && onShowExamples && englishWord && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExamplesClick}
                    className="mt-4 gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    See examples in a sentence
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
