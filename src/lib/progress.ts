'use client';

export interface StudyProgress {
  [categoryId: string]: {
    studiedWords: Set<string>;
    totalWords: number;
    lastStudied: string | null;
  };
}

const PROGRESS_STORAGE_KEY = 'serbian-flash-progress';

export function getStoredProgress(): StudyProgress {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!stored) return {};
    
    const parsed = JSON.parse(stored);
    
    // Convert studiedWords arrays back to Sets
    const progress: StudyProgress = {};
    for (const [categoryId, data] of Object.entries(parsed)) {
      const categoryData = data as any;
      progress[categoryId] = {
        studiedWords: new Set(categoryData.studiedWords || []),
        totalWords: categoryData.totalWords || 0,
        lastStudied: categoryData.lastStudied || null,
      };
    }
    
    return progress;
  } catch (error) {
    console.error('Error loading progress:', error);
    return {};
  }
}

export function saveProgress(progress: StudyProgress) {
  if (typeof window === 'undefined') return;
  
  try {
    // Convert Sets to arrays for JSON serialization
    const serializable: any = {};
    for (const [categoryId, data] of Object.entries(progress)) {
      serializable[categoryId] = {
        studiedWords: Array.from(data.studiedWords),
        totalWords: data.totalWords,
        lastStudied: data.lastStudied,
      };
    }
    
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(serializable));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
}

export function markWordAsStudied(
  progress: StudyProgress,
  categoryId: string,
  word: string
): StudyProgress {
  const newProgress = { ...progress };
  
  if (!newProgress[categoryId]) {
    newProgress[categoryId] = {
      studiedWords: new Set(),
      totalWords: 0,
      lastStudied: null,
    };
  }
  
  newProgress[categoryId] = {
    ...newProgress[categoryId],
    studiedWords: new Set([...newProgress[categoryId].studiedWords, word]),
    lastStudied: new Date().toISOString(),
  };
  
  return newProgress;
}

export function initializeCategoryProgress(
  progress: StudyProgress,
  categoryId: string,
  totalWords: number
): StudyProgress {
  const newProgress = { ...progress };
  
  if (!newProgress[categoryId]) {
    newProgress[categoryId] = {
      studiedWords: new Set(),
      totalWords,
      lastStudied: null,
    };
  } else {
    newProgress[categoryId] = {
      ...newProgress[categoryId],
      totalWords,
    };
  }
  
  return newProgress;
}

export function getProgressSummary(progress: StudyProgress) {
  return Object.entries(progress).reduce((acc, [categoryId, data]) => {
    acc[categoryId] = {
      studied: data.studiedWords.size,
      total: data.totalWords,
    };
    return acc;
  }, {} as Record<string, { studied: number; total: number }>);
}