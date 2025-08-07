'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useProgress } from '@/hooks/use-progress';
import { progressService } from '@/lib/firestore-service';
import { StudySession } from '@/lib/firestore-schemas';
import { ProgressDashboard } from '@/components/progress/progress-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProgressPage() {
  const { user } = useAuth();
  const { getRecentSessions } = useProgress();
  const [upcomingReviews, setUpcomingReviews] = useState(0);
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        const [reviews, sessions] = await Promise.all([
          progressService.getUserWordsForReview(user.uid),
          getRecentSessions(5),
        ]);
        setUpcomingReviews(reviews.length);
        setRecentSessions(sessions);
      } catch (error) {
        console.error('Error loading progress data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, getRecentSessions]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-muted-foreground">Please sign in to view your progress.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-muted-foreground">Loading progress...</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4 space-y-6">
      <h1 className="font-headline text-3xl font-bold text-primary">Progress</h1>

      <ProgressDashboard />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Reviews</CardTitle>
            <CardDescription>Words due for review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#E63946]">{upcomingReviews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Your latest study sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent sessions</p>
            ) : (
              <ul className="text-sm space-y-2">
                {recentSessions.map((session) => (
                  <li key={session.sessionId} className="flex justify-between">
                    <span className="capitalize">{session.sessionType}</span>
                    <span>{session.wordsStudied.length} words</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

