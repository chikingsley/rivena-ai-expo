import React, { useState } from 'react';
import { User, Home, Clock, BarChart, Plus, Sun, Moon, ArrowRight, Flame } from 'lucide-react';

const RivenaHomeScreen = () => {
  const [selectedDay, setSelectedDay] = useState(2); // Tuesday selected
  const streakCount = 5; // 5-day streak
  
  // Days of the week
  const days = [
    { day: 'Su', date: '09', completed: false },
    { day: 'Mo', date: '10', completed: true },
    { day: 'Tu', date: '11', completed: false, current: true },
    { day: 'We', date: '12', completed: false },
    { day: 'Th', date: '13', completed: false },
    { day: 'Fr', date: '14', completed: false },
    { day: 'Sa', date: '15', completed: false }
  ];
  
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
  
  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: theme.background }}>
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
      <div className="p-4 flex justify-between items-center">
        {/* Streak counter */}
        <div className="flex items-center">
          <div 
            className="h-8 px-3 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${theme.accent}20` }}
          >
            <Flame size={16} color={theme.accent} />
            <span className="ml-1 font-bold" style={{ color: theme.accent }}>{streakCount}</span>
          </div>
        </div>
        
        {/* Centered greeting */}
        <div className="absolute left-0 right-0 flex flex-col items-center justify-center">
          <div className="text-lg font-semibold">Good Morning.</div>
          <div className="text-sm text-gray-500">March 11</div>
        </div>
        
        {/* Profile */}
        <div 
          className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
        >
          <User size={18} color={theme.text} />
        </div>
      </div>
      
      {/* Weekly Calendar */}
      <div className="px-4 py-2 flex justify-between">
        {days.map((day, index) => (
          <div 
            key={index}
            className={`flex flex-col items-center p-2 rounded-lg ${selectedDay === index ? 'border-2' : ''}`}
            style={{ 
              borderColor: selectedDay === index ? theme.primary : 'transparent',
              color: day.current ? theme.text : theme.textLight
            }}
          >
            <div className="text-sm">{day.day}</div>
            <div className="font-bold">{day.date}</div>
            {day.completed && (
              <div className="mt-1 text-xs">
                <div 
                  className="w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.primary }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="white"/>
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Session Cards */}
      <div className="px-4 py-2 flex space-x-4">
        {/* Morning Check-in Card */}
        <div 
          className="flex-1 rounded-xl p-4 flex flex-col shadow-sm"
          style={{ backgroundColor: theme.card }}
        >
          <div className="text-xl font-bold mb-1">Let's start your day</div>
          <div className="text-gray-500 text-sm mb-3">with morning reflection</div>
          <div className="mt-auto flex items-center justify-center">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${theme.primary}20` }}
            >
              <Sun size={24} color={theme.primary} />
            </div>
          </div>
        </div>
        
        {/* Evening Reflection Card */}
        <div 
          className="flex-1 rounded-xl p-4 flex flex-col shadow-sm"
          style={{ backgroundColor: theme.card }}
        >
          <div className="text-xl font-bold mb-1">Evening Reflection</div>
          <div className="text-gray-500 text-sm mb-3">Sum up your day</div>
          <div className="mt-auto flex items-center justify-center">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${theme.primary}20` }}
            >
              <Moon size={24} color={theme.primary} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Suggestions Section */}
      <div className="px-4 py-4">
        <div className="uppercase tracking-wider text-xs font-semibold mb-3" style={{ color: theme.textLight }}>
          Session Suggestions
        </div>
        
        {/* Suggestion Card */}
        <div 
          className="rounded-xl p-4 mb-3 shadow-sm"
          style={{ backgroundColor: theme.card }}
        >
          <div className="flex items-start">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
              style={{ backgroundColor: `${theme.primary}20` }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill={theme.primary}/>
                <circle cx="9" cy="10" r="2" fill={theme.primaryDark}/>
                <circle cx="15" cy="10" r="2" fill={theme.primaryDark}/>
                <path d="M12 16c-1.3 0-2.45-.65-3.13-1.65l-1.44.87C8.38 16.8 10.09 18 12 18c1.92 0 3.61-1.2 4.57-2.78l-1.43-.87C14.46 15.35 13.29 16 12 16z" fill={theme.primaryDark}/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500">Continuing from Monday</div>
              <div className="text-base font-semibold mb-1">Managing workplace anxiety</div>
              <div className="text-sm text-gray-500">15 min session • Deep Exploration</div>
            </div>
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.primary }}
            >
              <ArrowRight size={18} color="white" />
            </div>
          </div>
        </div>
        
        {/* Recent History */}
        <div 
          className="rounded-xl p-4 shadow-sm"
          style={{ backgroundColor: theme.card }}
        >
          <div className="flex items-center mb-2">
            <div className="flex-1 text-base font-semibold">Recent Sessions</div>
            <div className="text-sm" style={{ color: theme.primary }}>View All</div>
          </div>
          
          <div className="flex items-center py-2 border-b border-gray-100">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
              style={{ backgroundColor: `${theme.primary}20` }}
            >
              <Clock size={16} color={theme.primary} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Self-care strategies</div>
              <div className="text-xs text-gray-500">Monday • 15 min</div>
            </div>
          </div>
          
          <div className="flex items-center py-2">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
              style={{ backgroundColor: `${theme.primary}20` }}
            >
              <Clock size={16} color={theme.primary} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Work-life balance</div>
              <div className="text-xs text-gray-500">Sunday • 22 min</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation with solid container and cutout */}
      <div className="relative mt-auto">
        {/* Floating action button */}
        <div className="absolute left-0 right-0 -top-7 flex justify-center">
          <div 
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: theme.primary }}
          >
            <Plus size={24} color="white" />
          </div>
        </div>
        
        {/* Navigation container */}
        <div className="flex justify-between items-center px-8 py-4" style={{ backgroundColor: 'white' }}>
          <div className="flex flex-col items-center">
            <Home size={20} color={theme.primary} />
            <div className="text-xs mt-1 font-medium" style={{ color: theme.primary }}>Home</div>
          </div>
          
          <div className="flex flex-col items-center">
            <Clock size={20} color={theme.textLight} />
            <div className="text-xs mt-1" style={{ color: theme.textLight }}>History</div>
          </div>
          
          {/* Empty space for FAB */}
          <div className="w-14"></div>
          
          <div className="flex flex-col items-center">
            <BarChart size={20} color={theme.textLight} />
            <div className="text-xs mt-1" style={{ color: theme.textLight }}>Insights</div>
          </div>
          
          <div className="flex flex-col items-center">
            <User size={20} color={theme.textLight} />
            <div className="text-xs mt-1" style={{ color: theme.textLight }}>Profile</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RivenaHomeScreen;