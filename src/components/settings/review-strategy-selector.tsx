'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { profileService } from '@/lib/firestore-service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserProfile } from '@/lib/firestore-schemas';

interface ReviewStrategySelectorProps {
  value?: 'sm2' | 'exponential';
  onChange?: (value: 'sm2' | 'exponential') => void;
}

export function ReviewStrategySelector({
  value,
  onChange,
}: ReviewStrategySelectorProps) {
  const { user } = useAuth();
  const [strategy, setStrategy] = useState<'sm2' | 'exponential'>('exponential');

  useEffect(() => {
    if (value !== undefined) return;
    const load = async () => {
      if (!user) return;
      try {
        const profile = await profileService.getProfile(user.uid);
        if (profile?.preferences?.reviewStrategy) {
          setStrategy(
            profile.preferences.reviewStrategy as 'sm2' | 'exponential'
          );
        }
      } catch (err) {
        console.error('Failed to load review strategy', err);
      }
    };
    load();
  }, [user, value]);

  const handleChange = async (val: string) => {
    if (value !== undefined) {
      onChange?.(val as 'sm2' | 'exponential');
      return;
    }

    setStrategy(val as 'sm2' | 'exponential');
    if (!user) return;
    const profile = await profileService.getProfile(user.uid);
    await profileService.updateProfile(user.uid, {
      preferences: {
        ...(profile?.preferences ?? {}),
        reviewStrategy: val as 'sm2' | 'exponential',
      } as UserProfile['preferences'],
    });
  };

  return (
    <Select
      value={value !== undefined ? value : strategy}
      onValueChange={handleChange}
    >
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
