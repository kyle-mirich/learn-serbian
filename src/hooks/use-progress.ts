'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { progressService, sessionService, profileService } from '@/lib/firestore-service';
import { UserProgress, StudySession } from '@/lib/firestore-schemas';

export function useProgress() {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState({
    wordsStudied: [] as string[],
    correctAnswers: 0,
    totalAnswers: 0,
  });

  // Start a new study session
  const startSession = async (sessionType: 'flashcard' | 'quiz' | 'review' = 'flashcard') => {
    if (!user) return null;
    
    try {
      const sessionId = await sessionService.createSession(user.uid, sessionType);
      setCurrentSession(sessionId);
      setSessionStats({
        wordsStudied: [],
        correctAnswers: 0,
        totalAnswers: 0,
      });
      return sessionId;
    } catch (error) {
      console.error('Error starting session:', error);
      return null;
    }
  };

  // End the current session
  const endSession = async () => {
    if (!user || !currentSession) return;
    
    try {
      await sessionService.updateSession(currentSession, {
        endTime: new Date(),
        wordsStudied: sessionStats.wordsStudied,
        correctAnswers: sessionStats.correctAnswers,
        totalAnswers: sessionStats.totalAnswers,
      });
      
      // Update user profile stats
      await profileService.updateProfile(user.uid, {
        totalSessionsCompleted: (await profileService.getProfile(user.uid))?.totalSessionsCompleted || 0 + 1,
      });
      
      setCurrentSession(null);
      setSessionStats({
        wordsStudied: [],
        correctAnswers: 0,
        totalAnswers: 0,
      });
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  // Record an answer for a word
  const recordAnswer = async (wordId: string, isCorrect: boolean) => {
    if (!user) return;
    
    try {
      // Update progress in Firestore
      await progressService.updateProgress(user.uid, wordId, isCorrect);
      
      // Update local session stats
      setSessionStats(prev => ({
        wordsStudied: prev.wordsStudied.includes(wordId) 
          ? prev.wordsStudied 
          : [...prev.wordsStudied, wordId],
        correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
        totalAnswers: prev.totalAnswers + 1,
      }));
    } catch (error) {
      console.error('Error recording answer:', error);
    }
  };

  // Get user progress for a specific word
  const getWordProgress = async (wordId: string): Promise<UserProgress | null> => {
    if (!user) return null;
    
    try {
      return await progressService.getUserProgress(user.uid, wordId);
    } catch (error) {
      console.error('Error getting word progress:', error);
      return null;
    }
  };

  // Get words that need review
  const getWordsForReview = async (limit = 20) => {
    if (!user) return [];
    
    try {
      return await progressService.getUserWordsForReview(user.uid, limit);
    } catch (error) {
      console.error('Error getting words for review:', error);
      return [];
    }
  };

  // Get user's recent sessions
  const getRecentSessions = async (limit = 10): Promise<StudySession[]> => {
    if (!user) return [];
    
    try {
      return await sessionService.getUserSessions(user.uid, limit);
    } catch (error) {
      console.error('Error getting recent sessions:', error);
      return [];
    }
  };

  return {
    currentSession,
    sessionStats,
    startSession,
    endSession,
    recordAnswer,
    getWordProgress,
    getWordsForReview,
    getRecentSessions,
  };
}