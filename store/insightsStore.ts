import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

/**
 * MoodEntry interface for tracking mood data
 */
export interface MoodEntry {
  id: string;
  date: Date;
  mood: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
  note?: string;
}

/**
 * InsightsState interface for managing mood tracking and insights
 */
interface InsightsState {
  // Data
  moodEntries: MoodEntry[];
  
  // UI state
  selectedPeriod: 'week' | 'month' | 'year';
  currentMonth: string;
  selectedMood: string | null;
  
  // Methods
  addMoodEntry: (mood: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive', note?: string) => void;
  setPeriod: (period: 'week' | 'month' | 'year') => void;
  setCurrentMonth: (month: string) => void;
  setSelectedMood: (mood: string | null) => void;
  getMoodEntriesForPeriod: (period: 'week' | 'month' | 'year') => MoodEntry[];
}

export const useInsightsStore = create<InsightsState>((set, get) => ({
  // Data
  moodEntries: [],
  
  // UI state
  selectedPeriod: 'week',
  currentMonth: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  selectedMood: null,
  
  // Methods
  addMoodEntry: (mood, note) => set((state) => ({
    moodEntries: [
      ...state.moodEntries,
      {
        id: uuidv4(),
        date: new Date(),
        mood,
        note,
      },
    ],
  })),
  
  setPeriod: (period) => set({
    selectedPeriod: period,
  }),
  
  setCurrentMonth: (month) => set({
    currentMonth: month,
  }),
  
  setSelectedMood: (mood) => set({
    selectedMood: mood,
  }),
  
  getMoodEntriesForPeriod: (period) => {
    const { moodEntries } = get();
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        // Get entries from the last 7 days
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        // Get entries from the last 30 days
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      case 'year':
        // Get entries from the last 365 days
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 365);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }
    
    return moodEntries.filter((entry) => entry.date >= startDate);
  },
}));
