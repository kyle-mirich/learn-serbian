import { 
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  SerbianWord, 
  UserProgress, 
  StudySession, 
  UserProfile, 
  COLLECTIONS 
} from './firestore-schemas';

// Words service
export const wordsService = {
  async getWordsByCategory(partOfSpeech: string, limitCount = 50) {
    console.log(`Getting words for category: ${partOfSpeech}, limit: ${limitCount}`);
    
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    
    const q = query(
      collection(db, COLLECTIONS.WORDS),
      where('partOfSpeech', '==', partOfSpeech),
      limit(limitCount)
      // Note: orderBy('frequency', 'desc') removed temporarily until index is created
    );
    
    console.log('Executing Firestore query...');
    const snapshot = await getDocs(q);
    console.log(`Found ${snapshot.docs.length} documents`);
    
    const words = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SerbianWord));
    console.log('Sample words:', words.slice(0, 2));
    
    return words;
  },

  async getRandomWords(count = 20, partOfSpeech?: string) {
    let q;
    if (partOfSpeech) {
      q = query(
        collection(db, COLLECTIONS.WORDS),
        where('partOfSpeech', '==', partOfSpeech),
        limit(count * 3) // Get more to randomize
      );
    } else {
      q = query(
        collection(db, COLLECTIONS.WORDS),
        limit(count * 3)
      );
    }
    
    const snapshot = await getDocs(q);
    const words = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SerbianWord));
    
    // Shuffle and return requested count
    const shuffled = words.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },

  async getWordById(wordId: string) {
    const docRef = doc(db, COLLECTIONS.WORDS, wordId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as SerbianWord;
    }
    return null;
  },

  async addWord(word: Omit<SerbianWord, 'id' | 'createdAt' | 'updatedAt'>) {
    const docRef = doc(collection(db, COLLECTIONS.WORDS));
    const now = Timestamp.now();
    await setDoc(docRef, {
      ...word,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  async batchAddWords(words: Omit<SerbianWord, 'id' | 'createdAt' | 'updatedAt'>[]) {
    const batch = writeBatch(db);
    const now = Timestamp.now();

    words.forEach(word => {
      const docRef = doc(collection(db, COLLECTIONS.WORDS));
      batch.set(docRef, {
        ...word,
        createdAt: now,
        updatedAt: now,
      });
    });

    await batch.commit();
  }
};

// User progress service
export const progressService = {
  async getUserProgress(userId: string, wordId: string) {
    const docRef = doc(db, COLLECTIONS.USER_PROGRESS, `${userId}_${wordId}`);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { ...snapshot.data() } as UserProgress;
    }
    return null;
  },

  async updateProgress(userId: string, wordId: string, isCorrect: boolean) {
    const docId = `${userId}_${wordId}`;
    const docRef = doc(db, COLLECTIONS.USER_PROGRESS, docId);
    const now = Timestamp.now();
    const profileSnap = await getDoc(doc(db, COLLECTIONS.USER_PROFILES, userId));
    const strategy: 'sm2' | 'exponential' =
      (profileSnap.data()?.preferences?.reviewStrategy as 'sm2' | 'exponential') || 'exponential';

    const existing = await getDoc(docRef);

    const calculateNextReview = (
      data: UserProgress | null,
      newStreak: number,
      correct: boolean
    ) => {
      const next = new Date();
      let interval = 1;
      if (strategy === 'exponential') {
        interval = correct ? Math.pow(2, newStreak) : 1;
      } else {
        // Simplified SM-2 style calculation
        if (!correct) {
          interval = 1;
        } else if (newStreak === 1) {
          interval = 1;
        } else if (newStreak === 2) {
          interval = 6;
        } else {
          const prevInterval = data && data.nextReview && data.lastReviewed
            ? Math.max(1,
                Math.round(
                  (data.nextReview.toDate().getTime() - data.lastReviewed.toDate().getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              )
            : 6;
          interval = Math.round(prevInterval * 2.5);
        }
      }
      next.setDate(next.getDate() + interval);
      return next;
    };

    if (existing.exists()) {
      const data = existing.data() as UserProgress;
      const newCorrectCount = isCorrect ? data.correctCount + 1 : data.correctCount;
      const newIncorrectCount = isCorrect ? data.incorrectCount : data.incorrectCount + 1;
      const newStreakCount = isCorrect ? data.streakCount + 1 : 0;

      // Calculate difficulty based on performance
      const totalAttempts = newCorrectCount + newIncorrectCount;
      const accuracy = newCorrectCount / totalAttempts;
      let difficultyLevel: 'easy' | 'medium' | 'hard' = 'medium';

      if (accuracy > 0.8) difficultyLevel = 'easy';
      else if (accuracy < 0.5) difficultyLevel = 'hard';

      const nextReviewDate = calculateNextReview(data, newStreakCount, isCorrect);

      await updateDoc(docRef, {
        correctCount: newCorrectCount,
        incorrectCount: newIncorrectCount,
        streakCount: newStreakCount,
        lastReviewed: now,
        difficultyLevel,
        nextReview: Timestamp.fromDate(nextReviewDate),
        isLearned: accuracy > 0.8 && totalAttempts >= 5,
      });
    } else {
      const newStreakCount = isCorrect ? 1 : 0;
      const nextReviewDate = calculateNextReview(null, newStreakCount, isCorrect);

      await setDoc(docRef, {
        userId,
        wordId,
        correctCount: isCorrect ? 1 : 0,
        incorrectCount: isCorrect ? 0 : 1,
        streakCount: newStreakCount,
        lastReviewed: now,
        difficultyLevel: 'medium',
        nextReview: Timestamp.fromDate(nextReviewDate),
        isLearned: false,
      });
    }
  },

  async getUserWordsForReview(userId: string, limitCount = 20) {
    const q = query(
      collection(db, COLLECTIONS.USER_PROGRESS),
      where('userId', '==', userId),
      where('nextReview', '<=', Timestamp.now()),
      orderBy('nextReview', 'asc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as UserProgress);
  }
};

// Study session service
export const sessionService = {
  async createSession(userId: string, sessionType: 'flashcard' | 'quiz' | 'review' = 'flashcard') {
    const docRef = doc(collection(db, COLLECTIONS.STUDY_SESSIONS));
    const session: Omit<StudySession, 'sessionId'> = {
      userId,
      startTime: Timestamp.now(),
      wordsStudied: [],
      correctAnswers: 0,
      totalAnswers: 0,
      sessionType,
    };
    
    await setDoc(docRef, session);
    return docRef.id;
  },

  async updateSession(sessionId: string, updates: Partial<StudySession>) {
    const docRef = doc(db, COLLECTIONS.STUDY_SESSIONS, sessionId);
    await updateDoc(docRef, {
      ...updates,
      endTime: updates.endTime || Timestamp.now(),
    });
  },

  async getUserSessions(userId: string, limitCount = 10) {
    const q = query(
      collection(db, COLLECTIONS.STUDY_SESSIONS),
      where('userId', '==', userId),
      orderBy('startTime', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ sessionId: doc.id, ...doc.data() } as StudySession));
  }
};

// User profile service
export const profileService = {
  async createProfile(userId: string, email: string, displayName: string) {
    const docRef = doc(db, COLLECTIONS.USER_PROFILES, userId);
    const profile: UserProfile = {
      userId,
      email,
      displayName,
      createdAt: Timestamp.now().toDate(),
      lastActive: Timestamp.now().toDate(),
      totalWordsLearned: 0,
      totalSessionsCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      preferences: {
        dailyGoal: 20,
        preferredCategories: [],
        enableNotifications: true,
        reviewStrategy: 'exponential',
      },
    };
    
    await setDoc(docRef, profile);
  },

  async getProfile(userId: string) {
    const docRef = doc(db, COLLECTIONS.USER_PROFILES, userId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as UserProfile;
    }
    return null;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    const docRef = doc(db, COLLECTIONS.USER_PROFILES, userId);
    await updateDoc(docRef, {
      ...updates,
      lastActive: Timestamp.now().toDate(),
    });
  }
};