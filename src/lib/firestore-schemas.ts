import { z } from 'zod';

// Serbian word schema
export const serbianWordSchema = z.object({
  id: z.string(),
  item: z.string(),
  frequency: z.number(),
  relativeFrequency: z.number(),
  partOfSpeech: z.enum(['adj', 'adv', 'conjunction', 'noun', 'numbers', 'preposition', 'pronoun', 'verb', 'word']),
  translation: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// User progress schema
export const userProgressSchema = z.object({
  userId: z.string(),
  wordId: z.string(),
  correctCount: z.number().default(0),
  incorrectCount: z.number().default(0),
  lastReviewed: z.date(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).default('medium'),
  nextReview: z.date(),
  isLearned: z.boolean().default(false),
  streakCount: z.number().default(0),
});

// Study session schema
export const studySessionSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
  startTime: z.date(),
  endTime: z.date().optional(),
  wordsStudied: z.array(z.string()), // wordIds
  correctAnswers: z.number().default(0),
  totalAnswers: z.number().default(0),
  partOfSpeech: z.string().optional(),
  sessionType: z.enum(['flashcard', 'quiz', 'review']).default('flashcard'),
});

// User profile schema
export const userProfileSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  createdAt: z.date(),
  lastActive: z.date(),
  totalWordsLearned: z.number().default(0),
  totalSessionsCompleted: z.number().default(0),
  currentStreak: z.number().default(0),
  longestStreak: z.number().default(0),
  preferences: z.object({
    dailyGoal: z.number().default(20),
    preferredCategories: z.array(z.string()).default([]),
    enableNotifications: z.boolean().default(true),
    reviewStrategy: z.enum(['sm2', 'exponential']).default('exponential'),
  }).default({}),
});

// TypeScript types
export type SerbianWord = z.infer<typeof serbianWordSchema>;
export type UserProgress = z.infer<typeof userProgressSchema>;
export type StudySession = z.infer<typeof studySessionSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type ReviewStrategy = 'sm2' | 'exponential';

// Firestore collection names
export const COLLECTIONS = {
  WORDS: 'words',
  USER_PROGRESS: 'userProgress',
  STUDY_SESSIONS: 'studySessions',
  USER_PROFILES: 'userProfiles',
} as const;