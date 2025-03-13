import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { CalendarProvider, CalendarUtils, WeekCalendar, DateData } from 'react-native-calendars';
import { useThemeStore } from '@/store/themeStore';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

// Define constants for styling to avoid recreating objects
const DISABLED_LIGHT_COLOR = 'rgba(0,0,0,0.4)';
const DISABLED_DARK_COLOR = 'rgba(255,255,255,0.4)';
const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface WeeklyCalendarProps {
  onDateSelect?: (date: Date) => void;
  initialDate?: Date;
}

// Import the DayProps type from react-native-calendars
interface DayComponentProps {
  date?: DateData;
  state?: string;
  marking?: any;
  theme?: any;
  onPress?: (date: DateData) => void;
  onLongPress?: (date: DateData) => void;
}

export function WeeklyCalendar({ onDateSelect, initialDate = new Date() }: WeeklyCalendarProps) {
  const { theme } = useThemeStore();
  const today = CalendarUtils.getCalendarDateString(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(
    CalendarUtils.getCalendarDateString(initialDate)
  );
  
  // Handle date selection - Simplified date handling (Optimization 3)
  const handleDateSelect = useCallback((date: DateData) => {
    if (!date?.dateString) return;
    
    // Simplified date comparison - just compare strings for today's date
    const isInFuture = date.dateString > today;
    if (isInFuture) {
      console.log('Cannot select future date');
      return;
    }
    
    // Toggle selection logic simplified
    const newSelectedDate = date.dateString === selectedDate ? '' : date.dateString;
    setSelectedDate(newSelectedDate);
    
    if (onDateSelect) {
      // Convert to Date object only when needed for the callback
      if (newSelectedDate) {
        const [year, month, day] = newSelectedDate.split('-').map(Number);
        onDateSelect(new Date(year, month - 1, day));
      } else {
        onDateSelect(new Date()); // Send today's date when deselecting
      }
    }
  }, [selectedDate, onDateSelect, today]);
  
  // Create marked dates object - Removed unused features (Optimization 4)
  const getMarkedDates = () => {
    const markedDates: { [key: string]: any } = {};
    
    // Add selected date styling
    if (selectedDate) {
      markedDates[selectedDate] = {
        selected: true,
        selectedColor: 'transparent',
        selectedTextColor: Colors[theme].foreground,
        customStyles: {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: Colors[theme].primary,
            borderRadius: 8,
          },
          text: {
            color: Colors[theme].foreground,
            fontWeight: 'bold'
          }
        }
      };
    }
    
    // Add today styling
    markedDates[today] = {
      ...markedDates[today],
      customStyles: {
        text: {
          fontWeight: 'bold',
          color: Colors[theme].foreground
        }
      }
    };
    
    return markedDates;
  };
  
  // Maximum date is today (can't select future)
  const maxDate = today;
  
  // Custom day component - Improved event handling (Optimization 5)
  const CustomDayComponent = (props: DayComponentProps) => {
    if (!props.date) return null;
    
    const { date, state, marking, onPress } = props;
    const isSelected = marking?.selected;
    const isDisabled = state === 'disabled';
    
    // Determine text color based on state - Optimized styling (Optimization 7)
    const textColor = isDisabled 
      ? theme === 'dark' ? DISABLED_DARK_COLOR : DISABLED_LIGHT_COLOR
      : Colors[theme].foreground;
    
    // Get day of week index
    const dayIndex = new Date(date.year, date.month - 1, date.day).getDay();
    
    return (
      <TouchableOpacity 
        style={styles.dayWrapper}
        onPress={() => onPress?.(date)}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        <View style={[
          styles.dayContainer,
          isSelected && {
            ...styles.selectedDayContainer,
            borderColor: Colors[theme].primary,
          }
        ]}>
          {/* Day of week */}
          <Text style={[styles.dayText, { color: textColor }]}>
            {DAY_NAMES[dayIndex]}
          </Text>
          
          {/* Day number */}
          <View style={styles.dayNumberContainer}>
            <Text style={[
              styles.dayNumberText, 
              { color: textColor },
              isSelected && { fontWeight: 'bold' }
            ]}>
              {date.day}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <CalendarProvider 
        date={selectedDate || today}
        onDateChanged={handleDateSelect}
        showTodayButton={false}
        disabledOpacity={0.6}
      >
        <WeekCalendar
          firstDay={0} // Start week on Sunday
          markedDates={getMarkedDates()}
          maxDate={maxDate}
          allowShadow={false}
          hideDayNames={true} // Hide default day names as we're using custom ones
          onDayPress={handleDateSelect}
          dayComponent={CustomDayComponent}
          style={styles.weekCalendar} // Add custom style
          theme={{
            backgroundColor: 'transparent',
            calendarBackground: 'transparent',
            textSectionTitleColor: Colors[theme].muted,
            selectedDayBackgroundColor: 'transparent', // No fill
            selectedDayTextColor: Colors[theme].foreground,
            todayTextColor: Colors[theme].foreground,
            dayTextColor: Colors[theme].foreground,
            textDisabledColor: theme === 'dark' ? DISABLED_DARK_COLOR : DISABLED_LIGHT_COLOR,
            dotColor: Colors[theme].primary,
            selectedDotColor: Colors[theme].primary,
            arrowColor: Colors[theme].primary,
            monthTextColor: Colors[theme].foreground,
            textDayFontSize: 16,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 14
          }}
        />
      </CalendarProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'transparent',
    marginTop: 10
  },
  weekCalendar: {
    height: 50, // Increased height for the calendar
    paddingBottom: 10 // Add bottom padding
  },
  dayWrapper: {
    height: 35, // Ensure enough height for the selection rectangle
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    height: 45,
    width: 40,
  },
  selectedDayContainer: {
    borderWidth: 2,
    borderColor: 'transparent', // Will be set dynamically based on theme
    borderRadius: 8,
    paddingBottom: 2, // Extra padding to ensure the border is fully visible
  },
  dayText: {
    fontSize: 12,
    marginBottom: 2, // Reduced margin
  },
  dayNumberContainer: {
    height: 24, // Fixed height for consistency
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumberText: {
    fontSize: 16,
  }
});
