import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { useThemeStore } from '@/store/themeStore';
import { Colors } from '@/constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';

interface InsightCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
}

const InsightCard: React.FC<InsightCardProps> = ({ title, value, icon, color }) => {
  const { theme } = useThemeStore();
  
  return (
    <View style={[styles.card, { backgroundColor: Colors[theme].card }]}>
      <View style={[styles.iconContainer, { backgroundColor: color || Colors[theme].primaryLight }]}>
        <Ionicons name={icon as any} size={24} color={Colors[theme].primary} />
      </View>
      <Text className="text-muted-foreground text-sm mt-2">{title}</Text>
      <Text className="text-foreground font-bold text-xl">{value}</Text>
    </View>
  );
};

export default function InsightsScreen() {
  const { theme } = useThemeStore();
  
  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={styles.header}>
        <Text className="text-foreground font-bold text-2xl">Insights</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text className="text-foreground font-semibold text-lg mb-2">This Week</Text>
          <View style={styles.cardsContainer}>
            <InsightCard 
              title="Sessions" 
              value="12" 
              icon="calendar-outline" 
            />
            <InsightCard 
              title="Total Time" 
              value="3.5 hrs" 
              icon="time-outline" 
            />
            <InsightCard 
              title="Avg. Mood" 
              value="8.2" 
              icon="happy-outline" 
              color="rgba(255, 200, 100, 0.2)" 
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text className="text-foreground font-semibold text-lg mb-2">Trends</Text>
          <View style={[styles.trendCard, { backgroundColor: Colors[theme].card }]}>
            <Text className="text-foreground font-medium text-base">Mood Over Time</Text>
            <View style={styles.chartPlaceholder}>
              <Text className="text-muted-foreground text-center">Chart will appear here</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text className="text-foreground font-semibold text-lg mb-2">Top Topics</Text>
          <View style={[styles.topicsCard, { backgroundColor: Colors[theme].card }]}>
            <View style={styles.topicItem}>
              <View style={styles.topicDot} />
              <Text className="text-foreground flex-1">Work-life balance</Text>
              <Text className="text-muted-foreground">42%</Text>
            </View>
            <View style={styles.topicItem}>
              <View style={[styles.topicDot, { backgroundColor: Colors[theme].accent }]} />
              <Text className="text-foreground flex-1">Stress management</Text>
              <Text className="text-muted-foreground">28%</Text>
            </View>
            <View style={styles.topicItem}>
              <View style={[styles.topicDot, { backgroundColor: '#5FD068' }]} />
              <Text className="text-foreground flex-1">Relationships</Text>
              <Text className="text-muted-foreground">15%</Text>
            </View>
            <View style={styles.topicItem}>
              <View style={[styles.topicDot, { backgroundColor: '#FF6B6B' }]} />
              <Text className="text-foreground flex-1">Self-care</Text>
              <Text className="text-muted-foreground">10%</Text>
            </View>
            <View style={styles.topicItem}>
              <View style={[styles.topicDot, { backgroundColor: '#4D96FF' }]} />
              <Text className="text-foreground flex-1">Other</Text>
              <Text className="text-muted-foreground">5%</Text>
            </View>
          </View>
        </View>
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
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '31%',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendCard: {
    padding: 16,
    borderRadius: 12,
    // Neomorphic shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartPlaceholder: {
    height: 200,
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    borderRadius: 8,
  },
  topicsCard: {
    padding: 16,
    borderRadius: 12,
    // Neomorphic shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  topicDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#9C27B0',
    marginRight: 8,
  },
});