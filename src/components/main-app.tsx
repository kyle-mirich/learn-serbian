'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { auth } from '@/lib/firebase';
import { AuthForm } from '@/components/auth/auth-form';
import { UserProfile } from '@/components/auth/user-profile';
import { CategoryGrid } from '@/components/category-grid';
import { StudyModeSelector, StudyMode } from '@/components/study-mode-selector';
import { FirebaseStudySession } from '@/components/firebase-study-session';
import { ProgressDashboard } from '@/components/progress/progress-dashboard';
import { profileService } from '@/lib/firestore-service';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, BarChart3, Settings } from 'lucide-react';

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

type AppState = 'categories' | 'study-mode' | 'studying' | 'progress';

export function MainApp() {
  const { user, loading } = useAuth();
  const [appState, setAppState] = useState<AppState>('categories');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [studyMode, setStudyMode] = useState<StudyMode>('sequential');

  // Create user profile when user signs up
  useEffect(() => {
    const createUserProfile = async () => {
      if (user) {
        try {
          const existingProfile = await profileService.getProfile(user.uid);
          if (!existingProfile) {
            await profileService.createProfile(
              user.uid,
              user.email || '',
              user.displayName || 'User'
            );
          }
        } catch (error) {
          console.error('Error creating user profile:', error);
        }
      }
    };

    createUserProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E63946] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show Firebase setup instructions if Firebase is not initialized
  if (!auth) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-2xl">
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold text-[#E63946] mb-4">Firebase Setup Required</h1>
            <p className="text-muted-foreground mb-6">
              Firebase environment variables are missing or invalid. Please follow these steps:
            </p>
            
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2">1. Check your .env file:</h3>
                <p className="text-muted-foreground">Make sure your .env file is in the root directory with these variables:</p>
                <div className="bg-gray-100 p-3 rounded mt-2 font-mono text-xs">
                  NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key<br/>
                  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain<br/>
                  NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id<br/>
                  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket<br/>
                  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id<br/>
                  NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">2. Restart your development server:</h3>
                <p className="text-muted-foreground">Stop the server (Ctrl+C) and run <code className="bg-gray-100 px-1 rounded">pnpm dev</code> again</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">3. Debug environment variables:</h3>
                <p className="text-muted-foreground">
                  Visit <a href="/env-check" className="text-[#E63946] underline">/env-check</a> to see which variables are missing
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

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
        onBack={handleBackToCategories}
      />
    );
  }

  if (appState === 'study-mode' && selectedCategory) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
        <div className="absolute top-4 right-4">
          <UserProfile />
        </div>
        
        <div className="text-center mb-8">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-2">Serbian Flash</h1>
          <p className="font-body text-muted-foreground text-lg">Учимо srpski! (Let's learn Serbian!)</p>
        </div>

        <StudyModeSelector
          category={selectedCategory}
          studyMode={studyMode}
          onStudyModeChange={setStudyMode}
          onStartStudying={handleStartStudying}
          wordCount={0} // Will be loaded dynamically
          progress={{ studied: 0, total: 0 }} // Will be loaded from Firestore
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Serbian Flash</h1>
            <p className="font-body text-muted-foreground text-lg">Учимо српски! (Let's learn Serbian!)</p>
          </div>
          <UserProfile />
        </div>

        {/* Main Content */}
        <Tabs value={appState} onValueChange={(value) => setAppState(value as AppState)} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Study
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-6">
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
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                onClick={() => {
                  setStudyMode('random');
                  setSelectedCategoryId('mixed');
                  setAppState('studying');
                }}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">🎲</div>
                  <h3 className="font-semibold mb-1">Random Words</h3>
                  <p className="text-sm text-muted-foreground">Mixed categories</p>
                </CardContent>
              </Card>
              
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                onClick={() => {
                  setStudyMode('random');
                  setSelectedCategoryId('review');
                  setAppState('studying');
                }}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">📚</div>
                  <h3 className="font-semibold mb-1">Review</h3>
                  <p className="text-sm text-muted-foreground">Spaced repetition</p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <h3 className="font-semibold mb-1">Today's Goal</h3>
                  <p className="text-sm text-muted-foreground">0/20 words</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="progress">
            <ProgressDashboard />
          </TabsContent>

          <TabsContent value="settings">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Settings</h2>
                <p className="text-muted-foreground">Settings panel coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}