'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WordCategory } from '@/lib/word-data';
import { cn } from '@/lib/utils';

interface CategoryGridProps {
  categories: WordCategory[];
  selectedCategory?: string;
  onSelectCategory: (categoryId: string) => void;
  progress: Record<string, { studied: number; total: number }>;
}

export function CategoryGrid({ 
  categories, 
  selectedCategory, 
  onSelectCategory,
  progress 
}: CategoryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
      {categories.map((category) => {
        const categoryProgress = progress[category.id] || { studied: 0, total: 0 };
        const progressPercent = categoryProgress.total > 0 
          ? Math.round((categoryProgress.studied / categoryProgress.total) * 100) 
          : 0;
        
        return (
          <Card 
            key={category.id}
            className={cn(
              'cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border-2',
              selectedCategory === category.id 
                ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                : 'border-border hover:border-primary/50'
            )}
            onClick={() => onSelectCategory(category.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center text-2xl text-white',
                  category.id === 'mixed-random' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                    : category.color
                )}>
                  {category.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-headline text-lg font-semibold">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-body">
                    {category.description}
                  </p>
                </div>
              </div>
              
              {categoryProgress.total > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <Badge variant="secondary">
                      {categoryProgress.studied}/{categoryProgress.total}
                    </Badge>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                  <div className="text-xs text-muted-foreground text-center">
                    {progressPercent}% complete
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}