'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { profileService } from '@/lib/firestore-service';
import { ACTUAL_CATEGORIES } from '@/lib/word-data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ReviewStrategySelector } from '@/components/settings/review-strategy-selector';
import { UserProfile } from '@/lib/firestore-schemas';

export function SettingsPanel() {
  const { user } = useAuth();
  const [dailyGoal, setDailyGoal] = useState(20);
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [reviewStrategy, setReviewStrategy] = useState<'sm2' | 'exponential'>('exponential');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const profile = await profileService.getProfile(user.uid);
        if (profile) {
          setDailyGoal(profile.preferences.dailyGoal);
          setPreferredCategories(profile.preferences.preferredCategories);
          setEnableNotifications(profile.preferences.enableNotifications);
          setReviewStrategy(profile.preferences.reviewStrategy);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const toggleCategory = (id: string) => {
    setPreferredCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const profile = await profileService.getProfile(user.uid);
      await profileService.updateProfile(user.uid, {
        preferences: {
          ...(profile?.preferences ?? {}),
          dailyGoal,
          preferredCategories,
          enableNotifications,
          reviewStrategy,
        } as UserProfile['preferences'],
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">Loading...</CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Customize your learning experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="daily-goal">Daily Word Goal</Label>
          <Input
            id="daily-goal"
            type="number"
            min={1}
            className="w-32"
            value={dailyGoal}
            onChange={(e) => setDailyGoal(parseInt(e.target.value, 10) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label>Preferred Categories</Label>
          <div className="grid grid-cols-2 gap-2">
            {ACTUAL_CATEGORIES.map((cat) => (
              <div key={cat.id} className="flex items-center space-x-2">
                <Checkbox
                  id={cat.id}
                  checked={preferredCategories.includes(cat.id)}
                  onCheckedChange={() => toggleCategory(cat.id)}
                />
                <Label htmlFor={cat.id} className="flex items-center gap-1">
                  <span>{cat.icon}</span>
                  {cat.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications">Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Enable daily reminder emails
            </p>
          </div>
          <Switch
            id="notifications"
            checked={enableNotifications}
            onCheckedChange={setEnableNotifications}
          />
        </div>

        <div className="space-y-2">
          <Label>Review Strategy</Label>
          <ReviewStrategySelector
            value={reviewStrategy}
            onChange={setReviewStrategy}
          />
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardContent>
    </Card>
  );
}

