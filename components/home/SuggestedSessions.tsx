import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { Colors } from '@/constants/Colors';
import { Text } from '@/components/ui/text';
import { SuggestedSessionCard } from './cards/SuggestedSessionCard';

// Define the suggestion data structure
interface SessionSuggestion {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: string;
  iconName: string;
  iconColor?: string;
}

// Sample data for suggested sessions
const SUGGESTED_SESSIONS: SessionSuggestion[] = [
  {
    id: '1',
    title: 'Managing workplace anxiety',
    description: 'Continuing from Monday',
    duration: '15 min',
    type: 'Deep Exploration',
    iconName: 'bulb-outline',
    iconColor: '#7C3AED' // Purple
  },
  {
    id: '2',
    title: 'Quick energy check-in',
    description: 'New session available',
    duration: '5 min',
    type: 'Vibe Check',
    iconName: 'sparkles',
    iconColor: '#F59E0B' // Amber
  },
  {
    id: '3',
    title: 'Mindfulness practice',
    description: 'Recommended for you',
    duration: '10 min',
    type: 'Skill Building',
    iconName: 'sunny',
    iconColor: '#10B981' // Emerald
  }
];

interface SuggestedSessionsProps {
  onSessionPress?: (session: SessionSuggestion) => void;
}

export function SuggestedSessions({ onSessionPress }: SuggestedSessionsProps) {
  const { theme } = useThemeStore();
  
  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <Text style={[
        styles.sectionTitle,
        { color: Colors[theme].text, textAlign: 'center' }
      ]}>
        SESSION SUGGESTIONS
      </Text>
      
      <View style={styles.cardsContainer}>
        {SUGGESTED_SESSIONS.map((session) => (
          <SuggestedSessionCard
            key={session.id}
            title={session.title}
            description={session.description}
            duration={session.duration}
            type={session.type}
            iconName={session.iconName as any}
            iconColor={session.iconColor || Colors[theme].primary}
            onPress={() => onSessionPress?.(session)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
    width: '100%', // Ensure the text container spans the full width for proper centering
  },
  cardsContainer: {
    gap: 0,
  }
});
