import * as React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '@/store/themeStore';
import { Colors } from '@/constants/Colors';
import { WeeklyCalendar } from '@/components/home/WeeklyCalendar';
import { Header } from '@/components/home/Header';
import { SessionCard } from '@/components/home/cards/SessionCard';
import { SuggestedSessions } from '@/components/home/SuggestedSessions';



export default function Screen() {
  const { theme } = useThemeStore();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  
  // Handle date selection from calendar
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    console.log('Selected date:', date.toDateString());
    // Here you would typically fetch data for the selected date
  };
  
  // Handle session card press
  const handleSessionPress = (sessionType: string) => {
    console.log(`${sessionType} session pressed`);
    // Navigate to session screen or open session modal
  };
  
  // Handle suggested session press
  const handleSuggestedSessionPress = (session: any) => {
    console.log('Suggested session pressed:', session.title);
    // Navigate to session details or start session
  };
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      {/* Safe area padding for top */}
      <View style={{ height: insets.top }} />
      
      {/* Header */}
      <Header 
        streak={7}
        onProfilePress={() => console.log('Profile pressed')}
      />
      
      {/* Calendar Section */}
      <View style={styles.calendarSection}>
        <WeeklyCalendar 
          onDateSelect={handleDateSelect}
          initialDate={selectedDate}
        />
      </View>
      
      {/* Session Cards */}
      <View style={styles.sessionCardsContainer}>
        <SessionCard
          title="Morning Reflection"
          subtitle="Start your day mindfully"
          iconName="sunny"
          onPress={() => handleSessionPress('morning')}
        />
        <SessionCard
          title="Evening Wind Down"
          subtitle="Reflect on your day"
          iconName="moon"
          onPress={() => handleSessionPress('evening')}
        />
      </View>
      
      {/* Suggested Sessions */}
      <SuggestedSessions onSessionPress={handleSuggestedSessionPress} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarSection: {
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sessionCardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
});
