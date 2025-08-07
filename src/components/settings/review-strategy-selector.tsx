'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { profileService } from '@/lib/firestore-service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ReviewStrategySelector() {
  const { user } = useAuth();
  const [strategy, setStrategy] = useState<'sm2' | 'exponential'>('exponential');

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const profile = await profileService.getProfile(user.uid);
        if (profile?.preferences?.reviewStrategy) {
          setStrategy(profile.preferences.reviewStrategy as 'sm2' | 'exponential');
        }
      } catch (err) {
        console.error('Failed to load review strategy', err);
      }
    };
    load();
  }, [user]);

  const handleChange = async (value: string) => {
    setStrategy(value as 'sm2' | 'exponential');
    if (!user) return;
    const profile = await profileService.getProfile(user.uid);
    await profileService.updateProfile(user.uid, {
      preferences: {
        ...profile?.preferences,
        reviewStrategy: value,
      },
    });
  };

  return (
    <Select value={strategy} onValueChange={handleChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select strategy" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="sm2">SM-2</SelectItem>
        <SelectItem value="exponential">Exponential</SelectItem>
      </SelectContent>
    </Select>
  );
}
