# Rivena App: NextJS to Expo React Native Conversion Plan

## Overview

This document outlines the detailed plan for converting the NextJS mockups to Expo React Native using:

- React Native Reusables (shadcn/ui for React Native)
- Expo Reanimated for animations (replacing Framer Motion)
- Expo Router for navigation
- Zustand for state management to reduce rerenders and prop drilling

## Project Structure

### Current Structure

- NextJS mockups in `/references/mockups/therapy-ai-app/`
- Existing Expo app with bottom tab navigation in `/app/(tabs)/`
- Example page using React Native Reusables in `/app/(tabs)/home.tsx`

### Target Structure

Based on the app's requirements and current structure, we'll implement:

```
/app
  /(tabs)
    _layout.tsx (existing)
    index.tsx (Home)
    history.tsx (Session History)
    insights.tsx (Insights/Trends)
    profile.tsx (User Profile)
  /session
    [id].tsx (Dynamic Session Screen)
  /components
    /ui
      (reusable UI components)
    /screens
      /home
        (home screen components)
      /session
        (session screen components)
      /history
        (history screen components)
      /insights
        (insights screen components)
      /profile
        (profile screen components)
  /store
    userStore.ts
    sessionStore.ts
    insightsStore.ts
    themeStore.ts
```

## Screens and Components Breakdown

### 1. Home Screen (`/app/(tabs)/index.tsx`)

**Components:**

- `StatusBar` - Shows time and device status
- `Header` - Contains streak counter, greeting, and profile button
- `WeeklyCalendar` - Shows days of the week with completion status
- `SessionCards` - Morning/Evening check-in cards
- `SuggestionsList` - List of session suggestions

**State Management:**

- User information (name, streak)
- Current date/time
- Weekly calendar data
- Session suggestions

### 2. History Screen (`/app/(tabs)/history.tsx`)

**Components:**

- `StatusBar` - Shows time and device status
- `Header` - Contains tab navigation and profile button
- `DateSelector` - Shows and allows selection of current date
- `HistoryList` - List of session and life event cards
- `HistoryCard` - Individual history item with icon, title, and metadata

**State Management:**

- History items (sessions, life events)
- Active tab (day, week, month, year)
- Selected date

### 3. Insights Screen (`/app/(tabs)/insights.tsx`)

**Components:**

- `StatusBar` - Shows time and device status
- `Header` - Contains period selector and profile button
- `Title` - "trends." title display
- `EmptyState` - Message when no data is available
- `MoodSelector` - UI for selecting current mood
- `InsightsCards` - Cards showing mood trends and insights
- `MonthSelector` - UI for selecting month to view

**State Management:**

- Selected period (week, month, year)
- Current month
- Selected mood
- Mood history data

### 4. Profile Screen (`/app/(tabs)/profile.tsx`)

**Components:**

- `StatusBar` - Shows time and device status
- `Header` - Contains close button
- `Title` - "your profile." title display
- `PremiumCard` - Card promoting premium features
- `PersonalizeGrid` - Grid of personalization options
- `SettingsList` - List of settings options
- `ThemeToggle` - Toggle for dark/light mode

**State Management:**

- Theme mode (dark/light)
- User preferences
- Premium status

### 5. Session Screen (`/app/session/[id].tsx`)

**Components:**

- `SessionHeader` - Contains back button, session type, and calendar button
- `ProgressVisualization` - Shows session progress with phase markers
- `VoiceVisualization` - Complex component with different states:
  - `ListeningState` - Animated visualization for user speaking
  - `SpeakingState` - Animated visualization for AI speaking
  - `ReflectingState` - Animated visualization for AI thinking
- `CurrentFocusPanel` - Shows current topic with progress
- `TopicsPanel` - Expandable panel showing topics covered
- `HomeIndicator` - Bottom home indicator

**State Management:**

- Session state (listening, speaking, reflecting)
- Current topic and duration
- Session phase and progress
- Topic history
- Voice intensity (for animations)

### 6. Calendar Modal (Shared Component)

**Components:**

- `ModalContainer` - Animated container for the modal
- `ModalHeader` - Header with title and close button
- `MonthNavigation` - Controls for navigating between months
- `CalendarGrid` - Grid of days with session indicators
- `SessionHistory` - List of session history items
- `ModalFooter` - Contains action buttons

**State Management:**

- Calendar days data
- Session history data
- Selected date

### 7. Bottom Navigation (Shared Component)

**Components:**

- `TabBar` - Container for navigation tabs
- `TabItem` - Individual tab with icon and label
- `FloatingActionButton` - Center button for quick actions

**State Management:**

- Active tab
- Quick action menu state

## Zustand Store Structure

### 1. User Store (`/store/userStore.ts`)

```typescript
interface UserState {
  name: string;
  streak: number;
  
  // Methods
  setName: (name: string) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
}
```

### 2. Theme Store (`/store/themeStore.ts`)

```typescript
interface ThemeState {
  theme: 'light' | 'dark';
  systemPreference: 'light' | 'dark';
  useSystemTheme: boolean;
  
  // Methods
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setUseSystemTheme: (use: boolean) => void;
}
```

