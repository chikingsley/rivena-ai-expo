import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, ChevronDown, Calendar, Bookmark, ChevronUp, X, MoreVertical } from 'lucide-react';

const RivenaSessionScreen = () => {
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
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  
  // Theme colors
  const theme = {
    primary: '#8A6BC1', // Main purple
    primaryLight: '#B9A3DA', // Lighter purple
    primaryDark: '#5A4580', // Darker purple
    accent: '#F0C26E', // Gold/amber
    success: '#6BAA75', // Green
    background: '#F5F3FA', // Very light lavender
    card: '#FFFFFF', // White
    text: '#333333', // Dark gray
    textLight: '#8A8A8A' // Medium gray
  };
  
  // Topics covered in this session
  const [topicHistory, setTopicHistory] = useState([
    { id: 1, title: 'Week check-in', duration: 5, transcript: '...' },
    { id: 2, title: 'Meeting preparation', duration: 8, transcript: '...' },
    { id: 3, title: 'Managing Workplace Anxiety', duration: 14, active: true, transcript: '...' },
  ]);
  
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
  
  // Toggle calendar modal
  const toggleCalendarModal = () => {
    setShowCalendarModal(!showCalendarModal);
  };
  
  // Mock calendar data
  const calendarData = [
    { date: '2025-03-01', sessionType: 'check-in', duration: 10, topic: 'Initial Assessment' },
    { date: '2025-03-03', sessionType: 'deep-exploration', duration: 25, topic: 'Childhood Memories' },
    { date: '2025-03-05', sessionType: 'skill-building', duration: 15, topic: 'Breathing Techniques' },
    { date: '2025-03-08', sessionType: 'check-in', duration: 12, topic: 'Weekend Review' },
    { date: '2025-03-10', sessionType: 'deep-exploration', duration: 22, topic: 'Work Relationships' },
    { date: '2025-03-11', sessionType: 'deep-exploration', duration: 18, topic: 'Managing Workplace Anxiety', current: true },
  ];
  
  // Generate days for the calendar view
  const generateCalendarDays = () => {
    const days = [];
    const today = new Date(2025, 2, 11); // March 11, 2025 to match our mock data
    
    // Go back to the start of the month
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Add days from previous month to align with weekday
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevMonthDay = new Date(today.getFullYear(), today.getMonth(), -i);
      days.push({
        date: prevMonthDay,
        currentMonth: false,
        isToday: false,
        hasSession: false
      });
    }
    
    // Add days for current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), i);
      const dateString = date.toISOString().split('T')[0];
      const session = calendarData.find(s => s.date === dateString);
      
      days.push({
        date,
        currentMonth: true,
        isToday: date.getDate() === today.getDate(),
        hasSession: !!session,
        sessionType: session?.sessionType,
        sessionTopic: session?.topic,
        sessionDuration: session?.duration,
        current: session?.current
      });
    }
    
    return days;
  };
  
  const calendarDays = generateCalendarDays();
  
  return (
    <div className="relative flex flex-col h-screen" style={{ backgroundColor: theme.background }}>
      {/* Status bar */}
      <div className="w-full pt-2 px-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">06:51</div>
        <div className="flex items-center">
          <div className="mr-1">•••</div>
          <div className="mr-1">📶</div>
          <div>🔋</div>
        </div>
      </div>
      
      {/* Header */}
      <div className="px-6 pt-4 pb-3 flex items-center justify-between">
        <button className="p-2 rounded-full" style={{ backgroundColor: theme.lightAccent }}>
          <ArrowLeft className="w-5 h-5" style={{ color: theme.accent }} />
        </button>
        
        <div>
          <div className="flex items-center px-4 py-1.5 rounded-full" 
               style={{ backgroundColor: theme.lightAccent, color: theme.primary }}>
            <span className="font-medium">Deep Exploration</span>
            <ChevronDown className="ml-1 w-4 h-4" />
          </div>
        </div>
        
        <button className="p-2 rounded-full" style={{ backgroundColor: theme.lightAccent }} onClick={toggleCalendarModal}>
          <Calendar className="w-5 h-5" style={{ color: theme.primary }} />
        </button>
        
        {/* Session time in top right */}
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
                style={{ width: `${getSessionProgress()}%`, backgroundColor: theme.primary }}></div>
          </div>
          
          {/* Phase markers */}
          <div className="flex justify-between absolute top-0 left-0 right-0 -mt-1">
            <div className="h-4 w-4 rounded-full border-2" 
                 style={{ 
                   backgroundColor: sessionPhase === 'introduction' || true ? theme.primary : 'white',
                   borderColor: theme.primary 
                 }}></div>
            <div className="h-4 w-4 rounded-full border-2" 
                 style={{ 
                   backgroundColor: sessionPhase === 'exploration' ? theme.primary : 'white',
                   borderColor: theme.primary 
                 }}></div>
            <div className="h-4 w-4 rounded-full border-2" 
                 style={{ 
                   backgroundColor: sessionPhase === 'reflection' ? theme.primary : 'white',
                   borderColor: theme.primary 
                 }}></div>
            <div className="h-4 w-4 rounded-full border-2" 
                 style={{ 
                   backgroundColor: sessionPhase === 'closing' ? theme.primary : 'white',
                   borderColor: theme.primary 
                 }}></div>
          </div>
        </div>
        
        {/* Phase labels */}
        <div className="flex justify-between mt-2 text-xs" style={{ color: theme.text }}>
          <div className="text-center -ml-2">Intro</div>
          <div className="text-center font-medium" style={{ color: theme.primary }}>Exploration</div>
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
                  style={{ border: `2px solid ${theme.primary}`, opacity: 0.7 }}
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
                  style={{ border: `2px solid ${theme.primary}`, opacity: 0.5 }}
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
                  style={{ border: `2px solid ${theme.primary}`, opacity: 0.3 }}
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
                      <stop offset="0%" stopColor={theme.primary} stopOpacity="0.2" />
                      <stop offset="50%" stopColor={theme.primary} stopOpacity="1" />
                      <stop offset="100%" stopColor={theme.primary} stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  
                  {/* Base circle */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke={`${theme.primary}20`} 
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
              backgroundColor: theme.primary,
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
          style={{ backgroundColor: theme.card, borderTopLeftRadius: '1.5rem', borderTopRightRadius: '1.5rem' }}
          onClick={toggleTopics}
        >
          {/* Current focus content */}
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500 uppercase font-medium">Current Focus</div>
              <div className="flex items-center text-sm" style={{ color: theme.primary }}>
                <Clock className="w-3.5 h-3.5 mr-1" />
                <span>{formatTime(topicDuration, topicSeconds)}</span>
              </div>
            </div>
            <div className="font-semibold mt-1" style={{ color: theme.text }}>{currentTopic}</div>
            
            {/* Mini progress bar inside the focus section - now animated */}
            <div className="w-full h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div className="h-full rounded-full" 
                  style={{ width: `${topicProgress}%`, backgroundColor: theme.primary }}></div>
            </div>
          </div>
          
          {/* Topics toggle */}
          <div className="flex items-center justify-center border-t pt-2" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
            <span className="text-sm font-medium mr-1" style={{ color: theme.primary }}>Topics Covered</span>
            {topicsExpanded ? (
              <ChevronDown className="w-4 h-4" style={{ color: theme.primary }} />
            ) : (
              <ChevronUp className="w-4 h-4" style={{ color: theme.primary }} />
            )}
          </div>
        </div>
        
        {/* Expandable topics panel */}
        <AnimatePresence>
          {topicsExpanded && (
            <motion.div 
              className="px-6 pt-2 pb-4"
              style={{ backgroundColor: theme.card }}
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
                      backgroundColor: topic.active ? `${theme.primary}15` : 'white',
                      borderLeft: topic.active ? `3px solid ${theme.primary}` : '3px solid transparent'
                    }}
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium" style={{ color: topic.active ? theme.primary : theme.text }}>
                        {topic.title}
                      </div>
                      <div className="text-xs text-gray-500">{topic.duration} min</div>
                    </div>
                    
                    {topic.active && (
                      <div className="flex items-center">
                        <Bookmark className="w-4 h-4" style={{ color: theme.primary }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Home indicator */}
        <div className="flex justify-center py-4" style={{ backgroundColor: theme.card }}>
          <div className="w-32 h-1 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* Calendar Modal */}
      <AnimatePresence>
        {showCalendarModal && (
          <motion.div 
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white m-4 rounded-xl overflow-hidden shadow-xl w-full max-w-md"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              {/* Modal Header */}
              <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                <div className="text-lg font-semibold">Session Timeline</div>
                <button 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  onClick={toggleCalendarModal}
                  style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                >
                  <X size={16} />
                </button>
              </div>
              
              {/* Month Navigation */}
              <div className="px-4 py-2 flex justify-between items-center">
                <button className="p-1">
                  <ArrowLeft size={16} />
                </button>
                <div className="font-medium">March 2025</div>
                <button className="p-1">
                  <MoreVertical size={16} />
                </button>
              </div>
              
              {/* Calendar Grid */}
              <div className="px-4 py-2">
                {/* Day headers */}
                <div className="grid grid-cols-7 mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <div key={index} className="text-center text-xs text-gray-500">{day}</div>
                  ))}
                </div>
                
                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => (
                    <div 
                      key={index} 
                      className="relative aspect-square flex flex-col items-center justify-center rounded-lg"
                      style={{ 
                        backgroundColor: day.isToday ? `${theme.primary}20` : 'transparent',
                        opacity: day.currentMonth ? 1 : 0.3
                      }}
                    >
                      <div 
                        className={`w-7 h-7 flex items-center justify-center rounded-full ${day.current ? 'font-bold' : ''}`}
                        style={{ 
                          backgroundColor: day.current ? theme.primary : 'transparent',
                          color: day.current ? 'white' : day.isToday ? theme.primary : 'inherit'
                        }}
                      >
                        {day.date.getDate()}
                      </div>
                      
                      {day.hasSession && (
                        <div 
                          className="w-4 h-1 rounded-full mt-0.5"
                          style={{ 
                            backgroundColor: day.sessionType === 'deep-exploration' ? theme.primary : 
                                         day.sessionType === 'check-in' ? theme.accent : 
                                         theme.success
                          }}
                        ></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Session Details */}
              <div className="p-4 border-t" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                <div className="text-sm font-semibold mb-2">Session History</div>
                
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {calendarData.map((session, index) => (
                    <div 
                      key={index}
                      className="flex items-start p-2 rounded-lg"
                      style={{ 
                        backgroundColor: session.current ? `${theme.primary}10` : 'transparent',
                        borderLeft: session.current ? `3px solid ${theme.primary}` : 'none'
                      }}
                    >
                      <div 
                        className="w-2 h-2 mt-1.5 mr-2 rounded-full"
                        style={{ 
                          backgroundColor: session.sessionType === 'deep-exploration' ? theme.primary : 
                                       session.sessionType === 'check-in' ? theme.accent : 
                                       theme.success 
                        }}
                      ></div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div className="text-sm font-medium">{session.topic}</div>
                          <div className="text-xs text-gray-500">{session.duration} min</div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • 
                          {session.sessionType === 'deep-exploration' ? ' Deep Exploration' : 
                          session.sessionType === 'check-in' ? ' Check-in' : 
                          ' Skill Building'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="p-4 flex justify-between border-t" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                <button 
                  className="px-4 py-2 rounded-lg"
                  style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}
                >
                  Schedule Session
                </button>
                <button 
                  className="px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: theme.primary }}
                  onClick={toggleCalendarModal}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RivenaSessionScreen;