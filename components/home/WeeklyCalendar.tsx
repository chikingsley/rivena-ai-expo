import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { CalendarProvider, CalendarUtils, WeekCalendar, DateData } from 'react-native-calendars';
import { useThemeStore } from '@/store/themeStore';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

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
  
  // Format date string to Date object
  const formatDateString = (dateString: string): Date => {
    if (!dateString) return new Date(); // Return current date if dateString is undefined
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // Month is 0-indexed in Date constructor
  };
  
  // Handle date selection
  const handleDateSelect = useCallback((date: DateData) => {
    if (!date || !date.dateString) return; // Guard against undefined date
    
    const selectedDateObj = formatDateString(date.dateString);
    const todayDate = new Date();
    todayDate.setHours(23, 59, 59, 999); // Set to end of day for proper comparison
    
    // Can't select future dates
    if (selectedDateObj > todayDate) {
      console.log('Cannot select future date');
      return;
    }
    
    console.log('Date selected:', date.dateString);
    
    // Toggle selection if same date
    if (date.dateString === selectedDate) {
      setSelectedDate('');
      if (onDateSelect) {
        onDateSelect(new Date()); // Send today's date instead of null
      }
    } else {
      setSelectedDate(date.dateString);
      if (onDateSelect) {
        onDateSelect(selectedDateObj);
      }
    }
  }, [selectedDate, onDateSelect]);
  
  // Get completed dates (all dates before today)
  const getCompletedDates = () => {
    const completedDates: { [key: string]: any } = {};
    const todayDate = new Date();
    
    // Start from 30 days ago to include all possible completed dates in view
    for (let i = 30; i > 0; i--) {
      const date = new Date();
      date.setDate(todayDate.getDate() - i);
      const dateString = CalendarUtils.getCalendarDateString(date);
      
      // Skip some dates randomly to simulate incomplete days
      if (i % 3 === 0) continue;
      
      completedDates[dateString] = {
        marked: true,
        completed: true, // Custom property to track completion
        dotColor: Colors[theme].primary
      };
    }
    
    return completedDates;
  };
  
  // Create marked dates object for the calendar
  const getMarkedDates = () => {
    const markedDates: { [key: string]: any } = {
      ...getCompletedDates()
    };
    
    // Add selected date styling
    if (selectedDate) {
      markedDates[selectedDate] = {
        ...markedDates[selectedDate],
        selected: true,
        selectedColor: 'transparent', // No fill
        selectedTextColor: Colors[theme].foreground,
        customStyles: {
          container: {
            backgroundColor: 'transparent', // No fill
            borderWidth: 2,
            borderColor: Colors[theme].primary,
            borderRadius: 20, // Larger radius for a circle
            padding: 2 // Extra padding to make the circle larger
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
  
  // Get maximum date (today, can't select future)
  const maxDate = CalendarUtils.getCalendarDateString(new Date());
  
  // Custom day component
  const CustomDayComponent = (props: DayComponentProps) => {
    if (!props.date) return null;
    
    const { date, state, marking, onPress } = props;
    const isSelected = marking?.selected;
    const isCompleted = marking?.completed;
    const isDisabled = state === 'disabled';
    
    // Determine text color based on state
    const textColor = isDisabled 
      ? theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'
      : Colors[theme].foreground;
    
    // Day of week abbreviations
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const dayIndex = new Date(date.year, date.month - 1, date.day).getDay();
    
    // Handle press event to ensure selection works
    const handlePress = () => {
      if (onPress && date) {
        onPress(date);
      }
    };
    
    return (
      <View 
        style={styles.dayWrapper}
        onTouchEnd={handlePress}
      >
        <View style={[
          styles.dayContainer,
          isSelected && {
            ...styles.selectedDayContainer,
            borderColor: Colors[theme].primary, // Use current theme color
          }
        ]}>
          {/* Day of week */}
          <Text style={[styles.dayText, { color: textColor }]}>
            {dayNames[dayIndex]}
          </Text>
          
          {/* Day number or checkmark */}
          <View style={styles.dayNumberContainer}>
            {isCompleted ? (
              <Ionicons 
                name="checkmark" 
                size={16} 
                color={Colors[theme].primary} 
              />
            ) : (
              <Text style={[
                styles.dayNumberText, 
                { color: textColor },
                isSelected && { fontWeight: 'bold' }
              ]}>
                {date.day}
              </Text>
            )}
          </View>
        </View>
      </View>
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
            textDisabledColor: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
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
    backgroundColor: 'transparent'
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
