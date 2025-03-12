import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, ChevronDown, Calendar, Bookmark, ChevronUp } from 'lucide-react';

const TherapySessionUI = () => {
    const [activeState, setActiveState] = useState('listening'); // 'listening', 'speaking', 'reflecting'
    const [currentTopic, setCurrentTopic] = useState('Managing Workplace Anxiety');
    const [topicDuration, setTopicDuration] = useState(14); // minutes spent on current topic
    const [topicSeconds, setTopicSeconds] = useState(0); // seconds for the current topic timer
    const [sessionPhase, setSessionPhase] = useState('exploration'); // 'introduction', 'exploration', 'reflection', 'closing'
    const [phaseProgress, setPhaseProgress] = useState(60); // progress within current phase (percent)
    const [userVoiceIntensity, setUserVoiceIntensity] = useState(0.5);
    const [sessionTime, setSessionTime] = useState(35); // minutes elapsed in session
    const [sessionSeconds, setSessionSeconds] = useState(12); // seconds for session timer
    const [topicsExpanded, setTopicsExpanded] = useState(false);
    const [topicProgress, setTopicProgress] = useState(70); // progress in current topic (percent)

    // Topics covered in this session
    const [topicHistory, setTopicHistory] = useState([
        { id: 1, title: 'Week check-in', duration: 5, transcript: '...' },
        { id: 2, title: 'Meeting preparation', duration: 8, transcript: '...' },
        { id: 3, title: 'Managing Workplace Anxiety', duration: 14, active: true, transcript: '...' },
    ]);

    // Consistent theme color
    const theme = {
        bg: '#f7f9fc',
        accent: '#4a6fa5',
        text: '#2d3748',
        lightAccent: '#e2eaf4'
    };

    // Demo cycling through states
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveState(prev => {
                if (prev === 'listening') return 'speaking';
                if (prev === 'speaking') return 'reflecting';
                return 'listening';
            });
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    // Working timer for the session
    useEffect(() => {
        const interval = setInterval(() => {
            setSessionSeconds(prev => {
                if (prev === 59) {
                    setSessionTime(prevMin => prevMin + 1);
                    return 0;
                }
                return prev + 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Working timer for the topic
    useEffect(() => {
        const interval = setInterval(() => {
            setTopicSeconds(prev => {
                if (prev === 59) {
                    setTopicDuration(prevMin => prevMin + 1);
                    return 0;
                }
                return prev + 1;
            });

            // Update topic progress
            setTopicProgress(prev => {
                if (prev < 100) {
                    return prev + 0.05;
                }
                return prev;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Simulate dynamic voice intensity for listening state
    useEffect(() => {
        if (activeState === 'listening') {
            const intensityInterval = setInterval(() => {
                setUserVoiceIntensity(Math.random() * 0.7 + 0.3); // Random value between 0.3 and 1
            }, 150);

            return () => clearInterval(intensityInterval);
        }
    }, [activeState]);

    // Calculate total session progress based on phases
    const getSessionProgress = () => {
        const phases = {
            'introduction': { order: 0, weight: 15 },
            'exploration': { order: 1, weight: 50 },
            'reflection': { order: 2, weight: 25 },
            'closing': { order: 3, weight: 10 },
        };

        let progress = 0;

        // Add completed phases
        Object.entries(phases).forEach(([phase, data]) => {
            if (phases[sessionPhase].order > data.order) {
                progress += data.weight;
            }
        });

        // Add current phase progress
        progress += (phaseProgress / 100) * phases[sessionPhase].weight;

        return progress;
    };

    // Format time display
    const formatTime = (mins, secs) => {
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Toggle topics panel
    const toggleTopics = () => {
        setTopicsExpanded(!topicsExpanded);
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-900">
            <div className="relative w-full max-w-md h-full max-h-screen overflow-hidden rounded-3xl flex flex-col"
                style={{ backgroundColor: theme.bg, maxHeight: '800px' }}>

                {/* Header */}
                <div className="relative px-6 pt-6 pb-3 flex items-center">
                    <button className="p-2 rounded-full" style={{ backgroundColor: theme.lightAccent }}>
                        <ArrowLeft className="w-5 h-5" style={{ color: theme.accent }} />
                    </button>

                    <div className="flex-1 flex justify-center items-center">
                        <div className="flex items-center px-4 py-1.5 rounded-full"
                            style={{ backgroundColor: theme.lightAccent, color: theme.accent }}>
                            <span className="font-medium">Deep Exploration</span>
                            <ChevronDown className="ml-1 w-4 h-4" />
                        </div>
                    </div>

                    <div className="flex items-center">
                        <button className="p-2 rounded-full" style={{ backgroundColor: theme.lightAccent }}>
                            <Calendar className="w-5 h-5" style={{ color: theme.accent }} />
                        </button>
                    </div>

                    {/* Session time in top right - now animated */}
                    <div className="absolute top-0 right-0 mt-2 mr-3 text-xs text-gray-500">
                        {formatTime(sessionTime, sessionSeconds)}
                    </div>
                </div>

                {/* Combined Progress Visualization */}
                <div className="px-6 py-3">
                    {/* Phase progress bar */}
                    <div className="relative">
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full rounded-full"
                                style={{ width: `${getSessionProgress()}%`, backgroundColor: theme.accent }}></div>
                        </div>

                        {/* Phase markers */}
                        <div className="flex justify-between absolute top-0 left-0 right-0 -mt-1">
                            <div className="h-4 w-4 rounded-full border-2"
                                style={{
                                    backgroundColor: sessionPhase === 'introduction' || phases.introduction ? theme.accent : 'white',
                                    borderColor: theme.accent
                                }}></div>
                            <div className="h-4 w-4 rounded-full border-2"
                                style={{
                                    backgroundColor: sessionPhase === 'exploration' ? theme.accent : 'white',
                                    borderColor: theme.accent
                                }}></div>
                            <div className="h-4 w-4 rounded-full border-2"
                                style={{
                                    backgroundColor: sessionPhase === 'reflection' ? theme.accent : 'white',
                                    borderColor: theme.accent
                                }}></div>
                            <div className="h-4 w-4 rounded-full border-2"
                                style={{
                                    backgroundColor: sessionPhase === 'closing' ? theme.accent : 'white',
                                    borderColor: theme.accent
                                }}></div>
                        </div>
                    </div>

                    {/* Phase labels */}
                    <div className="flex justify-between mt-2 text-xs" style={{ color: theme.text }}>
                        <div className="text-center -ml-2">Intro</div>
                        <div className="text-center font-medium" style={{ color: theme.accent }}>Exploration</div>
                        <div className="text-center">Reflection</div>
                        <div className="text-center -mr-2">Closing</div>
                    </div>
                </div>

                {/* Main voice UI area */}
                <div className="flex-grow flex items-center justify-center relative">
                    {/* Voice visualization - all modes have same size container */}
                    <div className="relative flex items-center justify-center w-80 h-80">
                        {/* AI Speaking visualization - rings only, no text */}
                        <AnimatePresence>
                            {activeState === 'speaking' && (
                                <>
                                    <motion.div
                                        className="absolute rounded-full"
                                        style={{ border: `2px solid ${theme.accent}`, opacity: 0.7 }}
                                        initial={{ width: 100, height: 100 }}
                                        animate={{
                                            width: [100, 140, 100],
                                            height: [100, 140, 100],
                                            opacity: [0.7, 0.4, 0.7]
                                        }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                    />
                                    <motion.div
                                        className="absolute rounded-full"
                                        style={{ border: `2px solid ${theme.accent}`, opacity: 0.5 }}
                                        initial={{ width: 160, height: 160 }}
                                        animate={{
                                            width: [160, 200, 160],
                                            height: [160, 200, 160],
                                            opacity: [0.5, 0.2, 0.5]
                                        }}
                                        transition={{ repeat: Infinity, duration: 2.7 }}
                                    />
                                    <motion.div
                                        className="absolute rounded-full"
                                        style={{ border: `2px solid ${theme.accent}`, opacity: 0.3 }}
                                        initial={{ width: 220, height: 220 }}
                                        animate={{
                                            width: [220, 260, 220],
                                            height: [220, 260, 220],
                                            opacity: [0.3, 0.1, 0.3]
                                        }}
                                        transition={{ repeat: Infinity, duration: 3.5 }}
                                    />
                                </>
                            )}
                        </AnimatePresence>

                        {/* Reflecting visualization - more compact with fixed dimensions */}
                        <AnimatePresence>
                            {activeState === 'reflecting' && (
                                <motion.div className="absolute" style={{ width: 240, height: 240 }}>
                                    <svg width="100%" height="100%" viewBox="0 0 100 100">
                                        <defs>
                                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor={theme.accent} stopOpacity="0.2" />
                                                <stop offset="50%" stopColor={theme.accent} stopOpacity="1" />
                                                <stop offset="100%" stopColor={theme.accent} stopOpacity="0.2" />
                                            </linearGradient>
                                        </defs>

                                        {/* Base circle */}
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            stroke={`${theme.accent}20`}
                                            strokeWidth="2"
                                        />

                                        {/* Animated arc */}
                                        <motion.circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            stroke="url(#lineGradient)"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            initial={{ strokeDasharray: "30 220" }}
                                            animate={{
                                                strokeDashoffset: [0, -251] // Full circle circumference is ~251
                                            }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 3,
                                                ease: "linear"
                                            }}
                                        />
                                    </svg>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Central circle - solid for all states */}
                        <motion.div
                            className="rounded-full z-10"
                            style={{
                                backgroundColor: theme.accent,
                                width: activeState === 'listening' ? `${80 * (1 + userVoiceIntensity * 0.3)}px` : '80px',
                                height: activeState === 'listening' ? `${80 * (1 + userVoiceIntensity * 0.3)}px` : '80px',
                            }}
                            animate={{
                                scale: activeState === 'listening' ? [1, 1 + userVoiceIntensity * 0.2, 1] : 1,
                                transition: { duration: 0.2 }
                            }}
                        />
                    </div>
                </div>

                {/* Bottom integrated section with current focus and topics toggle */}
                <div className="mt-auto">
                    {/* Current focus + topics toggle button - full width with curved top */}
                    <div
                        className="w-full px-6 pt-3 pb-3 flex flex-col cursor-pointer"
                        style={{ backgroundColor: theme.lightAccent, borderTopLeftRadius: '1.5rem', borderTopRightRadius: '1.5rem' }}
                        onClick={toggleTopics}
                    >
                        {/* Current focus content */}
                        <div className="mb-2">
                            <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-500 uppercase font-medium">Current Focus</div>
                                <div className="flex items-center text-sm" style={{ color: theme.accent }}>
                                    <Clock className="w-3.5 h-3.5 mr-1" />
                                    <span>{formatTime(topicDuration, topicSeconds)}</span>
                                </div>
                            </div>
                            <div className="font-semibold mt-1" style={{ color: theme.text }}>{currentTopic}</div>

                            {/* Mini progress bar inside the focus section - now animated */}
                            <div className="w-full h-1 bg-white rounded-full mt-2 overflow-hidden">
                                <div className="h-full rounded-full"
                                    style={{ width: `${topicProgress}%`, backgroundColor: theme.accent }}></div>
                            </div>
                        </div>

                        {/* Topics toggle */}
                        <div className="flex items-center justify-center border-t pt-2" style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
                            <span className="text-sm font-medium mr-1" style={{ color: theme.accent }}>Topics Covered</span>
                            {topicsExpanded ? (
                                <ChevronDown className="w-4 h-4" style={{ color: theme.accent }} />
                            ) : (
                                <ChevronUp className="w-4 h-4" style={{ color: theme.accent }} />
                            )}
                        </div>
                    </div>

                    {/* Expandable topics panel */}
                    <AnimatePresence>
                        {topicsExpanded && (
                            <motion.div
                                className="px-6 pt-2 pb-4"
                                style={{ backgroundColor: theme.lightAccent }}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {topicHistory.map((topic) => (
                                        <div
                                            key={topic.id}
                                            className="flex items-center p-2 rounded-lg transition-all cursor-pointer"
                                            style={{
                                                backgroundColor: topic.active ? `${theme.accent}15` : 'white',
                                                borderLeft: topic.active ? `3px solid ${theme.accent}` : '3px solid transparent'
                                            }}
                                        >
                                            <div className="flex-1">
                                                <div className="text-sm font-medium" style={{ color: topic.active ? theme.accent : theme.text }}>
                                                    {topic.title}
                                                </div>
                                                <div className="text-xs text-gray-500">{topic.duration} min</div>
                                            </div>

                                            {topic.active && (
                                                <div className="flex items-center">
                                                    <Bookmark className="w-4 h-4" style={{ color: theme.accent }} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Home indicator */}
                    <div className="flex justify-center py-4">
                        <div className="w-32 h-1 bg-gray-200 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Define phases for progress calculation
const phases = {
    'introduction': { complete: true },
    'exploration': { complete: false },
    'reflection': { complete: false },
    'closing': { complete: false }
};

export default TherapySessionUI;

/*To keep your code organized and maintainable, I recommend breaking it down into focused components with clear responsibilities. Here's how I'd structure it:

### Core Components

1. **TherapyHeader**
   - Props: `sessionType`, `sessionTime`, `onTypeChange`, `onCalendarClick`
   - Contains the back button, session type dropdown, and calendar

2. **SessionProgress**
   - Props: `currentPhase`, `phaseProgress`, `phases`
   - Handles the progress bar with intro/exploration/reflection/closing

3. **VoiceVisualizer**
   - Props: `activeState`, `userVoiceIntensity`
   - Manages all three visualization states (listening, speaking, reflecting)

4. **CurrentFocusPanel**
   - Props: `topic`, `duration`, `progress`, `topicsExpanded`, `onToggleTopics`
   - The combined bottom panel with current focus and topics toggle

5. **TopicsPanel**
   - Props: `topics`, `isExpanded`, `onTopicSelect`
   - The expandable list of covered topics

### State Management

For state management, you have a few options:

1. **Props Drilling**: Pass state down from parent components (simpler for smaller apps)
2. **Context API**: Create contexts for shared state (better for medium complexity)
3. **State Management Library**: Use Redux or Zustand for complex state (if needed)

### Reactivity vs. Hard-Coded Elements

**Reactive Elements:**
- Session time and topic duration
- Voice visualization state
- Topic progress
- Topics list
- Phase progress

**More Static Elements:**
- UI colors and theming
- Layout structure
- Animation timings

### Session Phase Transitions

For handling phase transitions, I recommend a hybrid approach:

**Option 1: LLM-Triggered Phase Changes**
- Give the LLM specific tools to update the UI state:
  ```javascript
  updateSession({
    phase: "exploration",
    topic: "Managing Workplace Anxiety",
    phaseProgress: 20
  })
  ```
- The LLM calls these functions when it detects a phase shift in the conversation

**Option 2: Keyword Detection**
- Have predefined keywords or phrases that signal phase transitions
- Example: "Let's start exploring that deeper" → Move to exploration phase
- This requires consistent language from the LLM

I would lean toward Option 1 (direct tooling) because:
1. It gives the LLM more precise control
2. It doesn't rely on rigid phrasing
3. You can abstract the technical details from the conversation

### Implementation Example

```jsx
// Example of the SessionProgress component
function SessionProgress({ currentPhase, phaseProgress, phases }) {
  const getSessionProgress = () => {
    // Calculate overall progress based on phases and weights
    // ...implementation
  };

  return (
    <div className="px-6 py-3">
      <div className="relative">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full" 
            style={{ 
              width: `${getSessionProgress()}%`, 
              backgroundColor: theme.accent 
            }}
          />
        </div>
        
    // Phase markers 
        <div className="flex justify-between absolute top-0 left-0 right-0 -mt-1">
          {Object.entries(phases).map(([phase, data]) => (
            <div 
              key={phase}
              className="h-4 w-4 rounded-full border-2"
              style={{ 
                backgroundColor: currentPhase === phase ? theme.accent : 'white',
                borderColor: theme.accent 
              }}
            />
          ))}
        </div>
      </div>
      
      // Phase labels 
      <div className="flex justify-between mt-2 text-xs">
        // Phase labels implementation
      </div>
    </div>
  );
}
```

This approach gives you clean, reusable components while maintaining the flexibility to update the UI based on the conversation flow.
*/