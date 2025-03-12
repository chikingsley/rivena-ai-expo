import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

/**
 * HistoryItem interface for tracking sessions and life events
 */
export interface HistoryItem {
  id: string;
  type: 'session' | 'life_event';
  title: string;
  time: string;
  duration?: number;
  topics?: string[];
  mood?: 'positive' | 'neutral' | 'negative';
  icon?: string; // Icon name or path
}

/**
 * HistoryState interface for managing history items and UI state
 */
interface HistoryState {
  // Data
  historyItems: HistoryItem[];
  
  // UI state
  activeTab: 'day' | 'week' | 'month' | 'year';
  selectedDate: Date;
  
  // Methods
  addHistoryItem: (item: Omit<HistoryItem, 'id'>) => void;
  setActiveTab: (tab: 'day' | 'week' | 'month' | 'year') => void;
  setSelectedDate: (date: Date) => void;
  getHistoryItemsForDate: (date: Date) => HistoryItem[];
  getHistoryItemsForPeriod: (period: 'day' | 'week' | 'month' | 'year', date: Date) => HistoryItem[];
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  // Data
  historyItems: [],
  
  // UI state
  activeTab: 'day',
  selectedDate: new Date(),
  
  // Methods
  addHistoryItem: (item) => set((state) => ({
    historyItems: [
      ...state.historyItems,
      {
        ...item,
        id: uuidv4(),
      },
    ],
  })),
  
  setActiveTab: (tab) => set({
    activeTab: tab,
  }),
  
  setSelectedDate: (date) => set({
    selectedDate: date,
  }),
  
  getHistoryItemsForDate: (date) => {
    const { historyItems } = get();
    const targetDate = new Date(date);
    
    // Reset time to start of day for comparison
    targetDate.setHours(0, 0, 0, 0);
    
    return historyItems.filter((item) => {
      const itemDate = new Date(item.time);
      return (
        itemDate.getDate() === targetDate.getDate() &&
        itemDate.getMonth() === targetDate.getMonth() &&
        itemDate.getFullYear() === targetDate.getFullYear()
      );
    });
  },
  
  getHistoryItemsForPeriod: (period, date) => {
    const { historyItems } = get();
    const targetDate = new Date(date);
    let startDate: Date;
    
    // Reset time to start of day
    targetDate.setHours(0, 0, 0, 0);
    
    switch (period) {
      case 'day':
        return get().getHistoryItemsForDate(targetDate);
      
      case 'week':
        // Get the start of the week (Sunday)
        startDate = new Date(targetDate);
        startDate.setDate(targetDate.getDate() - targetDate.getDay());
        break;
      
      case 'month':
        // Get the start of the month
        startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        break;
      
      case 'year':
        // Get the start of the year
        startDate = new Date(targetDate.getFullYear(), 0, 1);
        break;
      
      default:
        startDate = new Date(targetDate);
    }
    
    let endDate: Date;
    
    switch (period) {
      case 'week':
        // End of week (Saturday)
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      
      case 'month':
        // End of month
        endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      
      case 'year':
        // End of year
        endDate = new Date(targetDate.getFullYear(), 11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;
      
      default:
        endDate = new Date(targetDate);
        endDate.setHours(23, 59, 59, 999);
    }
    
    return historyItems.filter((item) => {
      const itemDate = new Date(item.time);
      return itemDate >= startDate && itemDate <= endDate;
    });
  },
}));
