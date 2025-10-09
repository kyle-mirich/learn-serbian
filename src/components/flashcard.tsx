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
        <Card className="absolute h-full w-full [backface-visibility:hidden] cursor-pointer border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-slate-800 mb-4 leading-tight">{serbianWord}</h2>
            {category && (
              <Badge variant="outline" className="text-xs mt-2">
                {category}
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Back of the card */}
        <Card className="absolute h-full w-full [backface-visibility:hidden] [transform:rotateY(180deg)] cursor-pointer border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="flex h-full flex-col items-center justify-center text-center p-6 gap-4">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
                <p className="text-sm text-slate-600">Getting translation...</p>
              </div>
            ) : (
              <>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-slate-800 leading-tight">{englishWord}</h2>
                {showExamplesButton && onShowExamples && englishWord && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExamplesClick}
                    className="mt-4 gap-2 text-xs sm:text-sm"
                  >
                    <BookOpen className="h-4 w-4" />
                    Examples
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
