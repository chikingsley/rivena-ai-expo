import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { useThemeStore } from '@/store/themeStore';
import { Colors } from '@/constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Header } from '@/components/home/Header';

interface HistoryItemProps {
  title: string;
  time: string;
  duration: string;
  tags: string[];
  date?: string;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ title, time, duration, tags, date }) => {
  const { theme } = useThemeStore();
  
  return (
    <View style={[styles.historyItem, { backgroundColor: Colors[theme].card }]}>
      <View style={styles.iconContainer}>
        <Ionicons name="happy-outline" size={24} color={Colors[theme].primary} />
      </View>
      <View style={styles.contentContainer}>
        <Text className="text-foreground font-medium text-base">{title}</Text>
        <Text className="text-muted-foreground text-sm">{duration} • {tags.join(', ')}</Text>
      </View>
      <Text className="text-muted-foreground text-right">{date || time}</Text>
    </View>
  );
};

export default function HistoryScreen() {
  const { theme } = useThemeStore();
  
  const historyItems: HistoryItemProps[] = [
    {
      title: 'Morning reflection',
      time: '7:15 AM',
      duration: '12 min',
      tags: ['Self-care', 'Work preparation'],
    },
    {
      title: 'Your first day in therapy',
      time: '6:25 AM',
      duration: '',
      tags: ['LIFE EVENT'],
    },
    {
      title: 'Anxiety management',
      time: 'Yesterday',
      duration: '18 min',
      tags: ['Workplace stress', 'Breathing techniques'],
    },
    {
      title: 'Evening reflection',
      time: 'Monday',
      duration: 'min',
      tags: ['Daily achievements', 'Gratitude practice'],
    },
  ];
  
  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={styles.header}>
        <Text className="text-foreground font-bold text-2xl">History</Text>
      </View>
      
      <View style={styles.tabs}>
        <Text className="text-primary font-medium">Day</Text>
        <Text className="text-muted-foreground">Week</Text>
        <Text className="text-muted-foreground">Month</Text>
        <Text className="text-muted-foreground">Year</Text>
      </View>
      
      <Text className="text-foreground font-semibold text-xl mt-4 mb-2">Wednesday, Mar 12</Text>
      
      <ScrollView style={styles.scrollView}>
        {historyItems.map((item, index) => (
          <HistoryItem key={index} {...item} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  scrollView: {
    flex: 1,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    // Neomorphic shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(150, 150, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
});