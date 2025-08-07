'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, Shuffle, BarChart3, Target } from 'lucide-react';
import { WordCategory } from '@/lib/word-data';
import { cn } from '@/lib/utils';

export type StudyMode = 'sequential' | 'random';

interface StudyModeSelectorProps {
  category: WordCategory;
  studyMode: StudyMode;
  onStudyModeChange: (mode: StudyMode) => void;
  onStartStudying: () => void;
  wordCount: number;
  progress: { studied: number; total: number };
}

export function StudyModeSelector({
  category,
  studyMode,
  onStudyModeChange,
  onStartStudying,
  wordCount,
  progress
}: StudyModeSelectorProps) {
  const progressPercent = progress.total > 0 
    ? Math.round((progress.studied / progress.total) * 100) 
    : 0;

  const isMixedRandom = category.id === 'mixed-random';

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center text-3xl text-white',
            category.id === 'mixed-random' 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
              : category.color
          )}>
            {category.icon}
          </div>
        </div>
        <CardTitle className="font-headline text-2xl">{category.name}</CardTitle>
        <p className="text-muted-foreground font-body">{category.description}</p>
        
        <div className="flex justify-center gap-4 mt-4">
          <Badge variant="outline" className="flex items-center gap-1">
            <BarChart3 className="w-4 h-4" />
            {wordCount} words
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            {progressPercent}% completed
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {isMixedRandom ? (
          <div>
            <h3 className="font-headline text-lg font-semibold mb-3 text-center">Mixed Random Mode</h3>
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border">
              <Shuffle className="w-12 h-12 text-primary mx-auto mb-2" />
              <p className="text-muted-foreground font-body">
                Words from all categories mixed together in random order. Each word shows its category for context.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="font-headline text-lg font-semibold mb-3">Choose Study Mode</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card 
                className={`cursor-pointer border-2 transition-all ${
                  studyMode === 'sequential' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onStudyModeChange('sequential')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <ArrowUpDown className="w-8 h-8 text-primary" />
                    <div>
                      <h4 className="font-medium">Sequential</h4>
                      <p className="text-sm text-muted-foreground">
                        Study words in frequency order
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer border-2 transition-all ${
                  studyMode === 'random' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onStudyModeChange('random')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shuffle className="w-8 h-8 text-primary" />
                    <div>
                      <h4 className="font-medium">Random</h4>
                      <p className="text-sm text-muted-foreground">
                        Study words in random order
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        <div className="text-center">
          <Button 
            onClick={onStartStudying}
            size="lg"
            className="w-full sm:w-auto px-8"
          >
            Start Studying
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}