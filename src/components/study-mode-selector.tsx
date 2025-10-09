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
  onWordCountChange: (count: number) => void;
  progress: { studied: number; total: number };
}

export function StudyModeSelector({
  category,
  studyMode,
  onStudyModeChange,
  onStartStudying,
  wordCount,
  onWordCountChange,
  progress
}: StudyModeSelectorProps) {
  const progressPercent = progress.total > 0 
    ? Math.round((progress.studied / progress.total) * 100) 
    : 0;

  const isMixedRandom = category.id === 'mixed-random';

  return (
    <Card className="w-full max-w-lg border-0 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <div className="text-4xl mb-3">{category.icon}</div>
        <CardTitle className="text-xl sm:text-2xl text-slate-800">{category.name}</CardTitle>
        <Badge variant="outline" className="mt-2">
          {wordCount} words
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-2">
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3 text-center">Study Mode</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={studyMode === 'sequential' ? "default" : "outline"}
              onClick={() => onStudyModeChange('sequential')}
              className="text-xs sm:text-sm h-8 sm:h-9"
            >
              Sequential
            </Button>
            <Button
              variant={studyMode === 'random' ? "default" : "outline"}
              onClick={() => onStudyModeChange('random')}
              className="text-xs sm:text-sm h-8 sm:h-9"
            >
              Random
            </Button>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3 text-center">Number of Words</h3>
          <div className="grid grid-cols-4 gap-2">
            {[10, 20, 50, 100].map((count) => (
              <Button
                key={count}
                variant={wordCount === count ? "default" : "outline"}
                onClick={() => onWordCountChange(count)}
                className="text-xs sm:text-sm h-8 sm:h-9"
              >
                {count}
              </Button>
            ))}
          </div>
        </div>
        
        <Button 
          onClick={onStartStudying}
          className="w-full h-10 sm:h-11 text-sm sm:text-base"
        >
          Start Studying
        </Button>
      </CardContent>
    </Card>
  );
}