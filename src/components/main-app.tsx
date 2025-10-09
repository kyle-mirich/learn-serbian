'use client';

import { useState, useEffect } from 'react';
import { CategoryGrid } from '@/components/category-grid';
import { StudyModeSelector, StudyMode } from '@/components/study-mode-selector';
import { FirebaseStudySession } from '@/components/firebase-study-session';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const CATEGORIES = [
  { id: 'noun', name: 'Nouns', description: 'People, places, things', icon: '📝', color: 'bg-blue-100 text-blue-800' },
  { id: 'verb', name: 'Verbs', description: 'Action words', icon: '⚡', color: 'bg-green-100 text-green-800' },
  { id: 'adj', name: 'Adjectives', description: 'Descriptive words', icon: '🎨', color: 'bg-purple-100 text-purple-800' },
  { id: 'adv', name: 'Adverbs', description: 'Modify verbs, adjectives', icon: '🔄', color: 'bg-orange-100 text-orange-800' },
  { id: 'preposition', name: 'Prepositions', description: 'Position and direction', icon: '🔗', color: 'bg-pink-100 text-pink-800' },
  { id: 'pronoun', name: 'Pronouns', description: 'Replace nouns', icon: '👤', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'conjunction', name: 'Conjunctions', description: 'Connect words and phrases', icon: '🌉', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'numbers', name: 'Numbers', description: 'Numeric values', icon: '🔢', color: 'bg-red-100 text-red-800' },
];

type AppState = 'categories' | 'study-mode' | 'studying';

export function MainApp() {
  const [appState, setAppState] = useState<AppState>('categories');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [studyMode, setStudyMode] = useState<StudyMode>('sequential');
  const [wordCount, setWordCount] = useState<number>(20);



  const selectedCategory = CATEGORIES.find(cat => cat.id === selectedCategoryId);

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setAppState('study-mode');
  };

  const handleStartStudying = () => {
    setAppState('studying');
  };

  const handleBackToCategories = () => {
    setAppState('categories');
    setSelectedCategoryId('');
  };

  const handleBackToStudyMode = () => {
    setAppState('study-mode');
  };

  if (appState === 'studying' && selectedCategory) {
    return (
      <FirebaseStudySession
        categoryId={selectedCategoryId}
        studyMode={studyMode === 'sequential' ? 'frequency' : studyMode}
        wordCount={wordCount}
        onBack={handleBackToCategories}
      />
    );
  }

  if (appState === 'study-mode' && selectedCategory) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-4 sm:p-6">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">Serbian Flash</h1>
          <p className="text-slate-600 text-sm sm:text-base">Configure your study session</p>
        </div>

        <StudyModeSelector
          category={selectedCategory}
          studyMode={studyMode}
          onStudyModeChange={setStudyMode}
          onStartStudying={handleStartStudying}
          wordCount={wordCount}
          onWordCountChange={setWordCount}
          progress={{ studied: 0, total: 0 }}
        />

        <div className="mt-6">
          <Button
            variant="ghost"
            onClick={handleBackToCategories}
            className="text-muted-foreground hover:text-primary"
          >
            ← Back to categories
          </Button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Serbian Flash</h1>
          <p className="font-body text-muted-foreground text-lg">Учимо српски! (Let's learn Serbian!)</p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
            <div className="text-center mb-6">
              <p className="font-body text-muted-foreground">Choose a category to start learning</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {CATEGORIES.map((category) => (
                <Card 
                  key={category.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                  onClick={() => handleSelectCategory(category.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 ${category.color}`}>
                      {category.icon}
                    </div>
                    <h3 className="font-headline text-lg font-bold text-foreground mb-2">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Learn {category.name.toLowerCase()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            

        </div>
      </div>
    </div>
  );
}