### 3. Session Store (`/store/sessionStore.ts`)

```typescript
interface Topic {
  id: number;
  title: string;
  duration: number;
  active: boolean;
  transcript?: string;
}

interface Session {
  id: string;
  date: Date;
  duration: number;
  topics: Topic[];
  mood?: 'positive' | 'neutral' | 'negative';
  type: 'deep-exploration' | 'check-in' | 'skill-building';
}

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
  startSession: (type: string) => void;
  endSession: () => void;
  setSessionPhase: (phase: string, progress?: number) => void;
  setActiveState: (state: string) => void;
  addTopic: (topic: Partial<Topic>) => void;
  setCurrentTopic: (topicId: number) => void;
  setTopicProgress: (progress: number) => void;
  setUserVoiceIntensity: (intensity: number) => void;
  toggleTopicsPanel: () => void;
}
```

### 4. Insights Store (`/store/insightsStore.ts`)

```typescript
interface MoodEntry {
  id: number;
  date: Date;
  mood: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
  note?: string;
}

interface InsightsState {
  // Data
  moodEntries: MoodEntry[];
  
  // UI state
  selectedPeriod: 'week' | 'month' | 'year';
  currentMonth: string;
  selectedMood: string | null;
  
  // Methods
  addMoodEntry: (mood: string, note?: string) => void;
  setPeriod: (period: 'week' | 'month' | 'year') => void;
  setCurrentMonth: (month: string) => void;
  setSelectedMood: (mood: string | null) => void;
}
```

### 5. History Store (`/store/historyStore.ts`)

```typescript
interface HistoryItem {
  id: number;
  type: 'session' | 'life_event';
  title: string;
  time: string;
  duration?: number;
  topics?: string[];
  mood?: 'positive' | 'neutral' | 'negative';
  icon?: React.ReactNode;
}

interface HistoryState {
  // Data
  historyItems: HistoryItem[];
  
  // UI state
  activeTab: 'day' | 'week' | 'month' | 'year';
  selectedDate: Date;
  
  // Methods
  addHistoryItem: (item: Partial<HistoryItem>) => void;
  setActiveTab: (tab: 'day' | 'week' | 'month' | 'year') => void;
  setSelectedDate: (date: Date) => void;
}
```

## UI Components to Build

### Base UI Components (from React Native Reusables)

1. ✅`Text` - Typography component
2. ✅`Button` - Button component with variants
3. ✅`Card` - Card container with header, content, footer
4. ✅`Avatar` - User avatar component
5. ✅`Progress` - Progress bar component
6. ✅`Switch` - Toggle switch component
7. ✅`Select` - Dropdown select component
8. ✅`Dialog` - Modal dialog component
9. ✅`Tooltip` - Tooltip component

### Custom UI Components

1. `StatusBar` - Custom status bar for all screens
2. `BottomNavigation` - Tab navigation with floating action button
3. `WeeklyCalendar` - Calendar strip showing days of the week
4. `CalendarModal` - Full calendar modal with session history
5. `VoiceVisualization` - Voice interaction visualization with multiple states
6. `SessionCard` - Card for session suggestions and history
7. `TopicsList` - Expandable list of topics
8. `MoodSelector` - UI for selecting mood with emoji
9. `ProgressPhases` - Session progress visualization with phases
10. `QuickActionMenu` - Menu for quick actions

## Animation Conversions (Framer Motion to Reanimated)

### 1. Voice Visualization Animations

**Framer Motion (Original):**

```jsx
<motion.div
  className="absolute rounded-full border-2 border-primary"
  style={{ opacity: 0.7 }}
  initial={{ width: 100, height: 100 }}
  animate={{
    width: [100, 140, 100],
    height: [100, 140, 100],
    opacity: [0.7, 0.4, 0.7],
  }}
  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
/>
```

**Reanimated (Conversion):**

```jsx
const pulseAnim = useSharedValue(0);

useEffect(() => {
  pulseAnim.value = withRepeat(
    withTiming(1, { duration: 2000 }),
    -1,
    true
  );
}, []);

const animatedStyle = useAnimatedStyle(() => {
  const size = interpolate(
    pulseAnim.value,
    [0, 0.5, 1],
    [100, 140, 100]
  );
  
  const opacity = interpolate(
    pulseAnim.value,
    [0, 0.5, 1],
    [0.7, 0.4, 0.7]
  );
  
  return {
    width: size,
    height: size,
    opacity: opacity,
  };
});

return (
  <Animated.View
    style={[
      {
        position: 'absolute',
        borderRadius: 9999,
        borderWidth: 2,
        borderColor: theme.primary,
      },
      animatedStyle
    ]}
  />
);
```

### 2. Topics Panel Animation

**Framer Motion (Original):**

```jsx
<AnimatePresence>
  {topicsExpanded && (
    <motion.div
      className="px-6 pt-2 pb-4 bg-primary/10"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Content */}
    </motion.div>
  )}
</AnimatePresence>
```

**Reanimated (Conversion):**

