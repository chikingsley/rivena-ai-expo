import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

// UI Components
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Ionicons } from '@expo/vector-icons';

// Sample data for completed sessions
const SAMPLE_SESSIONS = [
  { id: '1', title: 'Morning Meditation', duration: '05:30', date: '2025-03-10', emotion: '😊' },
  { id: '2', title: 'Stress Relief', duration: '08:45', date: '2025-03-09', emotion: '😌' },
  { id: '3', title: 'Focus Session', duration: '12:20', date: '2025-03-08', emotion: '😌' },
  { id: '4', title: 'Sleep Preparation', duration: '07:15', date: '2025-03-07', emotion: '😊' },
  { id: '5', title: 'Quick Break', duration: '03:00', date: '2025-03-06', emotion: '😔' },
];

interface SessionCardProps {
  title: string;
  duration: string;
  date: string;
  emotion: string;
  onPress: () => void;
}

function SessionCard({ title, duration, date, emotion, onPress }: SessionCardProps) {
  // Format date for display
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Pressable onPress={onPress} className="mb-4">
      <Card className="bg-card/90 backdrop-blur-sm">
        <CardContent className="flex-row items-center justify-between py-4">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
              <Ionicons name="checkmark" size={18} className="text-primary" />
            </View>
            <View>
              <Text className="text-base font-medium text-foreground">{title}</Text>
              <Text className="text-sm text-muted-foreground">{formattedDate}</Text>
            </View>
          </View>
          
          <View className="flex-row items-center">
            <Text className="text-lg font-semibold text-primary mr-3">{duration}</Text>
            <Text className="text-xl">{emotion}</Text>
          </View>
        </CardContent>
      </Card>
    </Pressable>
  );
}

export default function SessionsScreen() {
  const insets = useSafeAreaInsets();
  
  return (
    <View className="flex-1 bg-background">
      <View 
        className="flex-1 px-4"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Animated.View 
          entering={FadeIn.duration(500)}
          className="py-6"
        >
          {/* Header */}
          <View className="items-center mb-6">
            <Text className="text-2xl font-bold text-foreground">Completed Sessions</Text>
            <Text className="text-base text-muted-foreground text-center px-6 mt-1">
              View your meditation and voice AI history
            </Text>
          </View>
          
          {/* Session Stats */}
          <Card className="mb-6 bg-primary/5">
            <CardContent className="flex-row justify-around py-4">
              <View className="items-center">
                <Text className="text-sm text-muted-foreground">Total Sessions</Text>
                <Text className="text-2xl font-bold text-foreground">{SAMPLE_SESSIONS.length}</Text>
              </View>
              <View className="items-center">
                <Text className="text-sm text-muted-foreground">Total Time</Text>
                <Text className="text-2xl font-bold text-foreground">36:50</Text>
              </View>
              <View className="items-center">
                <Text className="text-sm text-muted-foreground">Avg. Mood</Text>
                <Text className="text-2xl">😊</Text>
              </View>
            </CardContent>
          </Card>
          
          {/* Sessions List */}
          <ScrollView 
            showsVerticalScrollIndicator={false}
            className="flex-1"
          >
            {SAMPLE_SESSIONS.map((session) => (
              <Animated.View 
                key={session.id}
                entering={FadeInDown.duration(400).delay(parseInt(session.id) * 100)}
              >
                <SessionCard
                  title={session.title}
                  duration={session.duration}
                  date={session.date}
                  emotion={session.emotion}
                  onPress={() => console.log(`Session ${session.id} pressed`)}
                />
              </Animated.View>
            ))}
            
            <View className="h-10" />
          </ScrollView>
        </Animated.View>
      </View>
    </View>
  );
}
