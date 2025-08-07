'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { profileService } from '@/lib/firestore-service';
import { UserProfile } from '@/lib/firestore-schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Target, Trophy, Zap } from 'lucide-react';
import { ReviewStrategySelector } from '@/components/settings/review-strategy-selector';

export function ProgressDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        const userProfile = await profileService.getProfile(user.uid);
        setProfile(userProfile);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Unable to load progress data</p>
      </div>
    );
  }

  const dailyProgress = Math.min(100, (profile.totalWordsLearned % profile.preferences.dailyGoal) / profile.preferences.dailyGoal * 100);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Words Learned</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#E63946]">{profile.totalWordsLearned}</div>
            <p className="text-xs text-muted-foreground">
              Total vocabulary acquired
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#E63946]">{profile.currentStreak}</div>
            <p className="text-xs text-muted-foreground">
              Days in a row
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#E63946]">{profile.totalSessionsCompleted}</div>
            <p className="text-xs text-muted-foreground">
              Study sessions completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Goal</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#E63946]">
              {Math.floor(dailyProgress)}%
            </div>
            <Progress value={dailyProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {profile.preferences.dailyGoal} words daily
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Learning Preferences</CardTitle>
          <CardDescription>Your current study settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Daily Goal</h4>
            <p className="text-sm text-muted-foreground">
              Learn {profile.preferences.dailyGoal} new words each day
            </p>
          </div>
          
          {profile.preferences.preferredCategories.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Preferred Categories</h4>
              <div className="flex flex-wrap gap-2">
                {profile.preferences.preferredCategories.map((category) => (
                  <Badge key={category} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h4 className="text-sm font-medium mb-2">Notifications</h4>
            <Badge variant={profile.preferences.enableNotifications ? 'default' : 'secondary'}>
              {profile.preferences.enableNotifications ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Review Strategy</h4>
            <ReviewStrategySelector />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>Your learning milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Longest Streak</p>
                <p className="text-xs text-muted-foreground">{profile.longestStreak} days</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Words Mastered</p>
                <p className="text-xs text-muted-foreground">{profile.totalWordsLearned} vocabulary</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}