```jsx
const animHeight = useSharedValue(0);
const animOpacity = useSharedValue(0);

useEffect(() => {
  if (topicsExpanded) {
    animHeight.value = withTiming(200, { duration: 300 });
    animOpacity.value = withTiming(1, { duration: 300 });
  } else {
    animHeight.value = withTiming(0, { duration: 300 });
    animOpacity.value = withTiming(0, { duration: 300 });
  }
}, [topicsExpanded]);

const animStyle = useAnimatedStyle(() => ({
  height: animHeight.value,
  opacity: animOpacity.value,
  overflow: 'hidden',
}));

return (
  <Animated.View 
    style={[
      { 
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 16,
        backgroundColor: 'rgba(138, 107, 193, 0.1)',
      },
      animStyle
    ]}
  >
    {/* Content */}
  </Animated.View>
);
```

## Implementation Timeline with Detailed Tasks

### Phase 1: Foundation and Shared Components (2 days)

**Day 1:**

1. Set up Zustand store structure
   ✅ Create userStore.ts
   ✅ Create themeStore.ts
   ✅ Create sessionStore.ts
   ✅ Create insightsStore.ts
   ✅ Create historyStore.ts

2. Create base UI components
   - StatusBar component
   - BottomNavigation component
   - Basic Card components
   - Button variants

**Day 2:**

1. Create animation utilities for Reanimated
   - Create animation hooks for common patterns
   - Set up voice visualization base components

2. Implement shared modal components
   - CalendarModal base structure
   - QuickActionMenu component

### Phase 2: Home and History Screens (2 days)

**Day 3:**

1. Implement Home Screen
   - StatusBar component
   - Header with streak counter
   - WeeklyCalendar component
   - SessionCards components
   - SuggestionsList component
   - Connect to userStore and sessionStore

**Day 4:**

1. Implement History Screen
   - StatusBar component
   - Header with tabs
   - DateSelector component
   - HistoryList component
   - HistoryCard components
   - Connect to historyStore

### Phase 3: Session Screen (3 days)

**Day 5:**

1. Implement Session Screen structure
   - SessionHeader component
   - ProgressVisualization component
   - CurrentFocusPanel component
   - TopicsPanel component

**Day 6:**

1. Implement Voice Visualization components
   - ListeningState animation
   - SpeakingState animation
   - ReflectingState animation

**Day 7:**

1. Complete Session Screen
   - Integrate all animations
   - Connect to sessionStore
   - Implement session flow logic

### Phase 4: Profile and Insights Screens (2 days)

**Day 8:**

1. Implement Profile Screen
   - StatusBar component
   - Header with close button
   - PremiumCard component
   - PersonalizeGrid component
   - SettingsList component
   - ThemeToggle component
   - Connect to userStore and themeStore

**Day 9:**

1. Implement Insights Screen
   - StatusBar component
   - Header with period selector
   - MoodSelector component
   - InsightsCards components
   - MonthSelector component
   - Connect to insightsStore

### Phase 5: Polish and Integration (2 days)

**Day 10:**

1. Integrate all screens with navigation
   - Set up Expo Router links
   - Implement deep linking
   - Test navigation flow

**Day 11:**

1. Final polish and optimization
   - Performance testing
   - Animation refinement
   - State management optimization
   - Cross-platform testing

## Technical Considerations

### React Native Reusables Implementation

For each shadcn/ui component, we'll create a React Native Reusables equivalent:

1. **Text Elements:**
   - Replace all HTML text elements with `Text` component
   - Apply proper styling using NativeWind classes

2. **Layout Components:**
   - Replace `div` with `View`
   - Use `ScrollView` for scrollable content
   - Use `FlatList` for optimized lists

3. **Interactive Elements:**
   - Replace `button` with `Pressable` or `TouchableOpacity`
   - Use React Native Reusables `Button` component with proper variants

4. **Form Elements:**
   - Use React Native Reusables `Switch`, `Select` components
   - Implement custom form controls where needed

### Animation Strategy

1. **Simple Animations:**
   - Use `Animated.View` with `useAnimatedStyle`
   - Create reusable animation hooks

2. **Complex Animations:**
   - Break down complex Framer Motion animations into smaller parts
   - Use `withTiming`, `withSpring`, and `withRepeat` for effects
   - Implement gesture handlers for interactive animations

3. **Shared Values:**
   - Use `useSharedValue` for animation values
   - Create derived values with `useDerivedValue`

### Responsive Design

1. **Device Adaptation:**
   - Use `Dimensions` API for responsive sizing
   - Create a responsive hook for window dimensions

2. **Platform Specifics:**
   - Use `Platform.select` for platform-specific styling
   - Implement safe area insets for notches and home indicators

3. **Layout Techniques:**
   - Use flexbox for flexible layouts
   - Implement percentage-based sizing where appropriate

## Conclusion

This detailed plan provides a comprehensive roadmap for converting the NextJS mockups to Expo React Native. By breaking down the implementation into specific components, stores, and animations, we can maintain code cleanliness and optimize for performance. The page-by-page approach with shared components will ensure consistency across the app while the Zustand state management will prevent prop drilling and unnecessary rerenders.
