'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Lightbulb } from 'lucide-react';
import type { FC } from 'react';

interface ExampleSentence {
  serbian: string;
  english: string;
  explanation: string;
}

interface ExampleSentencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serbianWord: string;
  englishTranslation: string;
  examples: ExampleSentence[];
  isLoading: boolean;
}

export const ExampleSentencesDialog: FC<ExampleSentencesDialogProps> = ({
  open,
  onOpenChange,
  serbianWord,
  englishTranslation,
  examples,
  isLoading,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
            <BookOpen className="h-6 w-6 text-primary" />
            Examples for "{serbianWord}"
          </DialogTitle>
          <DialogDescription className="font-body">
            Learn how to use <span className="font-semibold text-primary">{serbianWord}</span> ({englishTranslation}) in different contexts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-5 w-5/6 mb-3" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : examples.length > 0 ? (
            examples.map((example, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      Example {index + 1}
                    </Badge>
                    <p className="font-headline text-lg text-primary mb-1">
                      {example.serbian}
                    </p>
                    <p className="font-body text-muted-foreground italic">
                      {example.english}
                    </p>
                  </div>

                  <div className="flex gap-2 items-start bg-accent/50 p-3 rounded-md">
                    <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-body">
                      {example.explanation}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground font-body">
                  No examples available. Please try again.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
