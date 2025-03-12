import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

/**
 * Topic interface for session topics
 */
export interface Topic {
  id: number;
  title: string;
  duration: number;
  active: boolean;
  transcript?: string;
}

/**
 * Session interface for session data
 */
export interface Session {
  id: string;
  date: Date;
  duration: number;
  topics: Topic[];
  mood?: 'positive' | 'neutral' | 'negative';
  type: 'deep-exploration' | 'check-in' | 'skill-building';
}

/**
 * Session state interface for managing active sessions and history
 */
interface SessionState {
  // Session data
  currentSession: Session | null;
  sessionHistory: Session[];
  
  // Active session state
  sessionPhase: 'introduction' | 'exploration' | 'reflection' | 'closing';
  phaseProgress: number;
  activeState: 'listening' | 'speaking' | 'reflecting';
  
  // Topic tracking
  topicHistory: Topic[];
  currentTopic: Topic | null;
  topicProgress: number;
  
  // Voice visualization
  userVoiceIntensity: number;
  
  // UI state
  topicsExpanded: boolean;
  
  // Methods
  startSession: (type: 'deep-exploration' | 'check-in' | 'skill-building') => void;
  endSession: () => void;
  setSessionPhase: (phase: 'introduction' | 'exploration' | 'reflection' | 'closing', progress?: number) => void;
  setActiveState: (state: 'listening' | 'speaking' | 'reflecting') => void;
  addTopic: (topic: Partial<Topic>) => void;
  setCurrentTopic: (topicId: number) => void;
  setTopicProgress: (progress: number) => void;
  setUserVoiceIntensity: (intensity: number) => void;
  toggleTopicsPanel: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  // Session data
  currentSession: null,
  sessionHistory: [],
  
  // Active session state
  sessionPhase: 'introduction',
  phaseProgress: 0,
  activeState: 'listening',
  
  // Topic tracking
  topicHistory: [],
  currentTopic: null,
  topicProgress: 0,
  
  // Voice visualization
  userVoiceIntensity: 0,
  
  // UI state
  topicsExpanded: false,
  
  // Methods
  startSession: (type) => set({
    currentSession: {
      id: uuidv4(),
      date: new Date(),
      duration: 0,
      topics: [],
      type,
    },
    sessionPhase: 'introduction',
    phaseProgress: 0,
    activeState: 'listening',
    topicHistory: [],
    currentTopic: null,
    topicProgress: 0,
    userVoiceIntensity: 0,
    topicsExpanded: false,
  }),
  
  endSession: () => {
    const { currentSession } = get();
    
    if (currentSession) {
      set((state) => ({
        sessionHistory: [...state.sessionHistory, {
          ...currentSession,
          duration: Math.floor((new Date().getTime() - currentSession.date.getTime()) / 1000),
          topics: state.topicHistory,
        }],
        currentSession: null,
        topicHistory: [],
        currentTopic: null,
      }));
    }
  },
  
  setSessionPhase: (phase, progress = 0) => set({
    sessionPhase: phase,
    phaseProgress: progress,
  }),
  
  setActiveState: (state) => set({
    activeState: state,
  }),
  
  addTopic: (topic) => {
    const newTopic: Topic = {
      id: get().topicHistory.length + 1,
      title: topic.title || 'Unnamed topic',
      duration: topic.duration || 0,
      active: topic.active !== undefined ? topic.active : true,
      transcript: topic.transcript,
    };
    
    set((state) => ({
      topicHistory: [...state.topicHistory, newTopic],
      currentTopic: newTopic,
      topicProgress: 0,
      currentSession: state.currentSession ? {
        ...state.currentSession,
        topics: [...state.currentSession.topics, newTopic],
      } : null,
    }));
  },
  
  setCurrentTopic: (topicId) => {
    const { topicHistory } = get();
    const topic = topicHistory.find((t) => t.id === topicId) || null;
    
    set({
      currentTopic: topic,
      topicProgress: 0,
    });
  },
  
  setTopicProgress: (progress) => set({
    topicProgress: progress,
  }),
  
  setUserVoiceIntensity: (intensity) => set({
    userVoiceIntensity: intensity,
  }),
  
  toggleTopicsPanel: () => set((state) => ({
    topicsExpanded: !state.topicsExpanded,
  })),
}));
