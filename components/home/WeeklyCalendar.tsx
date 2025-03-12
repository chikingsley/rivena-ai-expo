import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { CalendarProvider, CalendarUtils, WeekCalendar, DateData } from 'react-native-calendars';
import { useThemeStore } from '@/store/themeStore';
import { Colors } from '@/constants/Colors';

interface WeeklyCalendarProps {
  onDateSelect?: (date: Date) => void;
  initialDate?: Date;
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
        onDateSelect(null as any);
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
      
      completedDates[dateString] = {
        marked: true,
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
        selectedColor: 'transparent',
        selectedTextColor: Colors[theme].foreground,
        customStyles: {
          container: {
            borderWidth: 2,
            borderColor: Colors[theme].primary,
            borderRadius: 8
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
          hideDayNames={false}
          onDayPress={handleDateSelect}
          theme={{
            backgroundColor: 'transparent',
            calendarBackground: 'transparent',
            textSectionTitleColor: Colors[theme].muted,
            selectedDayBackgroundColor: 'transparent',
            selectedDayTextColor: Colors[theme].foreground,
            todayTextColor: Colors[theme].foreground,
            dayTextColor: Colors[theme].foreground,
            textDisabledColor: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
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
    minHeight: 120, // Minimum height for the calendar
    backgroundColor: 'transparent'
  }
});
