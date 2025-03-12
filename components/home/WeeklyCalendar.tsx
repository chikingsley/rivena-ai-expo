import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, GestureResponderEvent, PanResponder, Animated } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { Colors } from '@/constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';

interface WeeklyCalendarProps {
  onDateSelect?: (date: Date) => void;
  initialDate?: Date;
}

interface DayInfo {
  day: string;
  date: string;
  dateObj: Date;
  completed: boolean;
  current: boolean;
}

export function WeeklyCalendar({ onDateSelect, initialDate = new Date() }: WeeklyCalendarProps) {
  const { theme } = useThemeStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate);
  const [days, setDays] = useState<DayInfo[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  
  // Generate days for the weekly calendar
  useEffect(() => {
    generateWeek(weekOffset);
  }, [weekOffset]);
  
  const generateWeek = (offset: number) => {
    const today = new Date();
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const generatedDays: DayInfo[] = [];
    
    // Get the start of the current week (Sunday)
    const startOfCurrentWeek = new Date(today);
    const currentDay = today.getDay();
    startOfCurrentWeek.setDate(today.getDate() - currentDay);
    
    // Apply the week offset
    const startOfWeek = new Date(startOfCurrentWeek);
    startOfWeek.setDate(startOfCurrentWeek.getDate() + (offset * 7));
    
    // Generate 7 days for the week
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const dayInfo: DayInfo = {
        day: dayNames[i],
        date: date.getDate().toString().padStart(2, '0'),
        dateObj: date,
        completed: date < today, // Mark days before today as completed
        current: date.toDateString() === today.toDateString() // Mark today as current
      };
      
      generatedDays.push(dayInfo);
    }
    
    setDays(generatedDays);
  };
  
  // Configure pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        // Threshold for considering it a swipe
        const threshold = 100;
        
        if (gestureState.dx > threshold) {
          // Swipe right (go to previous week)
          Animated.spring(translateX, {
            toValue: 300,
            useNativeDriver: true,
            tension: 40,
            friction: 8
          }).start(() => {
            translateX.setValue(0);
            setWeekOffset(weekOffset - 1);
          });
        } else if (gestureState.dx < -threshold) {
          // Swipe left (go to next week, only if not future week)
          if (weekOffset < 0) {
            Animated.spring(translateX, {
              toValue: -300,
              useNativeDriver: true,
              tension: 40,
              friction: 8
            }).start(() => {
              translateX.setValue(0);
              setWeekOffset(weekOffset + 1);
            });
          } else {
            // Snap back if trying to go to future weeks
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              tension: 50,
              friction: 7
            }).start();
          }
        } else {
          // Not enough movement, snap back
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7
          }).start();
        }
      }
    })
  ).current;
  
  // Handle date selection
  const handleDateSelect = (index: number) => {
    const selectedDay = days[index];
    const today = new Date();
    const maxFutureDate = new Date();
    maxFutureDate.setDate(today.getDate() + 7);
    
    // Can't select future dates beyond a week
    if (selectedDay.dateObj > maxFutureDate) {
      return;
    }
    
    // Toggle selection
    if (selectedDate && selectedDay.dateObj.toDateString() === selectedDate.toDateString()) {
      setSelectedDate(null);
      if (onDateSelect) {
        onDateSelect(null as any);
      }
    } else {
      setSelectedDate(selectedDay.dateObj);
      if (onDateSelect) {
        onDateSelect(selectedDay.dateObj);
      }
    }
  };
  
  // Check if a date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  // Check if a date is selected
  const isSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };
  
  // Check if a date is in the future beyond the allowed range
  return (
    <Animated.View 
      style={[styles.container, { backgroundColor: 'transparent', transform: [{ translateX }] }]}
      {...panResponder.panHandlers}
    >
      <View style={styles.weekContainer}>
        {days.map((day, index) => {
          // Determine text color based on past, present, or future
          let textColor;
          if (day.current) {
            textColor = Colors[theme].foreground;
          } else if (day.completed) {
            textColor = Colors[theme].muted; // Light grey for past dates
          } else {
            // Darker grey for future dates
            textColor = theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
          }
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayContainer,
                selectedDate && day.dateObj.toDateString() === selectedDate.toDateString() && styles.selectedDay
              ]}
              onPress={() => handleDateSelect(index)}
            >
              <Text 
                style={[
                  styles.dayText, 
                  { color: textColor }
                ]}
              >
                {day.day}
              </Text>
              <Text 
                style={[
                  styles.dateText, 
                  { color: textColor },
                  day.current && styles.currentDateText
                ]}
              >
                {day.date}
              </Text>
              {day.completed && (
                <View style={[styles.completedIndicator, { backgroundColor: Colors[theme].primary }]}>
                  <Ionicons
                    name="checkmark"
                    size={10}
                    color="white"
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dayContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    position: 'relative',
  },
  selectedDay: {
    borderWidth: 2,
    borderColor: Colors.light.primary, // Using primary color from theme
  },
  dayText: {
    fontSize: 14,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
  },
  currentDateText: {
    fontWeight: 'bold',
  },
  completedIndicator: {
    marginTop: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.primary, // Using primary color from theme
    justifyContent: 'center',
    alignItems: 'center',
  },
});
