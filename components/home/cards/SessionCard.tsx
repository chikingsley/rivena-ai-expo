import React from 'react';
import { Pressable, StyleSheet, Platform } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { Colors } from '@/constants/Colors';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SessionCardProps {
  title: string;
  subtitle: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

export function SessionCard({ title, subtitle, iconName, onPress }: SessionCardProps) {
  const { theme } = useThemeStore();
  
  return (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => [
        styles.cardWrapper,
        pressed && styles.pressed
      ]}
    >
      <View style={[
        styles.cardShadow,
        { backgroundColor: Colors[theme].background }
      ]}>
        <Card className="flex-1 rounded-xl overflow-hidden">
          <CardContent className="py-8 px-6 flex-col justify-center">
            <Text className="text-xl font-bold mb-1">{title}</Text>
            <Text className="text-muted-foreground text-sm mb-4">{subtitle}</Text>
            <View style={styles.iconContainer}>
              <View style={[
                styles.iconCircle, 
                { backgroundColor: Colors[theme].primaryLight }
              ]}>
                <Ionicons 
                  name={iconName} 
                  size={24} 
                  color={Colors[theme].primary} 
                />
              </View>
            </View>
          </CardContent>
        </Card>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
    maxWidth: '48%',
    transform: [{ translateY: 0 }],
  },
  pressed: {
    transform: [{ translateY: -4 }],
    opacity: 0.9,
  },
  cardShadow: {
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
      },
    }),
  }
});
