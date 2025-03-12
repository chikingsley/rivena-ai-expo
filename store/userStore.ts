import { create } from 'zustand';

/**
 * User store for managing user information and streak data
 */
interface UserState {
  // State
  name: string;
  streak: number;
  
  // Methods
  setName: (name: string) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  // Initial state
  name: 'Guest',
  streak: 0,
  
  // Methods
  setName: (name: string) => set({ name }),
  
  incrementStreak: () => set((state) => ({ 
    streak: state.streak + 1 
  })),
  
  resetStreak: () => set({ streak: 0 }),
}));
